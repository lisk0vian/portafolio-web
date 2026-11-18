// Diagramas Mermaid de los casos: el HTML trae el texto fuente (legible sin JS)
// y aquí se cambia por SVG con los colores del tema; se repinta al cambiar el tema.
const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export async function renderDiagrams() {
  const nodes = [...document.querySelectorAll<HTMLElement>("pre[data-mermaid]")];
  if (!nodes.length) return;
  const sources = nodes.map((n) => n.textContent ?? "");
  const { default: mermaid } = await import("mermaid");

  let run = 0;
  const paint = async () => {
    const id = ++run;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      fontFamily: css("--font-mono") || "monospace",
      themeVariables: {
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
      },
    });
    for (const [i, node] of nodes.entries()) {
      try {
        const { svg } = await mermaid.render(`mg-diagram-${i}-${id}`, sources[i]);
        if (id !== run) return; // otro cambio de tema ya repintó
        const host = document.createElement("div");
        host.className = "mg-diagram flex justify-center [&_svg]:max-w-full [&_svg]:h-auto";
        host.setAttribute("role", "img");
        host.setAttribute("aria-label", node.closest("figure")?.querySelector("figcaption")?.textContent ?? "Diagram");
        host.innerHTML = svg;
        node.hidden = true;
        node.nextElementSibling?.classList.contains("mg-diagram") && node.nextElementSibling.remove();
        node.after(host);
      } catch (e) {
        console.warn("[diagram] se deja el texto fuente", e); // el <pre> sigue visible
      }
    }
  };

  await paint();
  new MutationObserver(() => void paint()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}
