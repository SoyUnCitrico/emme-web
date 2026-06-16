import { useEffect, useState } from 'react';

// Luminance ramp from darkest (space) to densest glyph.
const RAMP = ' .\'`^",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';

interface AsciiImageProps {
  src: string;
  alt: string;
  cols?: number;
}

/**
 * Renders an image that, on hover, cross-fades into a monospace ASCII rendering
 * of itself. The ASCII is computed once on load by sampling the (center-cropped,
 * square) image into a cols×rows grid and mapping luminance to glyph density.
 * Font size is expressed in container-query units so the grid fills the box.
 */
export default function AsciiImage({ src, alt, cols = 96 }: AsciiImageProps) {
  const [ascii, setAscii] = useState('');
  // Monospace cells are ~0.6 as wide as tall, so this keeps the output square.
  const rows = Math.round(cols * 0.6);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = cols;
      canvas.height = rows;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Center-crop to a square, then squash into the cols×rows grid.
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, cols, rows);

      const { data } = ctx.getImageData(0, 0, cols, rows);
      let out = '';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const lum = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255;
          out += RAMP[Math.min(RAMP.length - 1, Math.floor(lum * RAMP.length))];
        }
        out += '\n';
      }
      setAscii(out);
    };
  }, [src, cols, rows]);

  const fontSize = `${100 / (0.6 * cols)}cqw`;

  return (
    <div
      className="group relative w-full h-full overflow-hidden rounded-xl bg-matrix-black cursor-crosshair"
      style={{ containerType: 'inline-size' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
      />
      <pre
        aria-hidden="true"
        className="absolute inset-0 m-0 flex items-center justify-center overflow-hidden bg-matrix-black text-matrix-green text-glow-green select-none opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ fontSize, lineHeight: 1, whiteSpace: 'pre' }}
      >
        {ascii}
      </pre>
    </div>
  );
}
