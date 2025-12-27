import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";

// Lazy load pages for code splitting
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardLayout = lazy(
  () => import("./components/layout/DashboardLayout")
);
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const StaffManagementPage = lazy(() => import("./pages/StaffManagementPage"));
const CategoryManagementPage = lazy(
  () => import("./pages/CategoryManagementPage")
);
const MenuManagementPage = lazy(() => import("./pages/MenuManagementPage"));
const TableManagementPage = lazy(() => import("./pages/TableManagementPage"));
const OrderManagementPage = lazy(() => import("./pages/OrderManagementPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading component
const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes with admin layout */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute
                      allowedRoles={[
                        "ADMIN",
                        "SUPER_ADMIN",
                        "WAITER",
                        "KITCHEN_STAFF",
                      ]}
                    >
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Dashboard */}
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />

                  {/* Staff management - Admin only */}
                  <Route
                    path="staff"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                        <StaffManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Category management - Admin only */}
                  <Route
                    path="categories"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                        <CategoryManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Menu Item management - Admin only */}
                  <Route
                    path="menu"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                        <MenuManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Table management - Admin only */}
                  <Route
                    path="tables"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                        <TableManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Order management - All staff */}
                  <Route
                    path="orders"
                    element={
                      <ProtectedRoute
                        allowedRoles={[
                          "ADMIN",
                          "SUPER_ADMIN",
                          "WAITER",
                          "KITCHEN_STAFF",
                        ]}
                      >
                        <OrderManagementPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Reports - Admin only */}
                  <Route
                    path="reports"
                    element={
                      <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
                        <ReportsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* 404 */}
                  <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
