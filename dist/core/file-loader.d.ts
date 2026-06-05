export interface LoadedFile {
    filePath: string;
    rawSource: string;
}
export declare function loadCircomFiles(target: string, ignore?: string[]): Promise<LoadedFile[]>;
export declare function loadRustFiles(target: string, ignore?: string[]): Promise<LoadedFile[]>;
