import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSwing } from "../../hooks/useSwing";
import styles from "./LineUpPage.module.css";

type Band = {
  id: string;
  name: string;
  time: string;
  img: string;
  instagram: string;
};

const BANDS: Band[] = [
  {
    id: "jose",
    name: "JOSÉ",
    time: "20",
    img: "/lineup/jose.webp",
    instagram: "https://instagram.com/josedezanzo",
  },
  {
    id: "manteca",
    name: "MANTECA",
    time: "21",
    img: "/lineup/manteca.webp",
    instagram: "https://instagram.com/mantecamusica",
  },
  {
    id: "ciclo-darwin",
    name: "CICLO DARWIN",
    time: "22",
    img: "/lineup/ciclo-darwin.webp",
    instagram: "https://instagram.com/ciclo.darwin",
  },
];

export function LineUpPage() {
  const mainRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState("");

  // Marca en el indicador lateral la banda que ocupa la pantalla.
  useEffect(() => {
    const sections = mainRef.current?.querySelectorAll("[data-band]");
    if (!sections?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) setActive((en.target as HTMLElement).dataset.band ?? "");
        }
      },
      { root: mainRef.current, threshold: 0.5 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <main ref={mainRef} className={styles.page}>
      <Link to="/" className={styles.back}>
        ← CERO COMA
      </Link>

      <section className={styles.intro}>
        <img
          className={styles.postcard}
          src="/lineup/portada.webp"
          alt="Line up — conocé a los artistas"
        />
        <span className={styles.hint} aria-hidden>
          ↓
        </span>
      </section>

      <div className={styles.bands}>
        {BANDS.map((band) => (
          <BandPass key={band.id} band={band} />
        ))}
      </div>

      <nav className={styles.times} aria-label="Horarios del line up">
        {BANDS.map((band) => (
          <button
            key={band.id}
            className={active === band.id ? styles.timeActive : styles.time}
            aria-label={`Ir a ${band.name}, ${band.time} hs`}
            // Salto instantáneo a propósito: el scroll suave se corta cuando la
            // barra del navegador se esconde (cambia el dvh a mitad de viaje) y
            // el snap devuelve a la sección anterior.
            onClick={() => document.getElementById(band.id)?.scrollIntoView()}
          >
            {band.time}
          </button>
        ))}
      </nav>
    </main>
  );
}

function BandPass({ band }: { band: Band }) {
  const { ref, wasDrag } = useSwing<HTMLAnchorElement>();
  return (
    <section id={band.id} data-band={band.id} className={styles.slide}>
      <span className={styles.rail} aria-hidden />
      <span className={styles.cord} aria-hidden />
      <div className={styles.hanger}>
        <a
          ref={ref}
          className={styles.pass}
          href={band.instagram}
          target="_blank"
          rel="noreferrer"
          aria-label={`${band.name}, ${band.time} hs — abrir Instagram`}
          onClick={(e) => {
            // Si el gesto fue un arrastre (hamacar el pase), no es un click.
            if (wasDrag.current) e.preventDefault();
          }}
        >
          <img src={band.img} alt="" width={1080} height={1350} draggable={false} />
        </a>
      </div>
    </section>
  );
}
