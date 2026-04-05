export enum ChunkUploadType {
    VIDEO = 1,
    NORMAL = 2
}

export interface InitChunkDto {
    fileHash: string;
    fileName: string;
    fileSize: number;
    totalChunks: number;
    type: ChunkUploadType;
    schoolId?: string;
}

export interface MergeChunkDto {
    uploadId: string;
    fileHash: string;
    fileName: string;
    scenario: string;
    schoolId?: string;
    courseId?: string;
    homeworkId?: string;
}
