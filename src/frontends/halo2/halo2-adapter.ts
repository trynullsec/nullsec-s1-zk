export interface Halo2Adapter {
  readonly frontend: "Halo2";
  parse(): never;
}

export const halo2Adapter: Halo2Adapter = {
  frontend: "Halo2",
  parse() {
    throw new Error("Halo2 frontend is planned but not implemented in v1.");
  }
};
