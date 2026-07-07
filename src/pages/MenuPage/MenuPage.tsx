import { Link } from "react-router-dom";
import styles from "./MenuPage.module.css";

export function MenuPage() {
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        ← CERO COMA
      </Link>
      <img className={styles.menu} src="/Menu.jpeg" alt="Menú de Cero Coma" />
    </main>
  );
}
