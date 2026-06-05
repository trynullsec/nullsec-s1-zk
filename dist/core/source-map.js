export function getLine(source, line) {
    return source.split(/\r?\n/)[line - 1]?.trimEnd() ?? "";
}
export function columnOf(lineText, needle) {
    const index = lineText.indexOf(needle);
    return index >= 0 ? index + 1 : 1;
}
export function lineStartOffsets(source) {
    const starts = [0];
    for (let i = 0; i < source.length; i += 1) {
        if (source[i] === "\n")
            starts.push(i + 1);
    }
    return starts;
}
//# sourceMappingURL=source-map.js.map