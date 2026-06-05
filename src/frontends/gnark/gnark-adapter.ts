export interface GnarkAdapter {
  readonly frontend: "gnark";
  parse(): never;
}

export const gnarkAdapter: GnarkAdapter = {
  frontend: "gnark",
  parse() {
    throw new Error("gnark frontend is planned but not implemented in v1.");
  }
};
