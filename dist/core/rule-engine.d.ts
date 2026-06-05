import type { AuditContext, Issue, Rule } from "../types.js";
export declare class RuleEngine {
    private readonly rules;
    constructor(rules: Rule[]);
    run(context: AuditContext): {
        issues: Issue[];
        rulesExecuted: number;
    };
    private sortAndDeduplicate;
}
