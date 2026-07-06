import styles from "./Header.module.css";
import heroCrowd from "../../assets/hero/hero-crowd.webp";
import heroRed from "../../assets/hero/hero-red.webp";

export function Header() {
  return (
    <header className={styles.header}>
      <p className={styles.wordmark}>CERO COMA</p>
      <div className={styles.photos}>
        <img
          className={styles.crowd}
          src={heroCrowd}
          alt="Público en un show de Cero Coma"
        />
        <img
          className={styles.red}
          src={heroRed}
          alt="Show de Cero Coma iluminado en rojo"
        />
      </div>
    </header>
  );
}
