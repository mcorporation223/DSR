import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    // Await params for Next.js 15 compatibility
    const params = await context.params;

    // Get the file path from the URL
    const filePath = params.path.join("/");

    console.log("Requested file path:", filePath);

    // Get upload path from environment variable
    const uploadsBasePath =
      process.env.UPLOADS_PATH || path.join(process.cwd(), "uploads");

    // If the path already starts with "uploads", remove it to avoid duplication
    let adjustedFilePath = filePath;
    if (filePath.startsWith("uploads/")) {
      adjustedFilePath = filePath.substring("uploads/".length);
    }

    const fullPath = path.join(uploadsBasePath, adjustedFilePath);
    console.log("Full file path:", fullPath);

    // Security check: ensure the path is within uploads directory
    const normalizedPath = path.normalize(fullPath);
    const normalizedBase = path.normalize(uploadsBasePath);

    if (!normalizedPath.startsWith(normalizedBase)) {
      console.error("Access denied for path:", normalizedPath);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check if file exists before trying to read it
    try {
      const { stat } = await import("fs/promises");
      await stat(fullPath);
    } catch (statError) {
      console.error("File not found:", fullPath, statError);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read the file
    const fileBuffer = await readFile(fullPath);

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".gif":
        contentType = "image/gif";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
      case ".pdf":
        contentType = "application/pdf";
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("File serving error:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
