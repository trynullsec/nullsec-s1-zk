import { readFile } from "node:fs/promises";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import fg from "fast-glob";
async function loadFilesByExtension(target, extensions, ignore = []) {
    const absoluteTarget = resolve(process.cwd(), target);
    const stat = statSync(absoluteTarget);
    const patterns = stat.isDirectory() ? extensions.map((extension) => `**/*${extension}`) : [absoluteTarget];
    const cwd = stat.isDirectory() ? absoluteTarget : process.cwd();
    const entries = await fg(patterns, {
        cwd,
        absolute: true,
        onlyFiles: true,
        ignore: ignore.map((entry) => `**/${entry}/**`)
    });
    const unique = [...new Set(entries)].filter((file) => extensions.some((extension) => file.endsWith(extension)));
    return Promise.all(unique.sort().map(async (filePath) => ({
        filePath,
        rawSource: await readFile(filePath, "utf8")
    })));
}
export async function loadCircomFiles(target, ignore = []) {
    return loadFilesByExtension(target, [".circom"], ignore);
}
export async function loadRustFiles(target, ignore = []) {
    return loadFilesByExtension(target, [".rs"], ignore);
}
//# sourceMappingURL=file-loader.js.map