import { Header } from "../sections/Header/Header";
import { Nav } from "../sections/Nav/Nav";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  return (
    <div className={styles.page}>
      <Header />
      <Nav />
    </div>
  );
}
