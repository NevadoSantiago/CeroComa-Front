import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Html5Qrcode } from "html5-qrcode";
import {
  admit,
  lookup,
  lookupByEmail,
  type CheckinResponse,
  type EmailMatch,
} from "../../api/checkin";
import styles from "./DoorScanner.module.css";

const TOKEN_KEY = "cerocoma_admin_token"; // misma contraseña que el panel
const READER_ID = "qr-reader";

export function DoorScanner() {
  const navigate = useNavigate();
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  );

  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [result, setResult] = useState<CheckinResponse | null>(null);
  const [count, setCount] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Tras admitir: muestra el tilde y vuelve al menú de staff.
  const [admitted, setAdmitted] = useState(false);
  // Ingreso manual por mail (fallback sin QR / si falla la cámara).
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [matches, setMatches] = useState<EmailMatch[] | null>(null);

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

  // Cuando se confirma la admisión, dejamos ver el tilde y volvemos al menú.
  useEffect(() => {
    if (!admitted) return;
    const t = setTimeout(() => navigate("/staff"), 1400);
    return () => clearTimeout(t);
  }, [admitted, navigate]);

  const doAdmit = async () => {
    if (!scannedToken || !adminToken) return;
    setBusy(true);
    setError(null);
    try {
      await admit(adminToken, scannedToken, count);
      setAdmitted(true);
    } catch (e) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") logout();
      else setError("No se pudo admitir. Reintentá.");
    } finally {
      setBusy(false);
    }
  };

  // Selecciona una orden encontrada por mail y la lleva a la misma vista de
  // resultado que el QR: de acá en adelante se admite con la lógica existente.
  const pickMatch = (m: EmailMatch) => {
    setMatches(null);
    setScannedToken(m.token);
    setResult({
      result: m.result,
      buyerName: m.buyerName,
      quantity: m.quantity,
      admittedCount: m.admittedCount,
      remaining: m.remaining,
    });
  };

  const searchEmail = async () => {
    const value = email.trim();
    if (!value || !adminToken) return;
    setBusy(true);
    setError(null);
    setMatches(null);
    try {
      const res = await lookupByEmail(adminToken, value);
      if (res.matches.length === 0) {
        setError("No hay compras pagas con ese mail.");
      } else if (res.matches.length === 1) {
        pickMatch(res.matches[0]);
      } else {
        setMatches(res.matches);
      }
    } catch (e) {
      if (e instanceof Error && e.message === "UNAUTHORIZED") logout();
      else setError("No se pudo buscar. Reintentá.");
    } finally {
      setBusy(false);
    }
  };

  const rescan = () => {
    setResult(null);
    setScannedToken(null);
    setError(null);
    setEmailOpen(false);
    setEmail("");
    setMatches(null);
  };

  // La puerta no tiene login propio: se entra desde el menú de staff (que ya
  // pidió la contraseña). Sin sesión, al menú a loguearse.
  if (!adminToken) {
    return <Navigate to="/staff" replace />;
  }

  if (admitted) {
    return (
      <main className={styles.page}>
        <div className={styles.success}>
          <svg className={styles.check} viewBox="0 0 52 52" aria-hidden="true">
            <circle className={styles.checkCircle} cx="26" cy="26" r="24" fill="none" />
            <path className={styles.checkMark} fill="none" d="M14 27l8 8 16-16" />
          </svg>
          <p className={styles.successText}>Ingresaron {count}</p>
        </div>
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

        <div className={styles.emailFallback}>
          {!emailOpen ? (
            <button
              type="button"
              className={styles.emailToggle}
              onClick={() => {
                setEmailOpen(true);
                setError(null);
              }}
            >
              ¿No tenés el QR? Ingresar por mail
            </button>
          ) : (
            <div className={styles.emailBox}>
              <input
                className={styles.emailInput}
                type="email"
                placeholder="Mail de la compra"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchEmail()}
                autoFocus
              />
              <button
                type="button"
                className={styles.emailSearch}
                disabled={busy}
                onClick={searchEmail}
              >
                Buscar
              </button>
            </div>
          )}

          {matches && (
            <ul className={styles.matchList}>
              {matches.map((m) => (
                <li key={m.token}>
                  <button
                    type="button"
                    className={styles.matchItem}
                    onClick={() => pickMatch(m)}
                  >
                    <span className={styles.matchName}>{m.buyerName}</span>
                    <span className={styles.matchMeta}>
                      {m.quantity} entrada(s) · faltan {m.remaining}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
