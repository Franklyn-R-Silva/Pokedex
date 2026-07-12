// Efeito holográfico 3D: inclina o elemento seguindo o cursor e posiciona um
// brilho (glare). Usa custom properties lidas pelo CSS. Respeita
// prefers-reduced-motion (não faz nada se o usuário pediu menos movimento).
const reduce =
  typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export function applyTilt(el: HTMLElement, max = 12): void {
  if (reduce) return;

  const onMove = (event: PointerEvent): void => {
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width; // 0..1
    const py = (event.clientY - rect.top) / rect.height;
    el.style.setProperty('--tilt-rx', `${-(py - 0.5) * 2 * max}deg`);
    el.style.setProperty('--tilt-ry', `${(px - 0.5) * 2 * max}deg`);
    el.style.setProperty('--glare-x', `${px * 100}%`);
    el.style.setProperty('--glare-y', `${py * 100}%`);
    el.classList.add('is-tilting');
  };

  const reset = (): void => {
    el.classList.remove('is-tilting');
    el.style.removeProperty('--tilt-rx');
    el.style.removeProperty('--tilt-ry');
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', reset);
}
