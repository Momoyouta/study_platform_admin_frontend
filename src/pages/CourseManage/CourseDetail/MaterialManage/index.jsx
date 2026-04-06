import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    Form,
    Input,
    Modal,
    Pagination,
    Space,
    Table,
    Tooltip,
    message,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    DownloadOutlined,
    FileImageOutlined,
    FileOutlined,
    FilePdfOutlined,
    FilePptOutlined,
    FileTextOutlined,
    FileWordOutlined,
    SearchOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import {
    bindCourseMaterial,
    deleteCourseMaterial,
    listCourseMaterial,
    updateCourseMaterial,
} from '@/http/api.ts';
import { ChunkUploadType } from '@/type/file.ts';
import { UploadScenarioMap } from '@/type/map.js';
import { downloadFile } from '@/utils/download.ts';
import FileChunkUpload from '@/components/FileChunkUpload';
import './index.less';

const MATERIAL_UPLOAD_SCENARIO = UploadScenarioMap.TEMP_DOCUMENT;

const isSuccessResponse = (res) => res?.code === 200 || res?.success || !!res?.data;

const normalizeOptionalId = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    const normalized = String(value).trim();
    return normalized || undefined;
};

const formatDateValue = (value) => {
    if (value === undefined || value === null || value === '') {
        return '-';
    }

    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) {
        if (numberValue > 1000000000000) {
            return moment(numberValue).format('YYYY-MM-DD HH:mm:ss');
        }
        if (numberValue > 0) {
            return moment.unix(numberValue).format('YYYY-MM-DD HH:mm:ss');
        }
    }

    return moment(value).isValid() ? moment(value).format('YYYY-MM-DD HH:mm:ss') : String(value);
};

const formatFileSize = (size) => {
    const bytes = Number(size);
    if (!Number.isFinite(bytes) || bytes < 0) {
        return '-';
    }
    if (bytes < 1024) {
        return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const getFileExt = (fileName) => {
    const source = String(fileName || '').trim();
    if (!source.includes('.')) {
        return '';
    }

    return source.slice(source.lastIndexOf('.') + 1).toLowerCase();
};

const getFileSuffix = (fileName) => {
    const source = String(fileName || '').trim();
    if (!source.includes('.')) {
        return '';
    }

    return source.slice(source.lastIndexOf('.'));
};

const getFileTypeMeta = (fileName, chunkType) => {
    const ext = getFileExt(fileName);

    if (chunkType === ChunkUploadType.VIDEO || ['mp4', 'mov', 'avi', 'mkv', 'flv', 'webm'].includes(ext)) {
        return {
            label: 'Video',
            icon: <VideoCameraOutlined className="material-type-icon video" />,
        };
    }

    if (ext === 'pdf') {
        return {
            label: 'PDF',
            icon: <FilePdfOutlined className="material-type-icon pdf" />,
        };
    }

    if (['doc', 'docx'].includes(ext)) {
        return {
            label: 'Word',
            icon: <FileWordOutlined className="material-type-icon word" />,
        };
    }

    if (['ppt', 'pptx'].includes(ext)) {
        return {
            label: 'PPTX',
            icon: <FilePptOutlined className="material-type-icon ppt" />,
        };
    }

    if (['txt', 'md', 'csv', 'json', 'xml'].includes(ext)) {
        return {
            label: 'Text',
            icon: <FileTextOutlined className="material-type-icon text" />,
        };
    }

    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext)) {
        return {
            label: 'Image',
            icon: <FileImageOutlined className="material-type-icon image" />,
        };
    }

    return {
        label: ext ? ext.toUpperCase() : 'File',
        icon: <FileOutlined className="material-type-icon default" />,
    };
};

const getMaterialFileName = (record) => {
    return record?.fileName || record?.file_name || record?.chunkFileName || '-';
};

const getFileNameBase = (fileName) => {
    const source = String(fileName || '').trim();
    if (!source) {
        return '';
    }

    const suffix = getFileSuffix(source);
    if (!suffix) {
        return source;
    }

    return source.slice(0, -suffix.length);
};

const resolveFileId = (payload) => {
    if (!payload || typeof payload !== 'object') {
        return '';
    }

    const candidates = [
        payload.file_id,
        payload.fileId,
        payload.id,
        payload.fileChunkId,
    ];

    const hit = candidates.find((item) => item !== undefined && item !== null && item !== '');
    return hit ? String(hit) : '';
};

