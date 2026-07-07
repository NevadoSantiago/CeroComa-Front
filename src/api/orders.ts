const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8090";

export interface CreateOrderPayload {
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  preferredBand?: string;
}

export interface CreateOrderResponse {
  orderId: string;
  initPoint: string;
}

export async function createOrder(
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Error ${res.status} al crear la orden`);
  }
  return res.json();
}
