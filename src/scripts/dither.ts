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
    img.crossOrigin = "anonymous"; // la foto viene del raw de GitHub (CORS *): sin esto el canvas queda bloqueado
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
      const dark = document.documentElement.dataset.theme !== "light";
      const lums = new Float32Array(cols * rows);
      for (let k = 0; k < lums.length; k++) {
        lums[k] = (0.2126 * px[k * 4] + 0.7152 * px[k * 4 + 1] + 0.0722 * px[k * 4 + 2]) / 255;
      }
      // Estira el contraste entre los percentiles 3 y 97: la foto (fondo oscuro, piel
      // en tonos medios) ocupa poco rango y sin esto el rostro se pierde en ambos temas.
      const sorted = Float32Array.from(lums).sort();
      const lo = sorted[Math.floor(sorted.length * 0.03)];
      const hi = Math.max(lo + 0.01, sorted[Math.floor(sorted.length * 0.97)]);
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = ink;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const lum = Math.min(1, Math.max(0, (lums[y * cols + x] - lo) / (hi - lo))) ** 0.85;
          // En oscuro, la luz es tinta; en claro, la sombra es tinta (como un grabado).
          const v = dark ? lum : 1 - lum;
          if (v < 0.06) continue;
          const r = (CELL / 2) * Math.min(1, 0.25 + v * 0.85);
          ctx.globalAlpha = 0.25 + v * 0.75;
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

    // Hover: una lupa circular muestra la foto real bajo el puntero.
    const reveal = frame?.querySelector<HTMLImageElement>("[data-dither-reveal]");
    if (frame && reveal) {
      const lens = (e: PointerEvent, radius: string) => {
        const b = frame.getBoundingClientRect();
        reveal.style.clipPath = `circle(${radius} at ${e.clientX - b.left}px ${e.clientY - b.top}px)`;
      };
      frame.addEventListener("pointerenter", (e) => lens(e, "clamp(70px, 28%, 120px)"));
      frame.addEventListener("pointermove", (e) => lens(e, "clamp(70px, 28%, 120px)"));
      frame.addEventListener("pointerleave", (e) => lens(e, "0px"));
    }
    onEvent("mg:theme", paint);
    onEvent("mg:profile", paint);
  });
}
