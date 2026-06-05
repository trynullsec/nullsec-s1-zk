import type {
  Assertion,
  Assignment,
  ComponentDeclaration,
  Constraint,
  IncludeStatement,
  ParsedCircuitFile,
  ParserWarning,
  SignalDeclaration,
  SignalKind,
  SignalVisibility,
  TemplateDeclaration
} from "../../types.js";
import { columnOf, getLine } from "../../core/source-map.js";
import { stripCircomComments } from "./circom-comments.js";
import { baseSignalName, extractSignalReferences, normalizeSignalReference } from "./circom-utils.js";

interface Statement {
  text: string;
  line: number;
  column: number;
  snippet: string;
  templateName?: string;
}

function splitStatements(source: string): Statement[] {
  const statements: Statement[] = [];
  const lines = source.split(/\r?\n/);
  let buffer = "";
  let startLine = 1;
  let startColumn = 1;
  let templateName: string | undefined;
  const stack: Array<string | undefined> = [];

  lines.forEach((lineText, index) => {
    const line = index + 1;
    const trimmed = lineText.trim();
    const templateMatch = trimmed.match(/^template\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*\{/);
    if (templateMatch) {
      templateName = templateMatch[1];
      stack.push(templateName);
      statements.push({ text: trimmed, line, column: columnOf(lineText, "template"), snippet: lineText.trim(), templateName });
      return;
    }

    if (!buffer && trimmed) {
      startLine = line;
      startColumn = Math.max(1, lineText.search(/\S/) + 1);
    }
    buffer += trimmed ? `${trimmed} ` : "";

    const terminates = trimmed.endsWith(";") || trimmed.endsWith("{") || trimmed.endsWith("}");
    if (buffer.trim() && terminates) {
      const text = buffer.trim();
      statements.push({ text, line: startLine, column: startColumn, snippet: lines[startLine - 1]?.trim() ?? text, templateName });
      buffer = "";
    }

    const closes = (trimmed.match(/}/g) ?? []).length;
    for (let i = 0; i < closes; i += 1) {
      stack.pop();
      templateName = stack[stack.length - 1];
    }
  });

  if (buffer.trim()) {
    statements.push({ text: buffer.trim(), line: startLine, column: startColumn, snippet: lines[startLine - 1]?.trim() ?? buffer.trim(), templateName });
  }
  return statements;
}

function parseArrayDimensions(name: string): string[] {
  return [...name.matchAll(/\[([^\]]+)\]/g)].map((match) => match[1]?.trim() ?? "");
}

function cleanSignalName(name: string): string {
  return normalizeSignalReference(name.replace(/;$/, ""));
}

