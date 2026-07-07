const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8090";

export interface CheckinResponse {
  result: string; // OK | FULL | NOT_PAID | INVALID_COUNT | INVALID
  buyerName: string | null;
  quantity: number;
  admittedCount: number;
  remaining: number;
}

async function post(
  path: string,
  adminToken: string,
  body: object,
): Promise<CheckinResponse> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}

export function lookup(adminToken: string, token: string) {
  return post("/api/checkin/lookup", adminToken, { token });
}

export function admit(adminToken: string, token: string, count: number) {
  return post("/api/checkin/admit", adminToken, { token, count });
}

/** Una orden paga encontrada por el mail de compra (ingreso manual sin QR). */
export interface EmailMatch {
  token: string; // mismo token firmado del QR: se admite con admit()
  buyerName: string;
  quantity: number;
  admittedCount: number;
  remaining: number;
  result: string; // OK | FULL
}

export interface EmailLookupResponse {
  matches: EmailMatch[];
}

export async function lookupByEmail(
  adminToken: string,
  email: string,
): Promise<EmailLookupResponse> {
  const res = await fetch(`${API_URL}/api/checkin/lookup-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ email }),
  });
  if (res.status === 401) {
    throw new Error("UNAUTHORIZED");
  }
  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }
  return res.json();
}
