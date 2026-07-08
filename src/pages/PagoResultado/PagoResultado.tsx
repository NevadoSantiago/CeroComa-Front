import { Link } from "react-router-dom";
import styles from "./PagoResultado.module.css";

type Status = "exito" | "pendiente" | "error";

const COPY: Record<Status, { title: string; text: string; note?: string }> = {
  exito: {
    title: "¡Pago confirmado!",
    text: "Tu pago se realizó con éxito. Tu entrada con el QR va a llegar a tu mail en unos minutos.",
    note: "¿No lo ves? Revisá la casilla de spam o promociones.",
  },
  pendiente: {
    title: "Pago pendiente",
    text: "Tu pago quedó pendiente. Cuando se acredite te mandamos el QR por mail.",
  },
  error: {
    title: "No se pudo completar el pago",
    text: "El pago no se concretó. Podés intentarlo de nuevo.",
  },
};

export function PagoResultado({ status }: { status: Status }) {
  const copy = COPY[status];
  return (
    <main className={styles.page}>
      <Link to="/" className={styles.logoLink} aria-label="Ir al inicio">
        <img className={styles.logo} src="/logo.svg" alt="Cero Coma" />
      </Link>
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.text}>{copy.text}</p>
      {copy.note && <p className={styles.note}>{copy.note}</p>}
      <div className={styles.actions}>
        {status === "error" && (
          <Link to="/entradas" className={styles.primary}>
            Volver a intentar
          </Link>
        )}
        <Link to="/" className={styles.secondary}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
