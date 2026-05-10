import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import RequireAuth from '../components/RequireAuth';
import PublicLayout from '../components/layouts/PublicLayout';
import DashboardLayout from '../components/layouts/DashboardLayout';
import HomePage from '../pages/public/HomePage';
import MenuPage from '../pages/public/MenuPage';
import LoginPage from '../pages/public/LoginPage';
import RegisterPage from '../pages/public/RegisterPage';
import MasterDashboard from '../pages/master/Dashboard';
import MasterEmployees from '../pages/master/Employees';
import MasterProducts from '../pages/master/Products';
import MasterToppings from '../pages/master/Toppings';
import MasterVisual from '../pages/master/Visual';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminOrders from '../pages/admin/Orders';
import AdminInventory from '../pages/admin/Inventory';
import AdminTables from '../pages/admin/Tables';
import AdminReservations from '../pages/admin/ReservationsPage';
import AdminCashRegister from '../pages/admin/CashRegisterPage';
import MeseroDashboard from '../pages/mesero/Dashboard';
import MeseroTables from '../pages/mesero/Tables';
import MeseroOrders from '../pages/mesero/Orders';
import ClientHome from '../pages/client/HomePage';
import ClientMenu from '../pages/client/MenuPage';
import ClientCart from '../pages/client/CartPage';
import ClientCheckout from '../pages/client/CheckoutPage';
import ClientReservations from '../pages/client/ReservationsPage';
import ClientMyOrders from '../pages/client/MyOrdersPage';

const AppRoutes = () => (
  <AuthProvider>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="menu" element={<MenuPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth allowedRoles={['master']} />}>
            <Route path="/master" element={<DashboardLayout />}>
              <Route index element={<MasterDashboard />} />
              <Route path="empleados" element={<MasterEmployees />} />
              <Route path="productos" element={<MasterProducts />} />
              <Route path="toppings" element={<MasterToppings />} />
              <Route path="visual" element={<MasterVisual />} />
            </Route>
          </Route>

          <Route element={<RequireAuth allowedRoles={['master', 'administrador']} />}>
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="caja" element={<AdminCashRegister />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="mesas" element={<AdminTables />} />
              <Route path="inventario" element={<AdminInventory />} />
              <Route path="reservas" element={<AdminReservations />} />
            </Route>
          </Route>

          <Route element={<RequireAuth allowedRoles={['master', 'administrador', 'mesero']} />}>
            <Route path="/mesero" element={<DashboardLayout />}>
              <Route index element={<MeseroDashboard />} />
              <Route path="mesas" element={<MeseroTables />} />
              <Route path="pedidos" element={<MeseroOrders />} />
            </Route>
          </Route>

          <Route element={<RequireAuth allowedRoles={['cliente']} />}>
            <Route path="/cliente" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/cliente/menu" />} />
              <Route path="menu" element={<ClientMenu />} />
              <Route path="carrito" element={<ClientCart />} />
              <Route path="checkout" element={<ClientCheckout />} />
              <Route path="reservas" element={<ClientReservations />} />
              <Route path="mis-pedidos" element={<ClientMyOrders />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </AuthProvider>
);

export default AppRoutes;