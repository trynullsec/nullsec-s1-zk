import { parseHalo2File } from "./halo2-parser.js";
import { buildHalo2IR } from "./halo2-ir-builder.js";
export const halo2Adapter = {
    frontend: "Halo2",
    parseFile(file) {
        return parseHalo2File(file.filePath, file.rawSource);
    },
    buildIR(files) {
        return buildHalo2IR(files);
    }
};
//# sourceMappingURL=halo2-adapter.js.map