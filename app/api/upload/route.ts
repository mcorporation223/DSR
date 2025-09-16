import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // 'employee', 'document', 'statement'

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type based on upload type
    let allowedTypes: string[];
    if (type === "statement") {
      // For statements, allow document types
      allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ];
    } else {
      // For other types (like employee photos), only allow images
      allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    }

    if (!allowedTypes.includes(file.type)) {
      const typeDescription =
        type === "statement"
          ? "PDF, Word documents, text files, and images"
          : "images";
      return NextResponse.json(
        { error: `Invalid file type. Only ${typeDescription} are allowed.` },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size too large. Maximum 5MB allowed." },
        { status: 400 }
      );
    }

    // Get upload path from environment variable
    const uploadsBasePath =
      process.env.UPLOADS_PATH || path.join(process.cwd(), "uploads");

    // Create directory structure based on type
    let uploadDir: string;
    switch (type) {
      case "employee":
        uploadDir = path.join(uploadsBasePath, "employees", "photos");
        break;
      case "document":
        uploadDir = path.join(uploadsBasePath, "documents");
        break;
      case "statement":
        uploadDir = path.join(uploadsBasePath, "statements");
        break;
      default:
        uploadDir = path.join(uploadsBasePath, "misc");
    }

    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${type}-${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Return relative path for database storage
    const relativePath =
      type === "employee"
        ? path.join("employees/photos", fileName)
        : type === "statement"
        ? path.join("statements", fileName)
        : path.join(type, fileName);

    return NextResponse.json({
      success: true,
      fileName,
      filePath: relativePath.replace(/\\/g, "/"), // Normalize path separators
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
