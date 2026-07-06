const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8090";

export interface OrderSummary {
  id: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  paidAt: string | null;
  ticketCount: number;
}

/** Lista las ventas. Lanza "UNAUTHORIZED" si el token es inválido (401). */
export async function fetchOrders(token: string): Promise<OrderSummary[]> {
  const res = await fetch(`${API_URL}/api/admin/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}
