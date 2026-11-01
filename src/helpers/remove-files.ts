import { unlink } from 'node:fs/promises';

export async function removeFiles(paths: Array<string | null | undefined>) {
  await Promise.all(paths.filter((p): p is string => !!p).map((p) => unlink(p).catch(() => {})));
}
