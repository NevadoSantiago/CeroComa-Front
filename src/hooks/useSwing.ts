import { useEffect, useRef } from "react";

/**
 * Física de péndulo amortiguado para los pases del line up. El elemento rota
 * alrededor de su borde superior (transform-origin: top center, donde está el
 * clip de la credencial en la foto). Mientras el puntero está abajo, el pase
 * sigue el ángulo del dedo; al soltar, el resorte lo devuelve oscilando.
 * La primera vez que entra al viewport recibe un "empujón" de entrada.
 *
 * Devuelve `ref` para el elemento que rota (su padre define el pivote) y
 * `wasDrag` para distinguir arrastre de tap y cancelar el click del link.
 */
export function useSwing<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const wasDrag = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const pivotEl = el.parentElement ?? el;

    const STIFFNESS = 30; // constante del resorte (rad/s² por rad)
    const DAMPING = 2.2; // sub-amortiguado: oscila unas vueltas y se frena
    const MAX_ANGLE = 0.5; // ~28°, tope al arrastrar
    const ENTRY_KICK = -1.4; // velocidad angular al aparecer (rad/s)

    let angle = 0;
    let vel = 0;
    let dragging = false;
    let running = false;
    let raf = 0;
    let last = 0;
    let visible = false;

    let grabOffset = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let travel = 0;

    const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
    const apply = () => {
      el.style.transform = `rotate(${angle}rad)`;
    };

    const step = (t: number) => {
      const dt = Math.min((t - last) / 1000, 1 / 30);
      last = t;
      if (!dragging) {
        vel += (-STIFFNESS * angle - DAMPING * vel) * dt;
        angle += vel * dt;
        if (Math.abs(angle) < 0.001 && Math.abs(vel) < 0.01) {
          angle = 0;
          vel = 0;
          apply();
          running = false;
          return;
        }
      }
      apply();
      raf = requestAnimationFrame(step);
    };

    const wake = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    /** Ángulo del puntero respecto del pivote (centro-arriba del wrapper estático). */
    const pointerAngle = (x: number, y: number) => {
      const r = pivotEl.getBoundingClientRect();
      return Math.atan2(x - (r.left + r.width / 2), y - r.top);
    };

    const down = (e: PointerEvent) => {
      dragging = true;
      wasDrag.current = false;
      travel = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = performance.now();
      grabOffset = pointerAngle(e.clientX, e.clientY) - angle;
      el.setPointerCapture(e.pointerId);
      wake();
    };

    const move = (e: PointerEvent) => {
      if (!dragging) return;
      travel += Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (travel > 10) wasDrag.current = true;
      const now = performance.now();
      const dt = Math.max((now - lastT) / 1000, 1e-3);
      const next = clamp(pointerAngle(e.clientX, e.clientY) - grabOffset, -MAX_ANGLE, MAX_ANGLE);
      vel = 0.6 * vel + 0.4 * ((next - angle) / dt);
      angle = next;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = now;
    };

    const release = () => {
      if (!dragging) return;
      dragging = false;
      vel = clamp(vel, -4, 4);
      wake();
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", release);
    el.addEventListener("pointercancel", release);

    let io: IntersectionObserver | undefined;
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
      io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            // Empujón cada vez que el pase ENTRA a la pantalla (no solo la
            // primera): al scrollear entre bandas siempre aparece hamacándose.
            if (en.isIntersecting && !visible) {
              visible = true;
              vel = ENTRY_KICK;
              wake();
            } else if (!en.isIntersecting) {
              visible = false;
            }
          }
        },
        { threshold: 0.4 },
      );
      io.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf);
      io?.disconnect();
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", release);
      el.removeEventListener("pointercancel", release);
    };
  }, []);

  return { ref, wasDrag };
}
