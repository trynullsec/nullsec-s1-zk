export class ComponentTable {
    byName = new Map();
    constructor(components) {
        for (const component of components)
            this.byName.set(component.name, component);
    }
    get(name) {
        return this.byName.get(name);
    }
}
//# sourceMappingURL=component-table.js.map