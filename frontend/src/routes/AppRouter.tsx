import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../modules/auth/Login";
import Dashboard from "../modules/dashboard/Dashboard";
import Users from "../modules/users/Users";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import Tarifas from "@/modules/tarifas/Tarifas";
import Drivers from "@/modules/drivers/Drivers";
import Vehicles from "@/modules/vehicles/Vehicles";
import Profile from "@/modules/profile/Profile";
import Settings from "@/modules/settings/Settings";
import Deudas from "@/modules/deudas/Deudas";
import Gastos from "@/modules/gastos/Gastos";
import Roles from "@/modules/roles/Roles";
import { PermissionRoute } from "./PermissionRoute";

const AppRouter = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Ruta raíz - redirige según autenticación */}
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />

        {/* Rutas públicas */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />

        {/* Rutas protegidas con Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route element={<PermissionRoute permission="dashboard.read" />}>
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            <Route element={<PermissionRoute permission="tarifas.read" />}>
              <Route path="/tarifas" element={<Tarifas />} />
            </Route>
            <Route element={<PermissionRoute permission="vehicles.read" />}>
              <Route path="/vehicles" element={<Vehicles />} />
            </Route>
            <Route element={<PermissionRoute permission="drivers.read" />}>
              <Route path="/drivers" element={<Drivers />} />
            </Route>
            <Route element={<PermissionRoute permission="deudas.read" />}>
              <Route path="/deudas" element={<Deudas />} />
            </Route>
            <Route element={<PermissionRoute permission="gastos.read" />}>
              <Route path="/gastos" element={<Gastos />} />
            </Route>
            <Route element={<PermissionRoute permission="users.read" />}>
              <Route path="/users" element={<Users />} />
            </Route>
            <Route element={<PermissionRoute permission="roles.read" />}>
              <Route path="/roles" element={<Roles />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route 
          path="*" 
          element={
            <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
          } 
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
