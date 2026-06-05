export interface CommentStripResult {
    source: string;
    comments: Array<{
        line: number;
        text: string;
    }>;
}
export declare function stripCircomComments(source: string): CommentStripResult;
