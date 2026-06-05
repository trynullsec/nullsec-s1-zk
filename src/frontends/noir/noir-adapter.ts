export interface NoirAdapter {
  readonly frontend: "Noir";
  parse(): never;
}

export const noirAdapter: NoirAdapter = {
  frontend: "Noir",
  parse() {
    throw new Error("Noir frontend is planned but not implemented in v1.");
  }
};
