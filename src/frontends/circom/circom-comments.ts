export interface CommentStripResult {
  source: string;
  comments: Array<{ line: number; text: string }>;
}

export function stripCircomComments(source: string): CommentStripResult {
  let output = "";
  const comments: Array<{ line: number; text: string }> = [];
  let line = 1;
  let i = 0;

  while (i < source.length) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === "/" && next === "/") {
      const startLine = line;
      let text = "";
      while (i < source.length && source[i] !== "\n") {
        text += source[i];
        output += " ";
        i += 1;
      }
      comments.push({ line: startLine, text });
      continue;
    }

    if (ch === "/" && next === "*") {
      const startLine = line;
      let text = "";
      while (i < source.length) {
        const current = source[i];
        const following = source[i + 1];
        text += current;
        if (current === "\n") {
          output += "\n";
          line += 1;
        } else {
          output += " ";
        }
        i += 1;
        if (current === "*" && following === "/") {
          text += following;
          output += " ";
          i += 1;
          break;
        }
      }
      comments.push({ line: startLine, text });
      continue;
    }

    output += ch;
    if (ch === "\n") line += 1;
    i += 1;
  }

  return { source: output, comments };
}
