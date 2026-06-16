# Web Emme 25

Portafolio personal de **Emmanuel Arenas** — una single-page con estética de **consola Matrix** (base verde oscuro + acentos naranja, tipografía monoespaciada) y una escena 3D interactiva en el hero. Construida con React 18 + TypeScript + Vite y desplegada en Vercel.

## Stack

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** — tema "Matrix console" con tokens propios (`matrix-*`, `neon-*`) y helpers de glow
- **Framer Motion** — animaciones y reveals por scroll (`useInView`)
- **React Three Fiber + drei + three.js** — escena 3D del hero
- **React Router v7** — rutas `lazy` con `createBrowserRouter`
- **@emailjs/browser** — formulario de contacto

## Comandos

```bash
npm run dev      # servidor de desarrollo en http://localhost:3000
npm run build    # type-check (tsc) + build de producción (vite)
npm run preview  # sirve el build de producción localmente
npm run lint     # eslint sobre src/**/*.{ts,tsx}
```

## Funcionalidades

### Navegación y rutas
- Dos rutas `lazy` tras un `<Suspense>` compartido: `/` (Home) y `/about` (About).
- `useSiteNav` es la única fuente de verdad de la navegación, compartida por Header y Footer: enlaces de ruta o scroll a secciones de Home (navegando a Home primero si estás en otra página, con `useHashScroll` para completar el scroll).

### Home
- **Hero 3D** (ver abajo), **Proyectos** (enlaces externos), **Contacto** (EmailJS) y **Media** (reproductor de audio).

### About (`/about`)
- Componentes **About** y **Skills**.
- **Foto con efecto ASCII**: al hacer hover, la imagen se transforma en arte ASCII generado por código (`AsciiImage`, muestreo de luminancia → glifos).
- **Barras de skills estilo terminal**: `[██████░░░░] 80%` en monoespaciada, con relleno animado.

### Escena 3D del hero (`components/Hero/`)
- **`SpaceScene`** compone 4 objetos cargados desde S3 como **GLB + Draco** (~0.1 MB c/u):
  - 2 únicos (`guitarrista`, `mascara`) y 2 **instanciados** (`mazorca`, `milpa`) vía `InstancedMesh` (se descargan una sola vez, una draw-call). Los modelos se **normalizan** a un tamaño consistente automáticamente.
  - **`Model.tsx`** es la única capa atada al formato (`useGLTF`); cambiar de formato solo toca ese archivo.
- **`WanderingCamera`** — la cámara deambula por una curva cerrada (Catmull-Rom) mirando al centro, sin controles de usuario.
- **Click = explosión** — los modelos se sustituyen por un `InstancedMesh` de partículas con paleta RGB que estallan desde cada objeto.
- **Placeholders generativos** (`Placeholder.tsx`) — si un modelo no carga (404/CORS), tarda, o `LOAD_MODELS` está apagado, se muestran 4 geometrías paramétricas definidas por fórmulas (supershape de Gielis, armónico esférico, toro torcido, esfera rippleada) con un **shader CRT/VHS** propio (paleta RGB de TV vieja: rojo/naranja en los únicos, azul/verde en los instanciados; scanlines, ruido estático, separación de canales y saltos de tracking).
- **Capas de ambiente**: `MatrixRain` (lluvia digital de fondo), `CursorParticles` (estela al mover el cursor sobre el hero) y `VhsOverlay` (estática + scanlines + barra de rolido a pantalla completa).
- `ModelBoundary` aísla cada carga: un fallo cae al placeholder generativo en vez de romper la escena.

## Estructura

- `src/components/<Componente>/` — cada componente en su carpeta con barrel `index.ts`.
- `src/hooks/` — `useSiteNav`, `useHashScroll`.
- `src/pages/` — `Home`, `About`.
- `src/styles/global.css` — clases compartidas (`btn-primary`, `card`, `section-title`, `matrix-input`…) y tokens del tema.

## Assets 3D (pipeline)

Los modelos viven en S3 (`https://amazons3-images-micel10.s3.us-east-2.amazonaws.com/3dFiles/<nombre>/<nombre>.glb`) con CORS habilitado.

`scripts/build-models.ps1` convierte los modelos decimados (OBJ + MTL + textura) a **GLB + Draco** con la textura comprimida y embebida, robusto ante los nombres de export de Meshy.ai:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-models.ps1
```

Localiza la textura real de cada carpeta, la comprime a ≤1024² JPG, genera un `.mtl` limpio, corrige el `.obj`, ejecuta `obj2gltf` + `gltf-pipeline -d` y deja los `.glb` listos para subir a S3. Resultado: de ~300 MB de OBJ a ~0.1 MB por modelo.

## Variables de entorno (Contacto)

```
VITE_APP_EMAILJS_SERVICE_ID
VITE_APP_EMAILJS_TEMPLATE_ID
VITE_APP_EMAILJS_PUBLIC_KEY
```

## Despliegue

Vercel (build `npm run build` → `dist/`).