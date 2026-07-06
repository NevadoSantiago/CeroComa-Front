import { Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { EntradasPage } from "./pages/EntradasPage/EntradasPage";
import { GaleriaPage } from "./pages/GaleriaPage/GaleriaPage";
import { PagoResultado } from "./pages/PagoResultado/PagoResultado";
import { PlaceholderPage } from "./pages/PlaceholderPage/PlaceholderPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/entradas" element={<EntradasPage />} />
      <Route path="/menu" element={<PlaceholderPage title="Menú" />} />
      <Route path="/lineup" element={<PlaceholderPage title="Lineup" />} />
      <Route path="/galeria" element={<GaleriaPage />} />
      <Route path="/about" element={<PlaceholderPage title="About" />} />
      <Route path="/pago/exito" element={<PagoResultado status="exito" />} />
      <Route path="/pago/pendiente" element={<PagoResultado status="pendiente" />} />
      <Route path="/pago/error" element={<PagoResultado status="error" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
