// File upload utility functions

export interface UploadResponse {
  success: boolean;
  fileName?: string;
  filePath?: string;
  fileSize?: number;
  fileType?: string;
  error?: string;
}

export async function uploadFile(
  file: File,
  type: "employee" | "detainee" | "document" | "statement" | "seizure"
): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Upload failed");
    }

    return result;
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export function getFileUrl(filePath: string): string {
  // Remove leading slash if present and construct API URL
  const cleanPath = filePath.startsWith("/") ? filePath.slice(1) : filePath;
  return `/api/files/${cleanPath}`;
}

export function validateImageFile(file: File): string | null {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return "Type de fichier non supporté. Utilisez JPG, PNG, WebP ou GIF.";
  }

  // Check file size (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return "Fichier trop volumineux. Taille maximale: 5MB.";
  }

  return null; // No error
}

export function validateDocumentFile(file: File): string | null {
  // Check file type - allow documents and images
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (!allowedTypes.includes(file.type)) {
    return "Type de fichier non supporté. Utilisez PDF, Word, TXT, ou images (JPG, PNG, WebP, GIF).";
  }

  // Check file size (10MB limit for documents)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return "Fichier trop volumineux. Taille maximale: 10MB.";
  }

  return null; // No error
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export interface DeleteResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export async function deleteFile(filePath: string): Promise<DeleteResponse> {
  try {
    const response = await fetch("/api/delete-file", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filePath }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Delete failed");
    }

    return result;
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
