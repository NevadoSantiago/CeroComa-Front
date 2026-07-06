import { Link } from "react-router-dom";
import { CollageCanvas } from "../../components/CollageCanvas";
import styles from "./GaleriaPage.module.css";

export function GaleriaPage() {
  return (
    <div className={styles.page}>
      <Link to="/" className={styles.back}>
        ← CERO COMA
      </Link>
      <CollageCanvas />
    </div>
  );
}
