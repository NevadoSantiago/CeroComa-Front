import { useCallback, useEffect, useState, type FormEvent } from "react";
import { fetchOrders, type OrderSummary } from "../../api/admin";
import styles from "./AdminPage.module.css";

const TOKEN_KEY = "cerocoma_admin_token";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  PAID: "Pagada",
  FAILED: "Rechazada",
  EXPIRED: "Expirada",
};
const ars = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export function AdminPage() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (t: string) => {
    setLoading(true);
    setError(null);
    try {
      setOrders(await fetchOrders(t));
    } catch (e) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") {
        sessionStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setError("Contraseña incorrecta.");
      } else {
        setError("No se pudieron cargar las ventas.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem(TOKEN_KEY, password);
    setToken(password);
    setPassword("");
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setOrders([]);
  };

  if (!token) {
    return (
      <main className={styles.login}>
        <h1 className={styles.title}>Panel · CERO COMA</h1>
        <form onSubmit={onLogin} className={styles.loginForm}>
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña de admin"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button className={styles.cta} type="submit">
            Entrar
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  const paid = orders.filter((o) => o.status === "PAID");
  const revenue = paid.reduce((sum, o) => sum + o.totalAmount, 0);
  const entradasVendidas = paid.reduce((sum, o) => sum + o.quantity, 0);
  const ingresaron = paid.reduce((sum, o) => sum + o.admittedCount, 0);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ventas · CERO COMA</h1>
        <button className={styles.logout} onClick={logout}>
          Salir
        </button>
      </header>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span>{ars.format(revenue)}</span>
          <small>Recaudado</small>
        </div>
        <div className={styles.stat}>
          <span>{entradasVendidas}</span>
          <small>Entradas vendidas</small>
        </div>
        <div className={styles.stat}>
          <span>{ingresaron}</span>
          <small>Ingresaron</small>
        </div>
        <div className={styles.stat}>
          <span>{orders.length}</span>
          <small>Órdenes</small>
        </div>
      </div>

      {loading && <p className={styles.muted}>Cargando…</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Comprador</th>
              <th>Email</th>
              <th>Cant.</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Ingresaron</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.buyerName}</td>
                <td>{o.buyerEmail}</td>
                <td>{o.quantity}</td>
                <td>{ars.format(o.totalAmount)}</td>
                <td>
                  <span className={`${styles.badge} ${styles[o.status.toLowerCase()] ?? ""}`}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </span>
                </td>
                <td>
                  {o.admittedCount}/{o.quantity}
                </td>
                <td>{new Date(o.createdAt).toLocaleString("es-AR")}</td>
              </tr>
            ))}
            {!loading && orders.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.muted}>
                  Todavía no hay ventas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
