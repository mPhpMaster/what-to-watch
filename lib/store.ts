import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { MessageKey } from "./i18n";
import { isReachable, type Title } from "./types";

/**
 * One catalog, two drivers.
 *
 * - `fs`   (default) reads and writes data/titles.json. Works under `next dev`
 *          and on any Node host with a writable disk.
 * - `blob` kicks in when BLOB_READ_WRITE_TOKEN is set, because Vercel's
 *          filesystem is read-only and the admin panel would silently fail.
 */

const FILE = path.join(process.cwd(), "data", "titles.json");
const BLOB_PATH = "what2watch/titles.json";

let cache: Title[] | null = null;
/** Serialises writes so two concurrent admin saves can't clobber each other. */
let writeQueue: Promise<unknown> = Promise.resolve();

function usingBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** False only where we know for certain a write cannot land. */
export function canWrite(): boolean {
  return usingBlob() || process.env.VERCEL !== "1";
}

export function storageDriver(): "blob" | "fs" {
  return usingBlob() ? "blob" : "fs";
}

async function readFromFile(): Promise<Title[]> {
  const raw = await fs.readFile(FILE, "utf8");
  return JSON.parse(raw) as Title[];
}

async function readFromBlob(): Promise<Title[]> {
  const { list } = await import("@vercel/blob");
  const { blobs } = await list({ prefix: BLOB_PATH, limit: 1 });
  if (blobs.length === 0) {
    // Nothing published yet — fall back to the version shipped with the build.
    return readFromFile();
  }
  const res = await fetch(blobs[0].url, { cache: "no-store" });
  if (!res.ok) throw new Error(`blob read failed: ${res.status}`);
  return (await res.json()) as Title[];
}

/** Every title in the catalog, including any the UI would filter out. */
export async function getAllTitles(): Promise<Title[]> {
  if (cache && process.env.NODE_ENV === "production") return cache;
  const titles = usingBlob() ? await readFromBlob() : await readFromFile();
  cache = titles;
  return titles;
}

/**
 * What the site is allowed to show. A title nobody can open is not a
 * recommendation, so it never leaves this function.
 */
export async function getTitles(): Promise<Title[]> {
  return (await getAllTitles()).filter(isReachable);
}

export async function getTitle(id: string): Promise<Title | null> {
  return (await getAllTitles()).find((t) => t.id === id) ?? null;
}

async function persist(titles: Title[]): Promise<void> {
  const body = `${JSON.stringify(titles, null, 2)}\n`;
  if (usingBlob()) {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, body, {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } else {
    await fs.writeFile(FILE, body, "utf8");
  }
  cache = titles;
}

/** Read-modify-write under a queue; the mutator sees the freshest catalog. */
async function mutate<T>(fn: (titles: Title[]) => { titles: Title[]; result: T }): Promise<T> {
  const run = writeQueue.then(async () => {
    cache = null;
    const current = await getAllTitles();
    const { titles, result } = fn(current);
    await persist(titles);
    return result;
  });
  // Keep the queue alive even if this write throws.
  writeQueue = run.catch(() => undefined);
  return run;
}

/** `message` is a `lib/i18n` message key, so the UI can show it in any locale. */
export class StoreError extends Error {
  constructor(
    message: MessageKey,
    readonly status = 400,
  ) {
    super(message);
  }
}

export async function createTitle(t: Title): Promise<Title> {
  return mutate((titles) => {
    if (titles.some((x) => x.id === t.id)) {
      throw new StoreError("err.duplicateId", 409);
    }
    return { titles: [...titles, t], result: t };
  });
}

export async function updateTitle(id: string, t: Title): Promise<Title> {
  return mutate((titles) => {
    const i = titles.findIndex((x) => x.id === id);
    if (i === -1) throw new StoreError("err.notFound", 404);
    if (t.id !== id && titles.some((x) => x.id === t.id)) {
      throw new StoreError("err.idTaken", 409);
    }
    const next = [...titles];
    next[i] = t;
    return { titles: next, result: t };
  });
}

export async function deleteTitle(id: string): Promise<void> {
  return mutate((titles) => {
    const next = titles.filter((x) => x.id !== id);
    if (next.length === titles.length) throw new StoreError("err.notFound", 404);
    return { titles: next, result: undefined };
  });
}
