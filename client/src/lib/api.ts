import type { User, Document } from "@shared/schema";

const API_BASE = "/api";

export async function login(phoneNumber: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  return data.user;
}

export async function register(phoneNumber: string, password: string, role: "admin" | "client", name?: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phoneNumber, password, role, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  const data = await response.json();
  return data.user;
}

export async function uploadDocument(clientPhoneNumber: string, file: File, uploadedBy: string): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("clientPhoneNumber", clientPhoneNumber);
  formData.append("uploadedBy", uploadedBy);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Upload failed");
  }

  const data = await response.json();
  return data.document;
}

export async function getDocuments(clientPhoneNumber?: string): Promise<Document[]> {
  const url = clientPhoneNumber
    ? `${API_BASE}/documents?clientPhoneNumber=${encodeURIComponent(clientPhoneNumber)}`
    : `${API_BASE}/documents`;

  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch documents");
  }

  const data = await response.json();
  return data.documents;
}

export async function downloadDocument(id: string): Promise<void> {
  window.open(`${API_BASE}/documents/${id}/download`, "_blank");
}

export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Delete failed");
  }
}
