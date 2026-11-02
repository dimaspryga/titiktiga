import JSZip from "jszip";
import { readdir, readFile, stat } from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const DIRS = ["src", "public", "tests"];
const ROOT_FILES = [
  "package.json",
  "yarn.lock",
  "tsconfig.json",
  "next.config.ts",
  "tailwind.config.js",
  "postcss.config.js",
  "eslint.config.mjs",
  "vitest.config.ts",
  "README.md",
];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".turbo", "coverage"]);
const SKIP_FILES = /^(\.env|.*\.swp|tsconfig\.tsbuildinfo|next-env\.d\.ts)$/;

async function addDir(zip: JSZip, dir: string, zipBase: string): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) await addDir(zip, full, `${zipBase}/${entry.name}`);
    } else if (entry.isFile()) {
      if (SKIP_FILES.test(entry.name)) continue;
      zip.file(`${zipBase}/${entry.name}`, await readFile(full));
    }
  }
}

/**
 * Mengemas seluruh resource aplikasi (kode sumber, konfigurasi, data mock, tests)
 * menjadi arsip ZIP saat diminta. File rahasia (.env*) dan dependensi (node_modules)
 * sengaja dikecualikan.
 */
export async function GET() {
  const zip = new JSZip();
  try {
    for (const dir of DIRS) {
      const full = path.join(ROOT, dir);
      await stat(full);
      await addDir(zip, full, dir);
    }
    for (const file of ROOT_FILES) {
      try {
        zip.file(file, await readFile(path.join(ROOT, file)));
      } catch {
        // file opsional — lewati jika tidak ada
      }
    }
    const buffer = await zip.generateAsync({
      type: "arraybuffer",
      compression: "DEFLATE",
      compressionOptions: { level: 6 },
    });
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="titiktiga-source.zip"',
        "Content-Length": String(buffer.byteLength),
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Gagal menyiapkan unduhan" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
