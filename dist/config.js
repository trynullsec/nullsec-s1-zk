import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { normalizeSeverity } from "./core/severity.js";
export const defaultConfig = {
    rules: {},
    ignore: ["node_modules", "dist", "circomlib"],
    failOn: "CRITICAL",
    format: "terminal",
    field: "BN254"
};
function isFormat(value) {
    return value === "terminal" || value === "json" || value === "markdown" || value === "sarif";
}
export function loadConfig(cwd = process.cwd(), configPath) {
    const path = configPath ? resolve(cwd, configPath) : resolve(cwd, ".nullsec-zk.json");
    if (!existsSync(path))
        return { ...defaultConfig, rules: { ...defaultConfig.rules }, ignore: [...defaultConfig.ignore] };
    const parsed = JSON.parse(readFileSync(path, "utf8"));
    return {
        rules: parsed.rules ?? {},
        ignore: Array.isArray(parsed.ignore) ? parsed.ignore : [...defaultConfig.ignore],
        failOn: normalizeSeverity(String(parsed.failOn ?? defaultConfig.failOn), defaultConfig.failOn),
        format: isFormat(parsed.format) ? parsed.format : defaultConfig.format,
        field: parsed.field ?? defaultConfig.field
    };
}
export function writeDefaultConfig(cwd = process.cwd()) {
    const path = resolve(cwd, ".nullsec-zk.json");
    const payload = {
        rules: {
            "NS-ZK-006": "medium"
        },
        ignore: ["node_modules", "circomlib"],
        failOn: "CRITICAL",
        format: "terminal",
        field: "BN254"
    };
    writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`);
    return path;
}
//# sourceMappingURL=config.js.map