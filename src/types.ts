export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
export type Confidence = "HIGH" | "MEDIUM" | "LOW";
export type SignalKind = "input" | "output" | "internal";
export type SignalVisibility = "public" | "private" | "unknown";
export type AssignmentOperator = "<--" | "<==";
export type ConstraintOperator = "===" | "<==";
export type OutputFormat = "terminal" | "json" | "markdown" | "sarif";

export interface SourceLocation {
  file: string;
  line: number;
  column?: number;
  snippet?: string;
  templateName?: string;
}

export interface Issue {
  id: string;
  ruleId: string;
  title: string;
  severity: Severity;
  confidence: Confidence;
  file: string;
  line: number;
  column?: number;
  snippet?: string;
  templateName?: string;
  signalName?: string;
  explanation: string;
  impact: string;
  suggestedFix: string;
  references?: string[];
  tags: string[];
  metadata?: Record<string, unknown>;
}

export interface ParserWarning extends SourceLocation {
  message: string;
}

export interface TemplateDeclaration extends SourceLocation {
  name: string;
  params: string[];
  startLine: number;
  endLine?: number;
}

export interface SignalDeclaration extends SourceLocation {
  name: string;
  baseName: string;
  kind: SignalKind;
  visibility: SignalVisibility;
  arrayDimensions: string[];
  typeInfo?: string;
}

export interface Assignment extends SourceLocation {
  lhs: string;
  rhs: string;
  operator: AssignmentOperator;
  referencedSignals: string[];
}

export interface Constraint extends SourceLocation {
  expression: string;
  lhs?: string;
  rhs?: string;
  operator: ConstraintOperator;
  referencedSignals: string[];
}

export interface Assertion extends SourceLocation {
  expression: string;
  referencedSignals: string[];
}

export interface ComponentDeclaration extends SourceLocation {
  name: string;
  templateType?: string;
  params?: string;
  inputs: string[];
  outputs: string[];
}

export interface IncludeStatement extends SourceLocation {
  path: string;
}

export interface ParsedCircuitFile {
  filePath: string;
  rawSource: string;
  templates: TemplateDeclaration[];
  signals: SignalDeclaration[];
  components: ComponentDeclaration[];
  assignments: Assignment[];
  constraints: Constraint[];
  assertions: Assertion[];
  includes: IncludeStatement[];
  parserWarnings: ParserWarning[];
}

export interface CircuitIR {
  files: ParsedCircuitFile[];
  signals: SignalDeclaration[];
  components: ComponentDeclaration[];
  assignments: Assignment[];
  constraints: Constraint[];
  assertions: Assertion[];
  parserWarnings: ParserWarning[];
}

export interface Rule {
  id: string;
  title: string;
  description: string;
  defaultSeverity: Severity;
  tags: string[];
  analyze(context: AuditContext): Issue[];
}

export interface RuleConfig {
  [ruleId: string]: "off" | "critical" | "high" | "medium" | "low" | "info" | Severity;
}

export interface NullsecConfig {
  rules: RuleConfig;
  ignore: string[];
  failOn: Severity;
  format: OutputFormat;
  field: "BN254" | string;
}

export interface AuditContext {
  target: string;
  ir: CircuitIR;
  graph: ConstraintGraphLike;
  config: NullsecConfig;
}

export interface ConstraintGraphLike {
  declaredSignals(): SignalDeclaration[];
  inputSignals(): SignalDeclaration[];
  publicInputSignals(): SignalDeclaration[];
  outputSignals(): SignalDeclaration[];
  assignedByHint(): Assignment[];
  assignedByConstraint(): Assignment[];
  constraintsForSignal(signalName: string): Constraint[];
  assignmentsForSignal(signalName: string): Assignment[];
  appearsInAnyConstraint(signalName: string): boolean;
  appearsInEqualityConstraint(signalName: string): boolean;
  onlyAssignedButNeverConstrained(): Assignment[];
  unboundInputs(): SignalDeclaration[];
  unconstrainedOutputs(): SignalDeclaration[];
  hasBooleanityConstraint(signalName: string): boolean;
  hasRangeCheck(signalName: string, templateName?: string): boolean;
  isComponentOutputReference(reference: string): boolean;
  isComponentOutputConstrained(reference: string): boolean;
  signalReferences(signalName: string): SourceLocation[];
}

export interface AuditSummary {
  CRITICAL: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
  INFO: number;
}

export interface AuditResult {
  tool: {
    name: "Nullsec S1-ZK";
    version: string;
  };
  target: string;
  frontend: "Circom";
  filesScanned: number;
  rulesExecuted: number;
  summary: AuditSummary;
  issues: Issue[];
  parserWarnings: ParserWarning[];
}

export interface ScanOptions {
  format?: OutputFormat;
  report?: OutputFormat;
  out?: string;
  failOn?: Severity;
  configPath?: string;
}
