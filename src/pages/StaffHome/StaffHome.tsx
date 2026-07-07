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
  const [showPassword, setShowPassword] = useState(false);
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
        <Link to="/" className={styles.logoLink} aria-label="Ir al inicio">
          <img className={styles.logo} src="/logo.svg" alt="Cero Coma" />
        </Link>
        <form className={styles.form} onSubmit={onLogin}>
          <div className={styles.passwordField}>
            <input
              className={styles.input}
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
            <button
              type="button"
              className={styles.toggle}
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M1 1l22 22" />
                  <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
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
