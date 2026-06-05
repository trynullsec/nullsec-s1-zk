import type { LoadedFile } from "../../core/file-loader.js";
import { parseHalo2File } from "./halo2-parser.js";
import { buildHalo2IR } from "./halo2-ir-builder.js";
import type { Halo2CircuitFile, Halo2IR } from "./halo2-types.js";

export interface Halo2Adapter {
  readonly frontend: "Halo2";
  parseFile(file: LoadedFile): Halo2CircuitFile;
  buildIR(files: Halo2CircuitFile[]): Halo2IR;
}

export const halo2Adapter: Halo2Adapter = {
  frontend: "Halo2",
  parseFile(file) {
    return parseHalo2File(file.filePath, file.rawSource);
  },
  buildIR(files) {
    return buildHalo2IR(files);
  }
};
