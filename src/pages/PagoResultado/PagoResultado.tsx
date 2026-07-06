import { Link } from "react-router-dom";
import styles from "./PagoResultado.module.css";

type Status = "exito" | "pendiente" | "error";

const COPY: Record<Status, { title: string; text: string }> = {
  exito: {
    title: "¡Gracias!",
    text: "Tu pago se está confirmando. Te enviamos el QR por mail apenas se acredite.",
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
      <h1 className={styles.title}>{copy.title}</h1>
      <p className={styles.text}>{copy.text}</p>
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
