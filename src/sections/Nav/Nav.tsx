import { Link } from "react-router-dom";
import styles from "./Nav.module.css";

const ITEMS = [
  { to: "/entradas", label: "Entradas" },
  { to: "/menu", label: "Menú" },
  { to: "/lineup", label: "Lineup" },
  { to: "/galeria", label: "Galería" },
];

export function Nav() {
  return (
    <nav className={styles.nav} aria-label="Secciones">
      <ol className={styles.list}>
        {ITEMS.map((item, i) => (
          <li key={item.to} className={styles.item}>
            <Link to={item.to} className={styles.link}>
              <span className={styles.num}>{i + 1}</span>
              <span className={styles.label}>{item.label}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
