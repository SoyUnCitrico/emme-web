# ==============================================================================
# Convierte los modelos decimados (OBJ + MTL + textura) a GLB + Draco con la
# textura comprimida y EMBEBIDA, listos para servir desde S3. PowerShell nativo
# (no necesita bash/WSL). ASCII puro para Windows PowerShell 5.1.
#
# Robusto ante exports de Meshy.ai (nombres de textura/mtl no normalizados):
#   - localiza la imagen de textura real (la mas grande de la carpeta),
#   - la comprime a <nombre>.jpg,
#   - genera un .mtl limpio que mapea el material del OBJ a esa textura,
#   - corrige el mtllib del .obj.
#
# Uso:
#   powershell -ExecutionPolicy Bypass -File scripts\build-models.ps1
#
# Estructura (dentro de scripts\):  models-src\<nombre>\<nombre>.obj  (+ mtl + imagen)
# Salida:                            models-out\<nombre>.glb
#
# Requisitos: Node (npx) e ImageMagick (winget install ImageMagick.ImageMagick).
# ==============================================================================
$ErrorActionPreference = 'Stop'

$names      = @('guitarrista', 'mascara', 'mazorca', 'milpa')
$texSize    = 1024
$texQuality = 82

$srcRoot = Join-Path $PSScriptRoot 'models-src'
$outRoot = Join-Path $PSScriptRoot 'models-out'

function Assert-Exit($what) {
  if ($LASTEXITCODE -ne 0) { throw "Fallo: $what (exit $LASTEXITCODE)" }
}

# Localiza magick.exe aunque winget no haya refrescado el PATH de esta sesion.
function Resolve-Magick {
  $cmd = Get-Command magick -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
              [Environment]::GetEnvironmentVariable('Path', 'User')
  $cmd = Get-Command magick -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $patterns = @(
    "$env:ProgramFiles\ImageMagick*\magick.exe",
    "${env:ProgramFiles(x86)}\ImageMagick*\magick.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\ImageMagick*\*\magick.exe"
  )
  foreach ($p in $patterns) {
    $hit = Get-ChildItem -Path $p -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($hit) { return $hit.FullName }
  }
  return $null
}

$magick = Resolve-Magick
if (-not $magick) {
  throw "No se encontro 'magick'. Cierra y reabre PowerShell tras instalar ImageMagick (winget install ImageMagick.ImageMagick)."
}
Write-Host "magick: $magick"

New-Item -ItemType Directory -Force -Path $outRoot | Out-Null

foreach ($n in $names) {
  $src    = Join-Path $srcRoot $n
  $jpg    = Join-Path $src "$n.jpg"
  $mtl    = Join-Path $src "$n.mtl"
  $obj    = Join-Path $src "$n.obj"
  $tmpGlb = Join-Path $outRoot "_tmp_$n.glb"
  $outGlb = Join-Path $outRoot "$n.glb"

  if (-not (Test-Path $obj)) { Write-Warning "Salto '$n' (no existe $obj)"; continue }
  Write-Host "--- $n ---"

  # 1) Localizar la textura real (imagen mas grande que no sea nuestra salida) y
  #    comprimir/redimensionar a <nombre>.jpg
  $texSrc = Get-ChildItem -Path $src -File -Recurse -ErrorAction SilentlyContinue |
    Where-Object { $_.Extension -match '^\.(png|jpe?g|webp)$' -and $_.Name -ne "$n.jpg" } |
    Sort-Object Length -Descending | Select-Object -First 1

  $hasTex = $false
  if ($texSrc) {
    & $magick $texSrc.FullName -resize "${texSize}x${texSize}>" -quality $texQuality $jpg
    Assert-Exit "magick $n"
    $hasTex = $true
  } else {
    Write-Warning "  Sin imagen de textura en $src (quedara sin textura)"
  }

  # 2) Leer el material que usa el OBJ (usemtl) y corregir su mtllib -> <nombre>.mtl
  $objLines = Get-Content $obj
  $umMatch  = $objLines | Select-String -Pattern '^\s*usemtl\s+(\S+)' | Select-Object -First 1
  $usemtl   = if ($umMatch) { $umMatch.Matches[0].Groups[1].Value } else { 'material_0' }

  if ($objLines | Select-String -Pattern '^\s*mtllib\s+' -Quiet) {
    $objLines = $objLines -replace '(?i)^\s*mtllib\s+.*$', "mtllib $n.mtl"
  } else {
    $objLines = , "mtllib $n.mtl" + $objLines
  }
  Set-Content -Encoding ascii -Path $obj -Value $objLines

  # 3) Generar un .mtl limpio que mapea ese material a nuestra textura
  $mtlLines = @("newmtl $usemtl", "Ka 1.000 1.000 1.000", "Kd 1.000 1.000 1.000", "d 1.0", "illum 1")
  if ($hasTex) { $mtlLines += "map_Kd $n.jpg" }
  Set-Content -Encoding ascii -Path $mtl -Value $mtlLines

  # 4) OBJ (+MTL+JPG) -> GLB (textura embebida) y comprimir geometria con Draco
  npx --yes obj2gltf -i $obj -o $tmpGlb
  Assert-Exit "obj2gltf $n"
  npx --yes gltf-pipeline -i $tmpGlb -o $outGlb -d --draco.compressionLevel=10
  Assert-Exit "gltf-pipeline $n"
  Remove-Item $tmpGlb -Force

  $mb   = [math]::Round((Get-Item $outGlb).Length / 1MB, 2)
  $note = if ($hasTex) { "textura: $($texSrc.Name)" } else { "SIN textura" }
  Write-Host "   $outGlb  ->  $mb MB  ($note)"
}

Write-Host ""
Write-Host "Listo. Revisa scripts\models-out\*.glb"
Write-Host ""
Write-Host "SUBIR A S3 (requiere AWS CLI configurado):"
Write-Host '  foreach ($n in "guitarrista","mascara","mazorca","milpa") {'
Write-Host '    aws s3 cp "scripts\models-out\$n.glb" "s3://amazons3-images-micel10/3dFiles/$n/$n.glb" --content-type model/gltf-binary --cache-control "public, max-age=31536000, immutable"'
Write-Host '  }'
