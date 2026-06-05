import type { ComponentDeclaration } from "../types.js";

export class ComponentTable {
  private readonly byName = new Map<string, ComponentDeclaration>();

  constructor(components: ComponentDeclaration[]) {
    for (const component of components) this.byName.set(component.name, component);
  }

  get(name: string): ComponentDeclaration | undefined {
    return this.byName.get(name);
  }
}
