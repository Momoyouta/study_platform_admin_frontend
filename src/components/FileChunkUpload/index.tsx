import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import type { ReactNode } from 'react';
import { Upload, Progress, message, Button, Space, Typography } from 'antd';
import {
    CloudUploadOutlined,
    FileSearchOutlined,
    CheckCircleFilled,
    ExclamationCircleFilled,
    FolderOpenOutlined
} from '@ant-design/icons';
import type { ButtonProps, UploadProps } from 'antd';
import { initChunkUpload, uploadChunk, mergeChunks } from '@/http/api';
import { ChunkUploadType } from '@/type/file';
import { useStore } from '@/store';
import HashWorker from './hash.worker?worker';
import './index.less';

const { Text } = Typography;

export interface BusinessConfig {
    schoolId?: string | number;
    courseId?: string | number;
    homeworkId?: string | number;
}

export interface ChunkUploadResult {
    filePath?: string;
    fileId?: string;
    fileHash: string;
    fileName: string;
    uploadId?: string;
    type: ChunkUploadType;
    rawInitData?: Record<string, unknown>;
    rawMergeData?: Record<string, unknown>;
}

interface FileChunkUploadProps {
    onChange?: (path: string) => void;
    onUploaded?: (result: ChunkUploadResult) => void | Promise<void>;
    scenario: string;
    businessConfig?: BusinessConfig;
    previewPath?: string;
    buttonText?: string;
    maxSizeMB?: number;
    disabled?: boolean;
    autoMerge?: boolean;
    style?: React.CSSProperties;
    uploadType?: ChunkUploadType;
    accept?: string;
    resourceLabel?: string;
    mode?: 'card' | 'button';
    buttonClassName?: string;
    buttonType?: ButtonProps['type'];
    buttonSize?: ButtonProps['size'];
    buttonIcon?: ReactNode;
    showSuccessMessage?: boolean;
    successMessage?: string;
}

export interface FileChunkUploadHandle {
    merge: () => Promise<string | undefined>;
}

enum UploadStatus {
    IDLE = 'IDLE',
    HASHING = 'HASHING',
    UPLOADING = 'UPLOADING',
    WAITING_MERGE = 'WAITING_MERGE',
    MERGING = 'MERGING',
    SUCCESS = 'SUCCESS',
    ERROR = 'ERROR'
}

const CHUNK_SIZE = 5 * 1024 * 1024;

const toRecord = (value: unknown): Record<string, unknown> => {
    if (value && typeof value === 'object') {
        return value as Record<string, unknown>;
    }
    return {};
};

const toOptionalString = (value: unknown): string | undefined => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }
    return String(value);
};

const resolveFilePathFromPayload = (payload?: Record<string, unknown>) => {
    if (!payload) {
        return undefined;
    }

    const candidates = [payload.filePath, payload.file_path, payload.path, payload.url];
    return candidates
        .map((item) => toOptionalString(item))
        .find((item) => !!item);
};

const resolveFileIdFromPayload = (payload?: Record<string, unknown>) => {
    if (!payload) {
        return undefined;
    }

    const candidates = [payload.file_id, payload.fileId, payload.id, payload.fileChunkId];
    return candidates
        .map((item) => toOptionalString(item))
        .find((item) => !!item);
};

const getErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (typeof error === 'string' && error) {
        return error;
    }

    return fallback;
};

