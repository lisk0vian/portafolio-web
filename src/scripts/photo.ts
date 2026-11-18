// Retrato: la foto se muestra en duotono (CSS) y una lupa circular revela el color
// bajo el puntero. En táctil, tocar alterna la foto completa a color.
export function initPhotoLens() {
  document.querySelectorAll<HTMLElement>("[data-photo-frame]").forEach((frame) => {
    const reveal = frame.querySelector<HTMLElement>("[data-photo-reveal]");
    if (!reveal) return;
    const R = "clamp(70px, 28%, 120px)";
    const at = (e: PointerEvent, radius: string) => {
      const b = frame.getBoundingClientRect();
      reveal.style.clipPath = `circle(${radius} at ${e.clientX - b.left}px ${e.clientY - b.top}px)`;
    };
    frame.addEventListener("pointermove", (e) => e.pointerType === "mouse" && at(e, R));
    frame.addEventListener("pointerenter", (e) => e.pointerType === "mouse" && at(e, R));
    frame.addEventListener("pointerleave", (e) => e.pointerType === "mouse" && at(e, "0px"));
    frame.addEventListener("click", (e) => {
      if ((e as PointerEvent).pointerType === "mouse") return;
      const open = frame.toggleAttribute("data-open");
      reveal.style.clipPath = open ? "circle(150% at 50% 40%)" : "circle(0px at 50% 40%)";
    });
  });
}
