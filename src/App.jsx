import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { BreadcrumbProvider } from "./contexts/BreadcrumbContext";
import { C } from "./styles/designTokens";
import Layout from "./components/layout/Layout";
import Login from "./modules/auth/pages/Login";
import Home from "./modules/home/pages/Home";
import Tables from "./modules/admin/pages/Tables";
import Dashboard from "./modules/admin/pages/Dashboard";
import Usuarios from "./modules/admin/pages/Usuarios";
import Cocineros from "./modules/staff/pages/Cocineros";
import MyOrder from "./modules/mesa/pages/MyOrder";
import MyOrders from "./modules/mesa/pages/MyOrders";
import MenuMesa from "./modules/mesa/pages/MenuMesa";
import MenuAdmin from "./modules/admin/pages/MenuAdmin";
import AdminUsers from "./modules/admin/pages/AdminUsers";
import CajeroPanel from "./modules/staff/pages/CajeroPanel";
import TaqueroPanel from "./modules/staff/pages/TaqueroPanel";
import MeseroPedidos from "./modules/staff/pages/MeseroPedidos";
import ErrorPage from "./modules/errors/ErrorPage";
import ResetPassword from "./modules/auth/pages/ResetPassword";
import Sitemap from './modules/admin/pages/Sitemap';
import Rockola from './modules/mesa/pages/Rockola';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg }}>
        <div style={{ width: "48px", height: "48px", border: `4px solid ${C.pink}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ECF0F1" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #E83E8C", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/403" replace />;
  return children;
};

const MeseroRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ECF0F1" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #E83E8C", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (user.rol !== "mesero" && user.rol !== "admin") return <Navigate to="/403" replace />;
  return children;
};

const CajeroRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ECF0F1" }}>
        <div style={{ width: "48px", height: "48px", border: "4px solid #E83E8C", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (user.rol !== "cajero" && user.rol !== "admin") return <Navigate to="/403" replace />;
  return children;
};

// Solo cocinero o admin
const CocineroRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ECF0F1",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "4px solid #E83E8C",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (user.rol !== 'taquero' && user.rol !== 'admin') return <Navigate to="/" />;
  return children;
};

// Redirige /menu al componente correcto según rol
const MenuRouter = () => {
  const { isAdmin } = useAuth();
  return isAdmin ? <MenuAdmin /> : <MenuMesa />;
};

function AppContent() {
  return (
    <Layout>
      <Routes>
        {/* Rutas de error */}
        <Route path="/403" element={<ErrorPage code={403} />} />
        <Route path="/500" element={<ErrorPage code={500} />} />

        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/sitemap" element={<Sitemap />} />

        {/* Rutas protegidas - solo ADMIN o Staff Autorizado */}
        <Route path="/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/users" element={<AdminRoute><Usuarios /></AdminRoute>} />
        <Route path="/tables" element={<MeseroRoute><Tables /></MeseroRoute>} />
        <Route path="/admin-users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/menu-admin" element={<AdminRoute><MenuAdmin /></AdminRoute>} />

        {/* Rutas protegidas - cualquier usuario autenticado */}
        <Route path="/menu" element={<PrivateRoute><MenuRouter /></PrivateRoute>} />
        <Route path="/Cocineros" element={<PrivateRoute><Cocineros /></PrivateRoute>} />
        <Route path="/my-order" element={<PrivateRoute><MyOrder /></PrivateRoute>} />
        <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
        <Route path="/orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
        <Route path="/rockola" element={<PrivateRoute><Rockola /></PrivateRoute>} />

        {/* Ruta para cajero */}
        <Route path="/cajero" element={<CajeroRoute><CajeroPanel /></CajeroRoute>} />

        {/* Nueva ruta para el panel del taquero (cocinero) */}
        <Route
          path="/taquero"
          element={
            <CocineroRoute>
              <TaqueroPanel />
            </CocineroRoute>
          }
        />

        {/* Ruta para la vista de pedidos de meseros */}
        <Route
          path="/mesero-pedidos"
          element={
            <PrivateRoute>
              <MeseroPedidos />
            </PrivateRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<ErrorPage code={404} />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <BreadcrumbProvider>
            <AppContent />
          </BreadcrumbProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;