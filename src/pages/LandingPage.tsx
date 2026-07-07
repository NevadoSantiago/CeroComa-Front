import { Link } from "react-router-dom";
import { Header } from "../sections/Header/Header";
import { Nav } from "../sections/Nav/Nav";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <Header />
      <Nav />
      <footer className={styles.footer}>
        <Link className={styles.staffLink} to="/staff" aria-label="Ingreso staff">
          <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 10V7a6 6 0 0 1 12 0v3m-13 0h14v10H5V10z"
            />
          </svg>
        </Link>
      </footer>
    </div>
  );
}
