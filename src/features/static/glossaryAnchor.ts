/** Offset fixed nav / footer when scrolling to in-page glossary targets. */
export const glossaryAnchorScrollSx = {
  scrollMarginTop: { xs: 72, sm: 88 },
  scrollMarginBottom: 72,
} as const;

function scrollTopOffsetPx(): number {
  return window.matchMedia('(max-width:600px)').matches ? 72 : 88;
}

export function scrollToGlossaryAnchor(id: string, behavior: ScrollBehavior = 'smooth') {
  const el = document.getElementById(id);
  if (!el) return false;

  const y = el.getBoundingClientRect().top + window.scrollY - scrollTopOffsetPx();
  window.scrollTo({ top: Math.max(0, y), behavior });

  const hash = `#${id}`;
  if (window.location.hash !== hash) {
    window.history.replaceState(null, '', hash);
  }
  return true;
}

/** Retry until layout is ready (accordions, grids) after route/hash navigation. */
export function scheduleGlossaryAnchorScroll(id: string, behavior: ScrollBehavior = 'auto') {
  let attempts = 0;
  const tryScroll = () => {
    if (scrollToGlossaryAnchor(id, behavior)) return;
    if (++attempts < 16) {
      window.requestAnimationFrame(tryScroll);
    }
  };
  tryScroll();
  window.setTimeout(() => scrollToGlossaryAnchor(id, behavior), 200);
}
