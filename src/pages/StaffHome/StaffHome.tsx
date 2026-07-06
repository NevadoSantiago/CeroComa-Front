import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { fetchOrders } from "../../api/admin";
import styles from "./StaffHome.module.css";

const TOKEN_KEY = "cerocoma_admin_token";

export function StaffHome() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogin = async (e: FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError(null);
    try {
      // Valida la contraseña contra el back antes de dejar entrar.
      await fetchOrders(password);
      sessionStorage.setItem(TOKEN_KEY, password);
      setToken(password);
      setPassword("");
    } catch (err) {
      setError(
        err instanceof Error && err.message === "UNAUTHORIZED"
          ? "Contraseña incorrecta."
          : "No se pudo conectar.",
      );
    } finally {
      setChecking(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  };

  if (!token) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>CERO COMA</h1>
        <p className={styles.sub}>Acceso staff</p>
        <form className={styles.form} onSubmit={onLogin}>
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button className={styles.cta} type="submit" disabled={checking}>
            {checking ? "Verificando…" : "Iniciar sesión"}
          </button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>CERO COMA</h1>
      <nav className={styles.menu}>
        <Link className={styles.card} to="/puerta">
          <span className={styles.cardTitle}>Puerta</span>
          <span className={styles.cardDesc}>Escanear entradas</span>
        </Link>
        <Link className={styles.card} to="/admin">
          <span className={styles.cardTitle}>Ventas</span>
          <span className={styles.cardDesc}>Panel de compras</span>
        </Link>
      </nav>
      <button className={styles.logout} onClick={logout}>
        Cerrar sesión
      </button>
    </main>
  );
}