const MaterialManage = ({ courseId, schoolId }) => {
    const requestIdRef = useRef(0);
    const [renameForm] = Form.useForm();

    const [keyword, setKeyword] = useState('');
    const [loading, setLoading] = useState(false);
    const [tableData, setTableData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [renameSubmitting, setRenameSubmitting] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const editingMaterialName = getMaterialFileName(editingRecord);
    const editingMaterialSuffix = editingMaterialName && editingMaterialName !== '-' ? getFileSuffix(editingMaterialName) : '';
    const renameBaseMaxLength = Math.max(1, 255 - editingMaterialSuffix.length);

    const normalizedCourseId = normalizeOptionalId(courseId);
    const normalizedSchoolId = normalizeOptionalId(schoolId);

    const fetchList = useCallback(async (pageParams, fileNameKeyword = '') => {
        if (!normalizedCourseId) {
            setTableData([]);
            setTotal(0);
            return;
        }

        const currentRequestId = ++requestIdRef.current;
        setLoading(true);
        try {
            const params = {
                course_id: normalizedCourseId,
                page: pageParams.current,
                pageSize: pageParams.pageSize,
            };

            if (fileNameKeyword) {
                params.file_name = fileNameKeyword;
            }

            const res = await listCourseMaterial(params);
            if (!isSuccessResponse(res)) {
                message.error(res?.msg || '获取课程资料列表失败');
                return;
            }

            const list = Array.isArray(res?.data?.list) ? res.data.list : [];
            const nextTotal = Number(res?.data?.total);

            if (currentRequestId !== requestIdRef.current) {
                return;
            }

            const normalizedList = list.map((item) => {
                return {
                    ...item,
                    fileId: item?.fileId || item?.file_id || '',
                    fileHash: item?.fileHash || item?.file_hash || '',
                    fileName: item?.fileName || item?.file_name || '',
                    fileSize: item?.fileSize ?? item?.file_size,
                    targetPath: item?.targetPath || item?.filePath || item?.target_path || '',
                    type: item?.type ?? item?.chunkType,
                    createTime: item?.createTime || item?.create_time,
                    updateTime: item?.updateTime || item?.update_time,
                    creatorId: item?.creatorId || item?.uploader_id,
                    creatorName: item?.creatorName || item?.uploader_name,
                    key: item.id,
                };
            });

            setTableData(normalizedList);
            setTotal(Number.isFinite(nextTotal) ? nextTotal : normalizedList.length);
            setPagination((prev) => ({
                ...prev,
                current: pageParams.current,
                pageSize: pageParams.pageSize,
            }));
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            console.error('Failed to fetch course materials', error);
            message.error('获取课程资料列表失败');
        } finally {
            if (currentRequestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [normalizedCourseId]);

    useEffect(() => {
        if (!normalizedCourseId) {
            return;
        }

        fetchList({ current: 1, pageSize: 10 }, '');
    }, [fetchList, normalizedCourseId]);

    const handleSearch = useCallback(() => {
        const normalizedKeyword = keyword.trim();
        fetchList({ current: 1, pageSize: pagination.pageSize }, normalizedKeyword);
    }, [fetchList, keyword, pagination.pageSize]);

    const handleMaterialUploaded = useCallback(async (uploadResult) => {
        if (!normalizedCourseId) {
            throw new Error('课程ID缺失，无法绑定资料');
        }

        if (!normalizedSchoolId) {
            throw new Error('课程学校信息未加载完成，请稍后重试');
        }

        let fileId = resolveFileId(uploadResult?.rawMergeData)
            || resolveFileId(uploadResult?.rawInitData)
            || resolveFileId(uploadResult)
            || '';

        if (!fileId) {
            throw new Error('上传成功但未获取到文件ID，请稍后重试');
        }

        const bindRes = await bindCourseMaterial({
            course_id: normalizedCourseId,
            file_id: fileId,
        });

        if (!isSuccessResponse(bindRes) || bindRes?.data?.bound === false) {
            throw new Error(bindRes?.msg || '课程资料绑定失败');
        }

        message.success('上传并绑定成功');
        await fetchList({ current: 1, pageSize: pagination.pageSize }, keyword.trim());
    }, [fetchList, keyword, normalizedCourseId, normalizedSchoolId, pagination.pageSize]);

    const closeRenameModal = useCallback(() => {
        setRenameModalOpen(false);
        setEditingRecord(null);
        setRenameSubmitting(false);
        renameForm.resetFields();
    }, [renameForm]);

    const handleOpenRenameModal = useCallback((record) => {
        const currentName = getMaterialFileName(record);
        setEditingRecord(record);
        renameForm.setFieldsValue({
            file_name_base: currentName === '-' ? '' : getFileNameBase(currentName),
        });
        setRenameModalOpen(true);
    }, [renameForm]);

    const handleRenameSubmit = useCallback(async () => {
        try {
            const values = await renameForm.validateFields();
            if (!editingRecord?.id) {
                message.error('未找到可编辑的资料记录');
                return;
            }

            setRenameSubmitting(true);
            const originalName = getMaterialFileName(editingRecord);
            const lockedSuffix = originalName && originalName !== '-' ? getFileSuffix(originalName) : '';
            const payload = {
                material_id: String(editingRecord.id),
                file_name: `${String(values.file_name_base || '').trim()}${lockedSuffix}`,
            };

            const res = await updateCourseMaterial(payload);
            if (!isSuccessResponse(res) || res?.data?.updated === false) {
                message.error(res?.msg || '修改文件名失败');
                return;
            }

            message.success('文件名修改成功');
            closeRenameModal();
            await fetchList(
                { current: pagination.current, pageSize: pagination.pageSize },
                keyword.trim()
            );
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error('Failed to rename course material', error);
            message.error(error?.message || '修改文件名失败');
        } finally {
            setRenameSubmitting(false);
        }
    }, [closeRenameModal, editingRecord, fetchList, keyword, pagination, renameForm]);

    const handleDeleteRecords = (records) => {
        if (!Array.isArray(records) || !records.length) {
            message.warning('请先选择要删除的资料');
            return;
        }

        Modal.confirm({
            title: records.length > 1 ? `确认删除 ${records.length} 项资料` : '确认删除该资料',
            content: '删除模式将使用“仅解绑”，不会删除底层文件。',
            okText: '确认删除',
            cancelText: '取消',
            okButtonProps: { danger: true },
            onOk: async () => {
                const results = await Promise.allSettled(
                    records.map((record) => deleteCourseMaterial({
                        material_id: String(record.id),
                        mode: 1,
                    }))
                );

                const successCount = results.filter(
                    (item) => item.status === 'fulfilled' && (item.value?.code === 200 || item.value?.data?.deleted)
                ).length;
                const failCount = records.length - successCount;

                if (successCount > 0) {
                    message.success(`删除成功 ${successCount} 条`);
                }
                if (failCount > 0) {
                    message.warning(`删除失败 ${failCount} 条`);
                }

                await fetchList(
                    { current: pagination.current, pageSize: pagination.pageSize },
                    keyword.trim()
                );
            },
        });
    };

    const handleDownload = useCallback(async (record) => {
        const downloadSchoolId = String(
            record?.schoolId || record?.school_id || normalizedSchoolId || ''
        ).trim();
        const downloadFileHash = String(record?.fileHash || record?.file_hash || '').trim();

        if (!downloadSchoolId || !downloadFileHash) {
            message.warning('暂无可下载文件地址');
            return;
        }

        const materialFileName = getMaterialFileName(record);
        const downloadFileName = materialFileName && materialFileName !== '-'
            ? materialFileName
            : downloadFileHash;

        await downloadFile({
            schoolId: downloadSchoolId,
            fileHash: downloadFileHash,
            fileName: downloadFileName,
        });
    }, [normalizedSchoolId]);

    const rowSelection = useMemo(() => ({
        selectedRowKeys,
        preserveSelectedRowKeys: true,
        onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
        },
    }), [selectedRowKeys]);

    const columns = [
        {
            title: '文件名',
            dataIndex: 'fileName',
            key: 'fileName',
            render: (_, record) => (
                <span className="file-name-cell" title={getMaterialFileName(record)}>
                    {getMaterialFileName(record)}
                </span>
            ),
        },
        {
            title: '文件类型',
            key: 'file_type',
            width: 180,
            render: (_, record) => {
                const typeMeta = getFileTypeMeta(getMaterialFileName(record), record?.type);
                return (
                    <span className="material-type-cell">
                        {typeMeta.icon}
                        <span>{typeMeta.label}</span>
                    </span>
                );
            },
        },
        {
            title: '大小',
            key: 'file_size',
            width: 140,
            render: (_, record) => (
                <span className="material-size-cell">{formatFileSize(record?.fileSize)}</span>
            ),
        },
        {
            title: '创建日期',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 190,
            render: (value) => (
                <span className="material-date-cell">{formatDateValue(value)}</span>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 140,
            render: (_, record) => {
                const downloadSchoolId = String(
                    record?.schoolId || record?.school_id || normalizedSchoolId || ''
                ).trim();
                const downloadFileHash = String(record?.fileHash || record?.file_hash || '').trim();
                const canDownload = !!(downloadSchoolId && downloadFileHash);

                return (
                    <Space size={4} className="material-action-group">
                        <Tooltip title="修改文件名">
                            <Button
                                type="text"
                                icon={<EditOutlined />}
                                className="material-action-btn"
                                onClick={() => handleOpenRenameModal(record)}
                            />
                        </Tooltip>
                        <Tooltip title={canDownload ? '下载' : '暂无可下载文件地址'}>
                            <Button
                                type="text"
                                icon={<DownloadOutlined />}
                                className="material-action-btn"
                                onClick={() => handleDownload(record)}
                            />
                        </Tooltip>
                        <Tooltip title="删除">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                className="material-action-btn delete"
                                onClick={() => handleDeleteRecords([record])}
                            />
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="course-material-manage">
            <div className="material-panel">
                <div className="material-toolbar">
                    <Input
                        value={keyword}
                        onChange={(event) => {
                            const nextKeyword = event.target.value;
                            setKeyword(nextKeyword);
                            if (!nextKeyword.trim()) {
                                fetchList({ current: 1, pageSize: pagination.pageSize }, '');
                            }
                        }}
                        onPressEnter={handleSearch}
                        placeholder="请输入文件名进行搜索..."
                        className="material-search-input"
                        prefix={<SearchOutlined />}
                        suffix={<SearchOutlined className="material-search-icon" onClick={handleSearch} />}
                        allowClear
                    />

                    <FileChunkUpload
                        mode="button"
                        scenario={MATERIAL_UPLOAD_SCENARIO}
                        uploadType={ChunkUploadType.NORMAL}
                        resourceLabel="文件"
                        buttonText="上传文件"
                        buttonClassName="material-upload-btn"
                        disabled={!normalizedCourseId || !normalizedSchoolId}
                        businessConfig={{ schoolId: normalizedSchoolId }}
                        onUploaded={handleMaterialUploaded}
                        showSuccessMessage={false}
                    />
                </div>

                <div className="material-table-wrapper">
                    <Table
                        className="material-table"
                        rowSelection={rowSelection}
                        columns={columns}
                        dataSource={tableData}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                    />
                </div>

                <div className="material-footer">
                    <div className="material-footer-left">
                        <Button
                            className="batch-delete-btn"
                            danger
                            disabled={!selectedRowKeys.length}
                            onClick={() => handleDeleteRecords(selectedRows)}
                        >
                            批量删除
                        </Button>
                        <span className="selected-count">Selected {selectedRowKeys.length} item(s)</span>
                    </div>

                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={total}
                        showSizeChanger={false}
                        onChange={(page, pageSize) => {
                            fetchList({ current: page, pageSize }, keyword.trim());
                        }}
                    />
                </div>
            </div>

            <Modal
                title="修改文件名"
                open={renameModalOpen}
                onOk={handleRenameSubmit}
                onCancel={closeRenameModal}
                okText="保存"
                cancelText="取消"
                confirmLoading={renameSubmitting}
                destroyOnHidden
            >
                <Form form={renameForm} layout="vertical">
                    <Form.Item label="原文件名">
                        <Input value={getMaterialFileName(editingRecord)} disabled />
                    </Form.Item>
                    <Form.Item
                        name="file_name_base"
                        label="新文件名"
                        rules={[
                            { required: true, message: '请输入新文件名' },
                            {
                                validator: (_, value) => {
                                    if (String(value || '').trim()) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('请输入新文件名'));
                                },
                            },
                            {
                                validator: (_, value) => {
                                    const nextBase = String(value || '').trim();
                                    if (!nextBase) {
                                        return Promise.resolve();
                                    }

                                    if (`${nextBase}${editingMaterialSuffix}`.length > 255) {
                                        return Promise.reject(new Error('文件名长度不能超过 255 个字符'));
                                    }

                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <Input
                            placeholder="请输入新文件名"
                            maxLength={renameBaseMaxLength}
                            addonAfter={editingMaterialSuffix || undefined}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MaterialManage;
