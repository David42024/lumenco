import { Routes, Route } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Catalog from "@/pages/Catalog";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import About from "@/pages/About";
import Shipping from "@/pages/Shipping";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import AccessDenied from "@/pages/AccessDenied";

import AccountLayout from "@/pages/account/AccountLayout";
import Profile from "@/pages/account/Profile";
import Orders from "@/pages/account/Orders";
import Favorites from "@/pages/account/Favorites";

import EmployeeDashboard from "@/pages/employee/EmployeeDashboard";

import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminKnowledgeBase from "@/pages/admin/AdminKnowledgeBase";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Rutas públicas (guest) */}
        <Route index element={<Home />} />
        <Route path="catalogo" element={<Catalog />} />
        <Route path="producto/:slug" element={<ProductDetail />} />
        <Route path="carrito" element={<Cart />} />
        <Route path="nosotros" element={<About />} />
        <Route path="envios" element={<Shipping />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="login" element={<Login />} />
        <Route path="registro" element={<Register />} />
        <Route path="acceso-denegado" element={<AccessDenied />} />

        {/* Rutas de cliente autenticado */}
        <Route path="checkout" element={<ProtectedRoute minimo="client"><Checkout /></ProtectedRoute>} />
        <Route path="cuenta" element={<ProtectedRoute minimo="client"><AccountLayout /></ProtectedRoute>}>
          <Route index element={<Profile />} />
          <Route path="pedidos" element={<Orders />} />
          <Route path="favoritos" element={<Favorites />} />
        </Route>

        {/* Panel interno: employee + admin */}
        <Route path="panel" element={<ProtectedRoute minimo="employee"><EmployeeDashboard /></ProtectedRoute>} />

        {/* Administración: solo admin */}
        <Route path="admin" element={<ProtectedRoute minimo="admin"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="base-conocimiento" element={<AdminKnowledgeBase />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
