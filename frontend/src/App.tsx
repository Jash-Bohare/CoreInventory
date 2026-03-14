import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import ProductsPage from "@/pages/ProductsPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import WarehousesPage from "@/pages/WarehousesPage";
import OperationPage from "@/pages/OperationPage";
import MovementsPage from "@/pages/MovementsPage";
import AnchorPage from "@/pages/AnchorPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/products/:id" element={<ProductDetailPage />} />
                <Route path="/warehouses" element={<WarehousesPage />} />
                <Route path="/operations/receipts" element={<OperationPage type="receipt" title="Receipts" />} />
                <Route path="/operations/deliveries" element={<OperationPage type="delivery" title="Deliveries" />} />
                <Route path="/operations/transfers" element={<OperationPage type="transfer" title="Transfers" />} />
                <Route path="/operations/adjustments" element={<OperationPage type="adjustment" title="Adjustments" />} />
                <Route path="/movements" element={<MovementsPage />} />
                <Route path="/anchor" element={<AnchorPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
