import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { filePath } = await request.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "File path is required" },
        { status: 400 }
      );
    }

    // Get upload path from environment variable
    const uploadsBasePath =
      process.env.UPLOADS_PATH || path.join(process.cwd(), "uploads");

    // Construct full file path
    const fullFilePath = path.join(uploadsBasePath, filePath);

    // Security check: ensure the file path is within the uploads directory
    const normalizedPath = path.normalize(fullFilePath);
    const normalizedBasePath = path.normalize(uploadsBasePath);

    if (!normalizedPath.startsWith(normalizedBasePath)) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Delete the file
    await unlink(fullFilePath);

    return NextResponse.json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);

    // If file doesn't exist, consider it a success (idempotent operation)
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({
        success: true,
        message: "File already deleted or doesn't exist",
      });
    }

    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
