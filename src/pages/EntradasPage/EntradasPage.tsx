import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { createOrder } from "../../api/orders";
import styles from "./EntradasPage.module.css";

const EVENT = {
  date: "Sábado 18.07.2026",
  time: "Desde las 19 h",
  place: "Laprida 2400 · Florida",
};

// PLACEHOLDER: precio real a confirmar con el cliente.
const TICKET = { label: "Entrada general", price: 8000 };
const MAX_QTY = 10;

const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function EntradasPage() {
  const [qty, setQty] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = TICKET.price * qty;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { initPoint } = await createOrder({
        buyerName: name,
        buyerEmail: email,
        quantity: qty,
      });
      // Redirige al checkout de Mercado Pago.
      window.location.href = initPoint;
    } catch {
      setError("No pudimos iniciar el pago. Probá de nuevo en un momento.");
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>
        ← CERO COMA
      </Link>

      <h1 className={styles.title}>Entradas</h1>

      <dl className={styles.info}>
        <div className={styles.infoRow}>
          <dt>Fecha</dt>
          <dd>{EVENT.date}</dd>
        </div>
        <div className={styles.infoRow}>
          <dt>Hora</dt>
          <dd>{EVENT.time}</dd>
        </div>
        <div className={styles.infoRow}>
          <dt>Lugar</dt>
          <dd>{EVENT.place}</dd>
        </div>
      </dl>

      <section className={styles.ticket}>
        <div className={styles.ticketHead}>
          <span className={styles.ticketLabel}>{TICKET.label}</span>
          <span className={styles.ticketPrice}>{ars.format(TICKET.price)}</span>
        </div>

        <div className={styles.stepper}>
          <span className={styles.stepperLabel}>Cantidad</span>
          <div className={styles.stepperControls}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Quitar una entrada"
            >
              −
            </button>
            <span className={styles.qty}>{qty}</span>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))}
              aria-label="Agregar una entrada"
            >
              +
            </button>
          </div>
        </div>
      </section>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Nombre y apellido</span>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>

        <div className={styles.total}>
          <span>Total</span>
          <span className={styles.totalValue}>{ars.format(total)}</span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.cta} disabled={submitting}>
          {submitting
            ? "Redirigiendo…"
            : `Comprar ${qty > 1 ? `${qty} entradas` : "entrada"}`}
        </button>

        <p className={styles.note}>
          Te enviamos el QR por mail cuando se confirme el pago.
        </p>
      </form>
    </main>
  );
}
