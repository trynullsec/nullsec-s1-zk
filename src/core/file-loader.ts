import { readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import fg from "fast-glob";

export interface LoadedFile {
  filePath: string;
  rawSource: string;
}

export async function loadCircomFiles(target: string, ignore: string[] = []): Promise<LoadedFile[]> {
  const absoluteTarget = resolve(process.cwd(), target);
  const stat = statSync(absoluteTarget);
  const patterns = stat.isDirectory() ? ["**/*.circom"] : [absoluteTarget];
  const cwd = stat.isDirectory() ? absoluteTarget : process.cwd();
  const entries = await fg(patterns, {
    cwd,
    absolute: true,
    onlyFiles: true,
    ignore: ignore.map((entry) => `**/${entry}/**`)
  });

  const unique = [...new Set(entries)].filter((file) => file.endsWith(".circom"));
  return Promise.all(
    unique.sort().map(async (filePath) => ({
      filePath,
      rawSource: await readFile(filePath, "utf8")
    }))
  );
}
