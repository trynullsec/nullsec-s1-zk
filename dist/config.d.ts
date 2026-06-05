import type { NullsecConfig } from "./types.js";
export declare const defaultConfig: NullsecConfig;
export declare function loadConfig(cwd?: string, configPath?: string): NullsecConfig;
export declare function writeDefaultConfig(cwd?: string): string;
