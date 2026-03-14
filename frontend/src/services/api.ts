const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("coreinv_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem("coreinv_token");
    localStorage.removeItem("coreinv_user");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    request<{ token: string; user: { id: string; name: string; email: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  signup: (name: string, email: string, password: string) =>
    request<{ token: string; user: { id: string; name: string; email: string } }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
};

// Dashboard
export const dashboardApi = {
  summary: () => request<{
    totalProducts: number;
    lowStock: number;
    pendingReceipts: number;
    pendingDeliveries: number;
    transfersScheduled: number;
  }>("/dashboard/summary"),
  recentMovements: (limit = 8) =>
    request<any[]>(`/dashboard/recent-movements?limit=${limit}`),
  lowStock: (threshold = 10, limit = 20) =>
    request<{ count: number; threshold: number; data: any[] }>(`/dashboard/low-stock?threshold=${threshold}&limit=${limit}`),
};

// Products
export const productsApi = {
  list: () => request<any[]>("/products"),
  get: (id: string) => request<any>(`/products/${id}`),
  create: (data: { name: string; sku: string; category: string; unit: string }) =>
    request<any>("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: any) =>
    request<any>(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/products/${id}`, { method: "DELETE" }),
  stock: (id: string) =>
    request<{ productId: string; totalQty: number; locations: any[] }>(`/products/${id}/stock`),
};

// Warehouses
export const warehousesApi = {
  list: () => request<any[]>("/warehouses"),
  create: (data: { name: string; location: string }) =>
    request<any>("/warehouses", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: { name: string; location: string }) =>
    request<any>(`/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<any>(`/warehouses/${id}`, { method: "DELETE" }),
};

// Movements
export const movementsApi = {
  list: (params: Record<string, string | number> = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== "" && v !== undefined) qs.set(k, String(v)); });
    return request<{ total: number; page: number; pages: number; data: any[] }>(`/movements?${qs}`);
  },
  createReceipt: (data: { productId: string; warehouseId: string; qty: number }) =>
    request<any>("/movements/receipt", { method: "POST", body: JSON.stringify(data) }),
  createDelivery: (data: { productId: string; warehouseId: string; qty: number }) =>
    request<any>("/movements/delivery", { method: "POST", body: JSON.stringify(data) }),
  createTransfer: (data: { productId: string; fromWarehouseId: string; toWarehouseId: string; qty: number }) =>
    request<any>("/movements/transfer", { method: "POST", body: JSON.stringify(data) }),
  createAdjustment: (data: { productId: string; warehouseId: string; countedQty: number }) =>
    request<any>("/movements/adjustment", { method: "POST", body: JSON.stringify(data) }),
};

// Anchor
export const anchorApi = {
  batch: (limit = 20) =>
    request<{ root: string; txHash: string; blockNumber: number; movementCount: number }>(`/anchor/batch?limit=${limit}`, { method: "POST" }),
  verify: (movementId: string) =>
    request<{
      movementId: string;
      movementHash: string;
      merkleRoot: string;
      merkleProof: string[];
      txHash: string;
      explorer: string;
    }>(`/anchor/verify/${movementId}`),
};
