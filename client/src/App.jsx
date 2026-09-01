import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import UploadReceipt from "./pages/UploadReceipt/UploadReceipt";
import ReceiptHistory from "./pages/ReceiptHistory/ReceiptHistory";
import Vouchers from "./pages/Vouchers/Vouchers";
import Settings from "./pages/Settings/Settings";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";
import AdminReceipts from "./pages/AdminReceipts/AdminReceipts";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected user routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipts/upload"
          element={
            <ProtectedRoute>
              <UploadReceipt />
            </ProtectedRoute>
          }
        />
        <Route
          path="/receipts"
          element={
            <ProtectedRoute>
              <ReceiptHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vouchers"
          element={
            <ProtectedRoute>
              <Vouchers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Protected admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/receipts"
          element={
            <AdminRoute>
              <AdminReceipts />
            </AdminRoute>
          }
        />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
