import { Link } from "react-router-dom";
import styles from "./PlaceholderPage.module.css";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        ← CERO COMA
      </Link>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.soon}>Próximamente</p>
    </main>
  );
}
