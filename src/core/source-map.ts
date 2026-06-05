export function getLine(source: string, line: number): string {
  return source.split(/\r?\n/)[line - 1]?.trimEnd() ?? "";
}

export function columnOf(lineText: string, needle: string): number {
  const index = lineText.indexOf(needle);
  return index >= 0 ? index + 1 : 1;
}

export function lineStartOffsets(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; i += 1) {
    if (source[i] === "\n") starts.push(i + 1);
  }
  return starts;
}
