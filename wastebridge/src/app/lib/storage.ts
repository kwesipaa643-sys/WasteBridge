// Storage abstraction. Local disk now; swap the body of save() for S3/Vercel Blob/Uploadthing later.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX = 8 * 1024 * 1024;
export const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");

export async function saveImage(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("Only JPEG, PNG or WebP photos are allowed");
  if (file.size > MAX) throw new Error("Photo must be under 8 MB");
  const ext = file.type.split("/")[1];
  const name = `${randomUUID()}.${ext}`;
  const dir = UPLOAD_DIR;
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/api/uploads/${name}`;
}
