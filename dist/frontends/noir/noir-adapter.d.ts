export interface NoirAdapter {
    readonly frontend: "Noir";
    parse(): never;
}
export declare const noirAdapter: NoirAdapter;