const FileChunkUpload = forwardRef<FileChunkUploadHandle, FileChunkUploadProps>(({
    onChange,
    onUploaded,
    scenario,
    businessConfig = {},
    previewPath,
    maxSizeMB = 2048,
    disabled = false,
    autoMerge = true,
    style = {},
    uploadType = ChunkUploadType.VIDEO,
    accept,
    resourceLabel,
    mode = 'card',
    buttonClassName,
    buttonType = 'primary',
    buttonSize = 'middle',
    buttonIcon = <CloudUploadOutlined />,
    showSuccessMessage = true,
    successMessage,
    buttonText,
}, ref) => {
    const { CourseStore } = useStore();
    const isVideoType = uploadType === ChunkUploadType.VIDEO;
    const resolvedResourceLabel = resourceLabel || (isVideoType ? '视频' : '文件');
    const resolvedButtonText = buttonText || (isVideoType ? '选择并上传视频' : '选择并上传文件');
    const resolvedAccept = accept === undefined ? (isVideoType ? 'video/*' : undefined) : accept;
    const resolvedSuccessMessage = successMessage || `${resolvedResourceLabel}上传成功`;

    const normalizeId = (id?: string | number) => {
        if (id === undefined || id === null || id === '') {
            return undefined;
        }

        const normalized = String(id).trim();
        return normalized || undefined;
    };

    const resolvedBusinessConfig: BusinessConfig = {
        ...businessConfig,
        schoolId: businessConfig.schoolId ?? (CourseStore.schoolId || undefined),
        // 不自动回退 courseId，避免 temp_video 场景将字符串 courseId 注入分片接口触发后端 number 校验错误
        courseId: businessConfig.courseId,
    };

    const normalizedPayloadConfig = {
        schoolId: normalizeId(resolvedBusinessConfig.schoolId),
        courseId: normalizeId(resolvedBusinessConfig.courseId),
        homeworkId: normalizeId(resolvedBusinessConfig.homeworkId),
    };

    const [status, setStatus] = useState<UploadStatus>(previewPath ? UploadStatus.SUCCESS : UploadStatus.IDLE);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState(previewPath ? `${resolvedResourceLabel}已挂载` : '');
    const [currentFileName, setCurrentFileName] = useState<string>(previewPath ? previewPath.split('/').pop() || '' : '');

    const [uploadInfo, setUploadInfo] = useState<{
        uploadId: string;
        fileHash: string;
        fileName: string;
        initData?: Record<string, unknown>;
    } | null>(null);

    useEffect(() => {
        if (previewPath) {
            const fileName = previewPath.split('/').pop() || '';
            setStatus(UploadStatus.SUCCESS);
            setStatusText(`${resolvedResourceLabel}已挂载`);
            setProgress(100);
            setCurrentFileName(fileName);
            return;
        }

        setStatus(UploadStatus.IDLE);
        setStatusText('');
        setProgress(0);
        setCurrentFileName('');
        setUploadInfo(null);
    }, [previewPath, resolvedResourceLabel]);

    const buildUploadResult = (
        fileHash: string,
        fileName: string,
        uploadId: string | undefined,
        initData?: Record<string, unknown>,
        mergeData?: Record<string, unknown>
    ): ChunkUploadResult => {
        const filePath = resolveFilePathFromPayload(mergeData) || resolveFilePathFromPayload(initData);
        const fileId = resolveFileIdFromPayload(mergeData) || resolveFileIdFromPayload(initData);

        return {
            filePath,
            fileId,
            fileHash,
            fileName,
            uploadId,
            type: uploadType,
            rawInitData: initData,
            rawMergeData: mergeData,
        };
    };

    const onUploadComplete = async (result: ChunkUploadResult) => {
        if (onUploaded) {
            await onUploaded(result);
        }

        setStatus(UploadStatus.SUCCESS);
        setStatusText('上传成功');
        setProgress(100);
        setCurrentFileName(result.fileName);

        if (result.filePath && onChange) {
            onChange(result.filePath);
        }

        if (showSuccessMessage) {
            message.success(resolvedSuccessMessage);
        }
    };

    const manualMerge = async () => {
        if (!uploadInfo) {
            message.warning('尚未完成分片上传，无法合并');
            return;
        }

        setStatus(UploadStatus.MERGING);
        setStatusText('正在合并分片...');

        try {
            const mergeRes = await mergeChunks({
                uploadId: uploadInfo.uploadId,
                fileHash: uploadInfo.fileHash,
                fileName: uploadInfo.fileName,
                scenario,
                ...normalizedPayloadConfig
            });

            const mergeData = toRecord(mergeRes?.data);
            const result = buildUploadResult(
                uploadInfo.fileHash,
                uploadInfo.fileName,
                uploadInfo.uploadId,
                uploadInfo.initData,
                mergeData
            );

            if (isVideoType && !result.filePath) {
                throw new Error('合并失败，未返回可用视频路径');
            }

            await onUploadComplete(result);
            return result.filePath;
        } catch (error) {
            const errorText = getErrorMessage(error, '合并失败');
            setStatus(UploadStatus.ERROR);
            setStatusText(errorText);
            console.error(errorText);
            throw error;
        }
    };

    useImperativeHandle(ref, () => ({
        merge: manualMerge
    }));

    const handleUpload = async (file: File) => {
        setStatus(UploadStatus.HASHING);
        setStatusText('正在计算指纹...');
        setProgress(0);
        setCurrentFileName(file.name);

        try {
            const fileHash = await calculateHash(file);
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const initRes = await initChunkUpload({
                fileHash,
                fileName: file.name,
                fileSize: file.size,
                totalChunks,
                type: uploadType,
                schoolId: normalizedPayloadConfig.schoolId
            });

            const initData = toRecord(initRes?.data);
            const uploadId = toOptionalString(initData.uploadId);

            if (!uploadId) {
                const result = buildUploadResult(fileHash, file.name, undefined, initData);
                if (isVideoType && !result.filePath) {
                    throw new Error('上传完成但未返回可用视频路径');
                }
                await onUploadComplete(result);
                return;
            }

            const uploadedChunks = Array.isArray(initData.uploadedChunks) ? initData.uploadedChunks : [];
            const uploadedSet = new Set<number>(
                uploadedChunks
                    .map((item) => Number(item))
                    .filter((item) => Number.isInteger(item) && item >= 0)
            );

            let uploadedCount = Math.min(uploadedSet.size, totalChunks);
            if (uploadedCount > 0) {
                setProgress(Math.floor((uploadedCount / totalChunks) * 100));
            }

            setStatus(UploadStatus.UPLOADING);
            setStatusText('正在上传分片...');

            for (let i = 0; i < totalChunks; i++) {
                if (uploadedSet.has(i)) {
                    continue;
                }

                const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
                const formData = new FormData();
                formData.append('file', chunk);
                formData.append('uploadId', uploadId);
                formData.append('chunkIndex', i.toString());
                formData.append('fileHash', fileHash);
                formData.append('scenario', scenario);

                if (normalizedPayloadConfig.schoolId !== undefined) formData.append('schoolId', String(normalizedPayloadConfig.schoolId));
                if (normalizedPayloadConfig.courseId !== undefined) formData.append('courseId', String(normalizedPayloadConfig.courseId));
                if (normalizedPayloadConfig.homeworkId !== undefined) formData.append('homeworkId', String(normalizedPayloadConfig.homeworkId));

                await uploadChunk(formData);

                uploadedCount += 1;
                setProgress(Math.floor((uploadedCount / totalChunks) * 100));
            }

            const currentUploadInfo = {
                uploadId,
                fileHash,
                fileName: file.name,
                initData,
            };
            setUploadInfo(currentUploadInfo);

            if (autoMerge) {
                setStatus(UploadStatus.MERGING);
                setStatusText('分片上传完成，正在合并...');

                const mergeRes = await mergeChunks({
                    uploadId: currentUploadInfo.uploadId,
                    fileHash: currentUploadInfo.fileHash,
                    fileName: currentUploadInfo.fileName,
                    scenario,
                    ...normalizedPayloadConfig
                });

                const mergeData = toRecord(mergeRes?.data);
                const result = buildUploadResult(
                    fileHash,
                    file.name,
                    uploadId,
                    initData,
                    mergeData
                );

                if (isVideoType && !result.filePath) {
                    throw new Error('合并失败，未返回可用视频路径');
                }

                await onUploadComplete(result);
            } else {
                setStatus(UploadStatus.WAITING_MERGE);
                setStatusText('分片上传已完成，等待合并指令');
            }

        } catch (error) {
            const errorText = getErrorMessage(error, '上传失败');
            console.error(errorText);
            setStatus(UploadStatus.ERROR);
            setStatusText(errorText);
        }
    };

    const calculateHash = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const worker = new HashWorker();
            worker.postMessage({ file, chunkSize: CHUNK_SIZE });
            worker.onmessage = (e: MessageEvent) => {
                const { type, progress, hash, error } = e.data;
                if (type === 'progress') {
                    setProgress(progress);
                } else if (type === 'success') {
                    resolve(hash);
                    worker.terminate();
                } else if (type === 'error') {
                    reject(new Error(error || '文件哈希计算失败'));
                    worker.terminate();
                }
            };
        });
    };

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            if (file.size > maxSizeMB * 1024 * 1024) {
                message.error(`文件不能超过 ${maxSizeMB}MB`);
                return Upload.LIST_IGNORE;
            }

            void handleUpload(file as unknown as File);
            return false;
        },
        showUploadList: false,
        accept: resolvedAccept,
        disabled: disabled || (status !== UploadStatus.IDLE && status !== UploadStatus.SUCCESS && status !== UploadStatus.ERROR)
    };

    const renderButtonMode = () => {
        const loading = status === UploadStatus.HASHING || status === UploadStatus.UPLOADING || status === UploadStatus.MERGING;
        const shouldShowProgress = status === UploadStatus.HASHING || status === UploadStatus.UPLOADING || status === UploadStatus.MERGING;
        const shouldShowHint = shouldShowProgress || status === UploadStatus.WAITING_MERGE || status === UploadStatus.ERROR;

        return (
            <div className="upload-button-mode">
                <Upload {...uploadProps}>
                    <Button
                        type={buttonType}
                        size={buttonSize}
                        icon={buttonIcon}
                        className={buttonClassName}
                        loading={loading}
                        disabled={uploadProps.disabled}
                    >
                        {resolvedButtonText}
                    </Button>
                </Upload>

                {shouldShowHint ? (
                    <div className="button-mode-hint">
                        <Text type={status === UploadStatus.ERROR ? 'danger' : 'secondary'}>{statusText || currentFileName}</Text>
                        {shouldShowProgress ? <Progress percent={progress} size="small" /> : null}
                    </div>
                ) : null}
            </div>
        );
    };

    const renderContent = () => {
        if (mode === 'button') {
            return renderButtonMode();
        }

        switch (status) {
            case UploadStatus.HASHING:
            case UploadStatus.UPLOADING:
                return (
                    <div className="upload-progress-wrapper">
                        <Space direction="vertical" className="full-width-space">
                            <div className="upload-progress-header">
                                <Text strong>{status === UploadStatus.HASHING ? <FileSearchOutlined /> : <CloudUploadOutlined />} {statusText}</Text>
                                <Text type="secondary">{progress}%</Text>
                            </div>
                            <Progress percent={progress} status="active" strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }} />
                            <Text type="secondary" ellipsis title={currentFileName} className="file-name-text">{currentFileName}</Text>
                        </Space>
                    </div>
                );
            case UploadStatus.WAITING_MERGE:
                return (
                    <div className="upload-status-card waiting-merge">
                        <CheckCircleFilled className="status-icon blue" />
                        <div className="status-text-wrapper">
                            <Text strong>{statusText}</Text>
                        </div>
                    </div>
                );
            case UploadStatus.MERGING:
                return (
                    <div className="upload-status-card merging">
                        <CloudUploadOutlined className="status-icon blue" />
                        <div className="status-text-wrapper">
                            <Text strong>{statusText}</Text>
                            <br />
                            <Text type="secondary">文件较大时可能需要较长时间</Text>
                        </div>
                    </div>
                );
            case UploadStatus.SUCCESS:
                return (
                    <Upload {...uploadProps} style={{ width: '100%' }}>
                        <div className="resource-card mounted">
                            <div className="card-inner">
                                <CheckCircleFilled className="status-icon green" />
                                <div>
                                    <Text strong>{resolvedResourceLabel}挂载成功</Text>
                                    <br />
                                    <Text type="secondary" ellipsis title={currentFileName}>{currentFileName}</Text>
                                </div>
                                <Text className="re-upload-text">点击重新上传</Text>
                            </div>
                        </div>
                    </Upload>
                );
            case UploadStatus.ERROR:
                return (
                    <Upload {...uploadProps} style={{ width: '100%' }}>
                        <div className="resource-card error">
                            <div className="card-inner">
                                <ExclamationCircleFilled className="status-icon red" />
                                <div>
                                    <Text strong>上传失败</Text>
                                    <br />
                                    <Text type="secondary">{statusText}</Text>
                                </div>
                                <Button size="small" type="primary" danger className="status-btn">重新上传</Button>
                            </div>
                        </div>
                    </Upload>
                );
            default:
                return (
                    <Upload {...uploadProps} style={{ width: '100%' }}>
                        <div className="resource-card empty">
                            <div className="card-inner">
                                <FolderOpenOutlined className="status-icon-large" />
                                <p className="upload-desc">{resolvedButtonText}</p>
                                <Text className="upload-hint">支持分片断点续传，最大可上传 {maxSizeMB / 1024}GB</Text>
                            </div>
                        </div>
                    </Upload>
                );
        }
    };

    return (
        <div className={`video-chunk-upload-container upload-mode-${mode}`} style={style}>
            {renderContent()}
        </div>
    );
});
export default FileChunkUpload;
