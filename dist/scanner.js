import { writeFile } from "node:fs/promises";
import { loadConfig } from "./config.js";
import { auditParsedFiles } from "./core/audit-engine.js";
import { loadCircomFiles, loadRustFiles } from "./core/file-loader.js";
import { isAtOrAbove, normalizeSeverity } from "./core/severity.js";
import { parseCircomFile } from "./frontends/circom/circom-parser.js";
import { parseHalo2File } from "./frontends/halo2/halo2-parser.js";
import { isLikelyHalo2Source } from "./frontends/halo2/halo2-patterns.js";
import { renderJsonReport } from "./report/json.js";
import { renderMarkdownReport } from "./report/markdown.js";
import { renderSarifReport } from "./report/sarif.js";
import { renderTerminalReport } from "./report/terminal.js";
export async function scanTarget(target, options = {}) {
    const config = loadConfig(process.cwd(), options.configPath);
    const format = options.format ?? options.report ?? config.format;
    const failOn = normalizeSeverity(options.failOn, config.failOn);
    const circomFiles = await loadCircomFiles(target, config.ignore);
    const rustFiles = await loadRustFiles(target, config.ignore);
    const parsed = circomFiles.map((file) => parseCircomFile(file.filePath, file.rawSource));
    const halo2Parsed = rustFiles.filter((file) => isLikelyHalo2Source(file.rawSource)).map((file) => parseHalo2File(file.filePath, file.rawSource));
    const result = auditParsedFiles(target, parsed, { ...config, failOn, format }, halo2Parsed);
    const output = renderReport(result, format);
    if (options.out || options.report) {
        const outPath = options.out ?? defaultReportPath(format);
        await writeFile(outPath, output);
    }
    const exitCode = result.issues.some((issue) => isAtOrAbove(issue.severity, failOn)) ? 1 : 0;
    return { result, output, exitCode };
}
export function renderReport(result, format) {
    switch (format) {
        case "json":
            return renderJsonReport(result);
        case "markdown":
            return renderMarkdownReport(result);
        case "sarif":
            return renderSarifReport(result);
        case "terminal":
        default:
            return renderTerminalReport(result);
    }
}
function defaultReportPath(format) {
    if (format === "markdown")
        return "nullsec-zk-report.md";
    if (format === "sarif")
        return "nullsec-zk-report.sarif";
    if (format === "json")
        return "nullsec-zk-report.json";
    return "nullsec-zk-report.txt";
}
//# sourceMappingURL=scanner.js.map