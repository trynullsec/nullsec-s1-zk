export interface GnarkAdapter {
    readonly frontend: "gnark";
    parse(): never;
}
export declare const gnarkAdapter: GnarkAdapter;
