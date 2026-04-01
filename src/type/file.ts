export interface InitChunkDto {
    fileHash: string;
    fileName: string;
    fileSize: number;
    totalChunks: number;
}

export interface MergeChunkDto {
    uploadId: string;
    fileHash: string;
    fileName: string;
    scenario: string;
    schoolId?: number;
    courseId?: number;
    homeworkId?: number;
}