export function parseCircomFile(filePath: string, rawSource: string): ParsedCircuitFile {
  const stripped = stripCircomComments(rawSource).source;
  const statements = splitStatements(stripped);
  const templates: TemplateDeclaration[] = [];
  const signals: SignalDeclaration[] = [];
  const components: ComponentDeclaration[] = [];
  const assignments: Assignment[] = [];
  const constraints: Constraint[] = [];
  const assertions: Assertion[] = [];
  const includes: IncludeStatement[] = [];
  const parserWarnings: ParserWarning[] = [];
  const componentMap = new Map<string, ComponentDeclaration>();

  for (const statement of statements) {
    const text = statement.text.replace(/;$/, "").trim();
    try {
      const templateMatch = text.match(/^template\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/);
      if (templateMatch) {
        templates.push({
          name: templateMatch[1] ?? "Unknown",
          params: (templateMatch[2] ?? "").split(",").map((p) => p.trim()).filter(Boolean),
          file: filePath,
          line: statement.line,
          column: statement.column,
          snippet: statement.snippet,
          templateName: templateMatch[1],
          startLine: statement.line
        });
        continue;
      }

      const includeMatch = text.match(/^include\s+["']([^"']+)["']/);
      if (includeMatch) {
        includes.push({ path: includeMatch[1] ?? "", file: filePath, line: statement.line, column: statement.column, snippet: statement.snippet, templateName: statement.templateName });
        continue;
      }

      if (/^pragma\b/.test(text)) continue;

      const componentMatch = text.match(/^component\s+([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([A-Za-z_][A-Za-z0-9_]*)\s*\((.*)\))?/);
      if (componentMatch) {
        const component: ComponentDeclaration = {
          name: componentMatch[1] ?? "unknown",
          templateType: componentMatch[2],
          params: componentMatch[3],
          inputs: [],
          outputs: ["out"],
          file: filePath,
          line: statement.line,
          column: statement.column,
          snippet: statement.snippet,
          templateName: statement.templateName
        };
        components.push(component);
        componentMap.set(component.name, component);
        continue;
      }

      const signalMatch = text.match(/^signal\s+(?:(input|output)\s+)?(?:(public|private)\s+)?(.+)$/);
      if (signalMatch) {
        const kind = (signalMatch[1] as SignalKind | undefined) ?? "internal";
        const visibility = (signalMatch[2] as SignalVisibility | undefined) ?? (kind === "input" ? "unknown" : "unknown");
        const names = (signalMatch[3] ?? "").split(",").map((part) => part.trim()).filter(Boolean);
        for (const name of names) {
          const cleaned = cleanSignalName(name);
          signals.push({
            name: cleaned,
            baseName: baseSignalName(cleaned),
            kind,
            visibility,
            arrayDimensions: parseArrayDimensions(cleaned),
            file: filePath,
            line: statement.line,
            column: statement.column,
            snippet: statement.snippet,
            templateName: statement.templateName
          });
        }
        continue;
      }

      const assertMatch = text.match(/^assert\s*\((.*)\)$/);
      if (assertMatch) {
        const expression = assertMatch[1] ?? "";
        assertions.push({
          expression,
          referencedSignals: extractSignalReferences(expression),
          file: filePath,
          line: statement.line,
          column: statement.column,
          snippet: statement.snippet,
          templateName: statement.templateName
        });
        continue;
      }

      const assignmentMatch = text.match(/^(.+?)\s*(<--|<==)\s*(.+)$/);
      if (assignmentMatch) {
        const lhs = normalizeSignalReference(assignmentMatch[1] ?? "");
        const rhs = (assignmentMatch[3] ?? "").trim();
        const operator = assignmentMatch[2] as "<--" | "<==";
        const assignment: Assignment = {
          lhs,
          rhs,
          operator,
          referencedSignals: extractSignalReferences(`${lhs} ${rhs}`),
          file: filePath,
          line: statement.line,
          column: statement.column,
          snippet: statement.snippet,
          templateName: statement.templateName
        };
        assignments.push(assignment);
        if (operator === "<==") {
          constraints.push({
            expression: `${lhs} <== ${rhs}`,
            lhs,
            rhs,
            operator,
            referencedSignals: extractSignalReferences(`${lhs} ${rhs}`),
            file: filePath,
            line: statement.line,
            column: statement.column,
            snippet: statement.snippet,
            templateName: statement.templateName
          });
        }
        const componentInput = lhs.match(/^([A-Za-z_][A-Za-z0-9_]*)\./);
        if (componentInput) componentMap.get(componentInput[1] ?? "")?.inputs.push(lhs);
        continue;
      }

      const equalityMatch = text.match(/^(.+?)\s*===\s*(.+)$/);
      if (equalityMatch) {
        const lhs = (equalityMatch[1] ?? "").trim();
        const rhs = (equalityMatch[2] ?? "").trim();
        constraints.push({
          expression: `${lhs} === ${rhs}`,
          lhs,
          rhs,
          operator: "===",
          referencedSignals: extractSignalReferences(`${lhs} ${rhs}`),
          file: filePath,
          line: statement.line,
          column: statement.column,
          snippet: statement.snippet,
          templateName: statement.templateName
        });
        continue;
      }

      if (/[<>=-]{2,3}|signal|component|assert/.test(text)) {
        parserWarnings.push({
          message: `Unsupported or partially parsed Circom statement: ${text.slice(0, 120)}`,
          file: filePath,
          line: statement.line,
          column: statement.column,
          snippet: getLine(rawSource, statement.line),
          templateName: statement.templateName
        });
      }
    } catch (error) {
      parserWarnings.push({
        message: `Failed to parse statement: ${(error as Error).message}`,
        file: filePath,
        line: statement.line,
        column: statement.column,
        snippet: getLine(rawSource, statement.line),
        templateName: statement.templateName
      });
    }
  }

  return { filePath, rawSource, templates, signals, components, assignments, constraints, assertions, includes, parserWarnings };
}
