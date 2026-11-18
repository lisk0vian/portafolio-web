// Retrato con trama de puntos: lee la foto, la reduce a una rejilla y dibuja
// cada celda como un punto cuyo tamaño sigue la luminancia, en el color de
// tinta del tema. Si la foto no existe, el contenedor muestra su marcador.

import { onEvent } from "./store";

const CELL = 6;

export function initDither(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLCanvasElement>("canvas[data-dither-src]").forEach((canvas) => {
    const frame = canvas.closest<HTMLElement>("[data-dither-frame]");
    const img = new Image();
    img.decoding = "async";
    img.src = canvas.dataset.ditherSrc!;

    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx || !img.naturalWidth) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cols = Math.ceil(rect.width / CELL);
      const rows = Math.ceil(rect.height / CELL);
      const probe = document.createElement("canvas");
      probe.width = cols;
      probe.height = rows;
      const p = probe.getContext("2d", { willReadFrequently: true })!;
      // object-fit: cover sobre la rejilla.
      const s = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      p.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h);
      const px = p.getImageData(0, 0, cols, rows).data;

      const cs = getComputedStyle(document.documentElement);
      const ink = cs.getPropertyValue("--mg-ink").trim();
      const accent = cs.getPropertyValue("--mg-accent").trim();
      const dark = document.documentElement.dataset.theme !== "light";
      ctx.clearRect(0, 0, rect.width, rect.height);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          const lum = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255;
          // En oscuro, la luz es tinta; en claro, la sombra es tinta.
          const v = dark ? lum : 1 - lum;
          if (v < 0.08) continue;
          const r = (CELL / 2) * Math.min(1, v * 1.1);
          ctx.fillStyle = v > 0.82 ? accent : ink;
          ctx.globalAlpha = 0.35 + v * 0.65;
          ctx.fillRect(x * CELL + CELL / 2 - r, y * CELL + CELL / 2 - r, r * 2, r * 2);
        }
      }
      ctx.globalAlpha = 1;
    };

    img.addEventListener("load", () => {
      if (frame) frame.dataset.state = "ready";
      paint();
    });
    img.addEventListener("error", () => {
      if (frame) frame.dataset.state = "empty";
    });
    new ResizeObserver(() => paint()).observe(canvas);
    onEvent("mg:theme", paint);
    onEvent("mg:profile", paint);
  });
}
