import "./App.css";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import AIBuddy from "./components/AIBuddy";
import Header from "./components/Header";
import SellerDashboard from "./pages/SellerDashboard";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import PaymentIntegration from './pages/PaymentIntegration'
import SellProducts from "./pages/SellProducts";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

function App() {
  const location = useLocation();

  const hideAIBuddyRoutes = [
    "/login",
    "/register",
    // "/cart",
    // "/order",
    "/payment"
  ];

  const shouldHideAIBuddy = hideAIBuddyRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <AuthProvider>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/order" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetail />} />
        <Route path="/payment/:id" element={<PaymentIntegration />} />
        <Route
  path="/seller/dashboard"
  element={
    <ProtectedRoute>
      <SellerDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/sell"
  element={
    <ProtectedRoute>
      <SellProducts />
    </ProtectedRoute>
  }
/>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!shouldHideAIBuddy && <AIBuddy />}
    </AuthProvider>
  );
}

export default App;