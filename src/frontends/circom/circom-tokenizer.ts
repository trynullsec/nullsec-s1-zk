export interface CircomToken {
  type: "identifier" | "number" | "operator" | "punctuation" | "string";
  value: string;
  line: number;
  column: number;
}

export function tokenizeCircom(source: string): CircomToken[] {
  const tokens: CircomToken[] = [];
  let line = 1;
  let column = 1;
  let i = 0;

  const push = (type: CircomToken["type"], value: string, startLine = line, startColumn = column) => {
    tokens.push({ type, value, line: startLine, column: startColumn });
  };

  while (i < source.length) {
    const ch = source[i] ?? "";
    if (ch === "\n") {
      line += 1;
      column = 1;
      i += 1;
      continue;
    }
    if (/\s/.test(ch)) {
      column += 1;
      i += 1;
      continue;
    }
    const startLine = line;
    const startColumn = column;
    const three = source.slice(i, i + 3);
    if (three === "<==" || three === "<--" || three === "===") {
      push("operator", three, startLine, startColumn);
      i += 3;
      column += 3;
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let value = ch;
      i += 1;
      column += 1;
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i] ?? "")) {
        value += source[i];
        i += 1;
        column += 1;
      }
      push("identifier", value, startLine, startColumn);
      continue;
    }
    if (/\d/.test(ch)) {
      let value = ch;
      i += 1;
      column += 1;
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i] ?? "")) {
        value += source[i];
        i += 1;
        column += 1;
      }
      push("number", value, startLine, startColumn);
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let value = ch;
      i += 1;
      column += 1;
      while (i < source.length && source[i] !== quote) {
        value += source[i];
        i += 1;
        column += 1;
      }
      if (i < source.length) {
        value += source[i];
        i += 1;
        column += 1;
      }
      push("string", value, startLine, startColumn);
      continue;
    }
    push(/[{}()[\],;]/.test(ch) ? "punctuation" : "operator", ch, startLine, startColumn);
    i += 1;
    column += 1;
  }
  return tokens;
}
