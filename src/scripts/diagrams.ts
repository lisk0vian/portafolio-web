// Diagramas Mermaid de los casos: el HTML trae el texto fuente (legible sin JS) y aquí
// se cambia por SVG con los colores del tema. Mermaid (~700 KB) se descarga solo cuando
// un diagrama se acerca a la pantalla, así no bloquea la carga; se repinta al cambiar el tema.
type Mermaid = typeof import("mermaid").default;

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function themeVars() {
  return {
    background: css("--mg-paper-2"),
    primaryColor: css("--mg-paper"),
    primaryTextColor: css("--mg-ink"),
    primaryBorderColor: css("--mg-accent"),
    secondaryColor: css("--mg-paper-2"),
    tertiaryColor: css("--mg-paper-2"),
    lineColor: css("--mg-ink-2"),
    textColor: css("--mg-ink"),
    clusterBkg: css("--mg-paper-2"),
    clusterBorder: css("--mg-rule"),
    actorBkg: css("--mg-paper"),
    actorBorder: css("--mg-accent"),
    actorTextColor: css("--mg-ink"),
    signalColor: css("--mg-ink-2"),
    signalTextColor: css("--mg-ink"),
    noteBkgColor: css("--mg-paper"),
    noteTextColor: css("--mg-ink"),
  };
}

export async function renderDiagrams() {
  const nodes = [...document.querySelectorAll<HTMLElement>("pre[data-mermaid]")];
  if (!nodes.length) return;
  const sources = new Map(nodes.map((n) => [n, n.textContent ?? ""]));
  const drawn = new Set<HTMLElement>();
  let mermaid: Mermaid | null = null;
  let seq = 0;

  const load = async () => {
    if (mermaid) return mermaid;
    mermaid = (await import("mermaid")).default;
    return mermaid;
  };
  const draw = async (node: HTMLElement) => {
    const m = await load();
    m.initialize({ startOnLoad: false, securityLevel: "strict", theme: "base", fontFamily: css("--font-mono") || "monospace", themeVariables: themeVars() });
    try {
      const { svg } = await m.render(`mg-diagram-${++seq}`, sources.get(node)!);
      const host = document.createElement("div");
      host.className = "mg-diagram flex justify-center [&_svg]:max-w-full [&_svg]:h-auto";
      host.setAttribute("role", "img");
      host.setAttribute("aria-label", node.closest("figure")?.querySelector("figcaption")?.textContent ?? "Diagram");
      host.innerHTML = svg;
      if (node.nextElementSibling?.classList.contains("mg-diagram")) node.nextElementSibling.remove();
      node.hidden = true;
      node.after(host);
      drawn.add(node);
    } catch (e) {
      console.warn("[diagram] se deja el texto fuente", e); // el <pre> sigue visible
    }
  };

  // Mermaid no tolera renders simultáneos: se dibujan de uno en uno.
  let chain = Promise.resolve();
  const enqueue = (n: HTMLElement) => { chain = chain.then(() => draw(n)); };

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      enqueue(e.target as HTMLElement);
    }
  }, { rootMargin: "600px 0px" });
  nodes.forEach((n) => io.observe(n));

  // Al cambiar el tema solo se repintan los que ya estaban dibujados.
  new MutationObserver(() => drawn.forEach(enqueue)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
