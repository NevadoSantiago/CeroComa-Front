import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useImages } from "../hooks/useImages";
import { packCollage } from "../layout/packCollage";
import "./collage.css";

/**
 * Canvas toroidal: el collage se puede arrastrar infinitamente en cualquier
 * dirección y "envuelve" (al salir por un borde entrás por el opuesto), como un
 * globo terráqueo. El set es finito, así que el contenido se repite — pero el
 * movimiento es continuo, sin salto ni pared.
 */
export function CollageCanvas() {
  const { images } = useImages();
  const collage = useMemo(() => packCollage(images), [images]);
  const { width: W, height: H, items } = collage;

  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  // El pan vive en ref: se actualiza en cada pointermove sin re-render.
  const pan = useRef({ x: 0, y: 0 });
  const drag = useRef<{ px: number; py: number; bx: number; by: number } | null>(null);
  const [grabbing, setGrabbing] = useState(false);
  const [viewport, setViewport] = useState({ w: 0, h: 0 });

  // Medimos el viewport para saber cuántas copias del collage tapan la pantalla.
  useLayoutEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const measure = () => setViewport({ w: vp.clientWidth, h: vp.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(vp);
    return () => ro.disconnect();
  }, []);

  // Copias necesarias por eje para cubrir el viewport, +1 de colchón.
  const tilesX = W > 0 ? Math.ceil(viewport.w / W) + 1 : 1;
  const tilesY = H > 0 ? Math.ceil(viewport.h / H) + 1 : 1;

  // Grilla de tiles: depende solo de la cantidad de copias, no del pan.
  const tiles = useMemo(() => {
    const out: { i: number; j: number }[] = [];
    for (let j = 0; j < tilesY; j++) {
      for (let i = 0; i < tilesX; i++) out.push({ i, j });
    }
    return out;
  }, [tilesX, tilesY]);

  // Envuelve el pan en (-W, 0] x (-H, 0]: al cruzar un borde el offset salta un
  // tile entero y, como todos los tiles son idénticos, la costura no se ve.
  const applyTransform = () => {
    const world = worldRef.current;
    if (!world || W === 0 || H === 0) return;
    let tx = pan.current.x % W;
    if (tx > 0) tx -= W;
    let ty = pan.current.y % H;
    if (ty > 0) ty -= H;
    world.style.transform = `translate(${tx}px, ${ty}px)`;
  };

  // Reaplica tras cada render (cambio de tiles/viewport) para no perder posición.
  useLayoutEffect(applyTransform);

  const onPointerDown = (e: ReactPointerEvent) => {
    drag.current = { px: e.clientX, py: e.clientY, bx: pan.current.x, by: pan.current.y };
    viewportRef.current?.setPointerCapture(e.pointerId);
    setGrabbing(true);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    pan.current = {
      x: drag.current.bx + (e.clientX - drag.current.px),
      y: drag.current.by + (e.clientY - drag.current.py),
    };
    applyTransform();
  };

  const endDrag = (e: ReactPointerEvent) => {
    if (!drag.current) return;
    drag.current = null;
    viewportRef.current?.releasePointerCapture(e.pointerId);
    setGrabbing(false);
  };

  return (
    <div
      ref={viewportRef}
      className={`canvas-viewport${grabbing ? " is-grabbing" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div ref={worldRef} className="canvas-world">
        {tiles.map(({ i, j }) => (
          <div
            key={`${i}-${j}`}
            className="canvas-tile"
            style={{ width: W, height: H, transform: `translate(${i * W}px, ${j * H}px)` }}
          >
            {items.map((it) => (
              <img
                key={it.id}
                className="canvas-item"
                src={it.url}
                alt=""
                draggable={false}
                loading="lazy"
                decoding="async"
                style={{ left: it.x, top: it.y, width: it.w, height: it.h }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
