import React, { createContext, useContext, useState, useCallback } from "react";
import { productsApi, warehousesApi } from "@/services/api";

interface DataContextType {
  products: any[];
  warehouses: any[];
  fetchProducts: () => Promise<void>;
  fetchWarehouses: () => Promise<void>;
  productsLoaded: boolean;
  warehousesLoaded: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [warehousesLoaded, setWarehousesLoaded] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsApi.list();
      setProducts(Array.isArray(data) ? data : []);
      setProductsLoaded(true);
    } catch { setProductsLoaded(true); }
  }, []);

  const fetchWarehouses = useCallback(async () => {
    try {
      const data = await warehousesApi.list();
      setWarehouses(Array.isArray(data) ? data : []);
      setWarehousesLoaded(true);
    } catch { setWarehousesLoaded(true); }
  }, []);

  return (
    <DataContext.Provider value={{ products, warehouses, fetchProducts, fetchWarehouses, productsLoaded, warehousesLoaded }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
