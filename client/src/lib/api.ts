import type { User, Document } from "@shared/schema";

const API_BASE = "/api";

export async function login(phoneNumber: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phoneNumber, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  const data = await response.json();
  return data.user;
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export async function register(phoneNumber: string, password: string, name?: string): Promise<User> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ phoneNumber, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Registration failed");
  }

  const data = await response.json();
  return data.user;
}

export async function uploadDocument(clientPhoneNumber: string, file: File): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("clientPhoneNumber", clientPhoneNumber);

  const response = await fetch(`${API_BASE}/documents/upload`, {
    method: "POST",
    credentials: "include",
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

  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch documents");
  }

  const data = await response.json();
  return data.documents;
}

export async function previewDocument(id: string): Promise<void> {
  window.open(`${API_BASE}/documents/${id}/preview`, "_blank");
}

export async function downloadDocument(id: string): Promise<void> {
  window.open(`${API_BASE}/documents/${id}/download`, "_blank");
}

export async function deleteDocument(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Delete failed");
  }
}

export async function updateAdminProfile(data: { name?: string; phoneNumber?: string; password?: string }): Promise<User> {
  const response = await fetch(`${API_BASE}/admin/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update profile");
  }

  const result = await response.json();
  return result.user;
}
