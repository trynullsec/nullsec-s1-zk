import chalk from "chalk";

export interface BannerOptions {
  compact?: boolean;
  silent?: boolean;
}

function shouldPrint(silent?: boolean): boolean {
  if (silent) return false;
  return Boolean(process.stdout.isTTY) || process.env.NULLSEC_ZK_FORCE_BANNER === "1";
}

export function printBanner(options: BannerOptions = {}): void {
  if (!shouldPrint(options.silent)) return;

  const accent = chalk.cyanBright;
  const muted = chalk.gray;
  const strong = chalk.whiteBright;
  const star = process.stdout.isTTY ? "✶" : "*";

  if (options.compact) {
    process.stdout.write(
      `${muted("╭────────────────────────────────────────────╮")}
${muted("│")} ${accent(star)} ${strong("Nullsec S1-ZK")}                            ${muted("│")}
${muted("╰────────────────────────────────────────────╯")}

`
    );
    return;
  }

  process.stdout.write(
    `${muted("╭────────────────────────────────────────────╮")}
${muted("│")} ${accent(star)} ${strong("Nullsec S1-ZK")}                            ${muted("│")}
${muted("╰────────────────────────────────────────────╯")}

${accent("███╗   ██╗██╗   ██╗██╗     ██╗     ███████╗███████╗ ██████╗")}
${accent("████╗  ██║██║   ██║██║     ██║     ██╔════╝██╔════╝██╔════╝")}
${accent("██╔██╗ ██║██║   ██║██║     ██║     ███████╗█████╗  ██║     ")}
${accent("██║╚██╗██║██║   ██║██║     ██║     ╚════██║██╔══╝  ██║     ")}
${accent("██║ ╚████║╚██████╔╝███████╗███████╗███████║███████╗╚██████╗")}
${accent("╚═╝  ╚═══╝ ╚═════╝ ╚══════╝╚══════╝╚══════╝╚══════╝ ╚═════╝")}

${strong("S1-ZK")}  ${muted("·")}  audit what your circuit actually proves
${muted("Local deterministic analysis  ·  Circom + Halo2  ·  scan ./circuits --deep")}

`
  );
}
