export enum ChunkUploadType {
    VIDEO = 1,
    NORMAL = 2
}

export type FileChunkStatus = 'pending' | 'merging' | 'done' | 'expired';

export type FileChunkSortBy = 'createTime' | 'updateTime' | 'fileSize';

export type FileChunkSortOrder = 'ASC' | 'DESC';

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

export interface FileChunkAdminQueryParams {
    page?: number;
    pageSize?: number;
    id?: string;
    fileHash?: string;
    filename?: string;
    status?: FileChunkStatus;
    type?: ChunkUploadType;
    creatorId?: string;
    schoolId?: string;
    sortBy?: FileChunkSortBy;
    sortOrder?: FileChunkSortOrder;
}

export interface FileChunkAdminListItemDto {
    id: string;
    fileHash: string;
    fileName: string;
    fileSize: number;
    status: FileChunkStatus;
    targetPath?: string | null;
    type?: ChunkUploadType | null;
    creatorId?: string | null;
    schoolId?: string | null;
    createTime?: string;
    updateTime?: string;
    creatorName?: string | null;
    schoolName?: string | null;
}

export interface FileChunkAdminListResponseDto {
    items: FileChunkAdminListItemDto[];
    total: number;
}

export interface UpdateFileChunkFilenameDto {
    id: string;
    fileName: string;
}

export interface UpdateFileChunkFilenameResponseDto {
    id: string;
    fileName: string;
    updateTime: string;
}

export interface DeleteFileChunkResponseDto {
    id: string;
    force: boolean;
    removed: boolean;
}

export interface MoveFileChunkToSchoolDto {
    fileId: string;
    schoolId: string;
}

export interface MoveFileChunkResponseDto {
    id: string;
    schoolId: string;
    targetPath: string;
    filePath: string;
    updateTime: string;
}
