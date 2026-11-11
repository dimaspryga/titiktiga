import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

const MEDIA_TYPES: Record<string, { extension: string; maxSize: number }> = {
  "image/jpeg": { extension: "jpg", maxSize: 5 * 1024 * 1024 },
  "image/png": { extension: "png", maxSize: 5 * 1024 * 1024 },
  "image/webp": { extension: "webp", maxSize: 5 * 1024 * 1024 },
  "video/mp4": { extension: "mp4", maxSize: 30 * 1024 * 1024 },
  "video/webm": { extension: "webm", maxSize: 30 * 1024 * 1024 },
  "video/quicktime": { extension: "mov", maxSize: 30 * 1024 * 1024 },
  "video/ogg": { extension: "ogv", maxSize: 30 * 1024 * 1024 },
};

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const formFile = form.get("media");
  const file = formFile instanceof File ? formFile : null;

  if (!file) {
    return NextResponse.json({ error: "Pilih file gambar atau video terlebih dahulu" }, { status: 400 });
  }

  const mediaType = MEDIA_TYPES[file.type];
  if (!mediaType) {
    return NextResponse.json({ error: "Format yang didukung: JPG, PNG, WebP, MP4, WebM, MOV, atau OGG" }, { status: 400 });
  }
  if (file.size > mediaType.maxSize) {
    return NextResponse.json(
      { error: `Ukuran ${file.type.startsWith("video/") ? "video" : "gambar"} melebihi batas ${mediaType.maxSize / (1024 * 1024)} MB` },
      { status: 400 }
    );
  }

  const filename = `${randomUUID()}.${mediaType.extension}`;
  const uploadDirectory = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDirectory, { recursive: true });
  await writeFile(path.join(uploadDirectory, filename), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 });
}
