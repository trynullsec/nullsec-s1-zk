export const severityOrder = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    LOW: 2,
    INFO: 1
};
export const severities = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"];
export function normalizeSeverity(value, fallback) {
    if (!value)
        return fallback;
    const upper = value.toUpperCase();
    return severities.includes(upper) ? upper : fallback;
}
export function isAtOrAbove(severity, threshold) {
    return severityOrder[severity] >= severityOrder[threshold];
}
export function compareSeverity(a, b) {
    return severityOrder[b] - severityOrder[a];
}
//# sourceMappingURL=severity.js.map