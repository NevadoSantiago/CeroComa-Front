import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import { admit, lookup, type CheckinResponse } from "../../api/checkin";
import styles from "./DoorScanner.module.css";

const TOKEN_KEY = "cerocoma_admin_token"; // misma contraseña que el panel
const READER_ID = "qr-reader";

export function DoorScanner() {
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );
  const [password, setPassword] = useState("");

  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logout = () => {
    sessionStorage.removeItem(TOKEN_KEY);
    setAdminToken(null);
    setResult(null);
    setScannedToken(null);
  };

  // La cámara está activa mientras estás logueado y no hay un resultado en pantalla.
  useEffect(() => {
    if (!adminToken || result) return;
    const scanner = new Html5Qrcode(READER_ID);
    let stopped = false;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => {
          if (stopped) return;
          stopped = true;
          setScannedToken(decoded);
          setBusy(true);
          setError(null);
          lookup(adminToken, decoded)
            .then((r) => {
              setResult(r);
              setCount(1);
            })
            .catch((e) => {
              if (e instanceof Error && e.message === "UNAUTHORIZED") logout();
              else setError("No se pudo leer la orden. Reintentá.");
            })
            .finally(() => setBusy(false));
        },
        () => {},
      )
      .catch(() => setError("No se pudo abrir la cámara. Dale permiso y recargá."));

    return () => {
      stopped = true;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {});
    };
  }, [adminToken, result]);

  const onLogin = (e: FormEvent) => {
    e.preventDefault();
    sessionStorage.setItem(TOKEN_KEY, password);
    setAdminToken(password);
    setPassword("");
  };

  const doAdmit = async () => {
    if (!scannedToken || !adminToken) return;
    setBusy(true);
    setError(null);
    try {
      setResult(await admit(adminToken, scannedToken, count));
      setCount(1);
    } catch (e) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") logout();
      else setError("No se pudo admitir. Reintentá.");
    } finally {
      setBusy(false);
    }
  };

  const rescan = () => {
    setResult(null);
    setScannedToken(null);
    setError(null);
  };

  if (!adminToken) {
    return (
      <main className={styles.login}>
        <h1 className={styles.title}>Puerta · CERO COMA</h1>
        <form onSubmit={onLogin} className={styles.loginForm}>
          <input
            className={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <button className={styles.cta} type="submit">
            Entrar
          </button>
        </form>
      </main>
    );
  }

  const paidOrder =
    result &&
    (result.result === "OK" ||
      result.result === "FULL" ||
      result.result === "INVALID_COUNT");

  return (
    <main className={styles.page}>
      <Link to="/staff" className={styles.menuLink}>
        ← Menú
      </Link>
      {/* El div de la cámara queda siempre montado; se oculta al mostrar un resultado. */}
      <div className={styles.scanArea} style={{ display: result ? "none" : "block" }}>
        <p className={styles.hint}>Apuntá al QR de la entrada</p>
        <div id={READER_ID} className={styles.reader} />
        {busy && <p className={styles.hint}>Leyendo…</p>}
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {result && (
        <div className={styles.result}>
          {result.result === "INVALID" && (
            <div className={`${styles.status} ${styles.bad}`}>QR inválido o inexistente</div>
          )}
          {result.result === "NOT_PAID" && (
            <div className={`${styles.status} ${styles.warn}`}>Esta orden no está paga</div>
          )}

          {paidOrder && (
            <>
              <div className={styles.buyer}>{result.buyerName}</div>
              <div className={styles.stats}>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{result.quantity}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNum}>{result.admittedCount}</span>
                  <span className={styles.statLabel}>Entraron</span>
                </div>
                <div className={`${styles.stat} ${styles.statHighlight}`}>
                  <span className={styles.statNum}>{result.remaining}</span>
                  <span className={styles.statLabel}>Faltan</span>
                </div>
              </div>

              {result.remaining > 0 ? (
                <div className={styles.admitBox}>
                  <div className={styles.stepper}>
                    <button
                      onClick={() => setCount((c) => Math.max(1, c - 1))}
                      aria-label="Menos"
                    >
                      −
                    </button>
                    <span>{count}</span>
                    <button
                      onClick={() => setCount((c) => Math.min(result.remaining, c + 1))}
                      aria-label="Más"
                    >
                      +
                    </button>
                  </div>
                  <button className={styles.admit} disabled={busy} onClick={doAdmit}>
                    Admitir {count}
                  </button>
                </div>
              ) : (
                <div className={`${styles.status} ${styles.ok}`}>
                  ✓ Completo — ingresaron todos
                </div>
              )}
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.rescan} onClick={rescan}>
            Escanear otro
          </button>
        </div>
      )}
    </main>
  );
}
