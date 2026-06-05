#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { existsSync } from "node:fs";
import { scanTarget } from "./scanner.js";
import { writeDefaultConfig } from "./config.js";
import { allRules } from "./rules/index.js";
import { normalizeSeverity } from "./core/severity.js";
const program = new Command();
program
    .name("nullsec-zk")
    .description("Nullsec S1-ZK: AI-native auditing for zero-knowledge circuits.")
    .version("1.0.0");
program
    .command("scan")
    .argument("<target>", "Circom file or directory to scan")
    .option("--format <format>", "terminal, json, markdown, or sarif")
    .option("--report <format>", "write a report in the requested format")
    .option("--out <path>", "write report output to a path")
    .option("--fail-on <severity>", "CRITICAL, HIGH, MEDIUM, LOW, or INFO")
    .option("--config <path>", "config file path")
    .action(async (target, options) => {
    try {
        const run = await scanTarget(target, {
            format: options.format,
            report: options.report,
            out: options.out,
            failOn: options.failOn ? normalizeSeverity(options.failOn, "CRITICAL") : undefined,
            configPath: options.config
        });
        if (!options.out && !options.report)
            process.stdout.write(run.output);
        process.exitCode = run.exitCode;
    }
    catch (error) {
        console.error(chalk.red("Nullsec S1-ZK scan failed"));
        console.error(error.message);
        process.exitCode = 2;
    }
});
program.command("rules").description("List supported Nullsec S1-ZK rules").action(() => {
    for (const rule of allRules) {
        console.log(`${rule.id}  ${rule.defaultSeverity.padEnd(8)}  ${rule.title}`);
    }
});
program.command("explain").argument("<issue-id>", "Rule ID or issue ID").description("Explain a supported rule").action((issueId) => {
    const ruleId = issueId.match(/NS-ZK-\d{3}/)?.[0] ?? issueId;
    const rule = allRules.find((candidate) => candidate.id === ruleId);
    if (!rule) {
        console.error(`No rule found for ${issueId}`);
        process.exitCode = 2;
        return;
    }
    console.log(`${rule.id}: ${rule.title}

Default severity: ${rule.defaultSeverity}
Tags: ${rule.tags.join(", ")}

${rule.description}`);
});
program.command("init").description("Create a .nullsec-zk.json config file").action(() => {
    if (existsSync(".nullsec-zk.json")) {
        console.error(".nullsec-zk.json already exists");
        process.exitCode = 2;
        return;
    }
    const path = writeDefaultConfig();
    console.log(`Created ${path}`);
});
program.parseAsync(process.argv);
//# sourceMappingURL=cli.js.map