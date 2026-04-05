import { observer } from 'mobx-react-lite';
import {
    Button,
    Form,
    Input,
    Modal,
    Select,
    Space,
    Table,
    Tag,
    message,
} from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import Store from '@/store/index.ts';
import {
    deleteFileChunkAdmin,
    moveFileChunkToSchool,
    queryFileChunkAdmin,
    updateFileChunkFilename,
} from '@/http/api.ts';
import { ChunkUploadType } from '@/type/file.ts';
import './index.less';

const { Option } = Select;

const STATUS_META = {
    pending: { color: 'orange', text: '待上传' },
    merging: { color: 'blue', text: '合并中' },
    done: { color: 'green', text: '已完成' },
    expired: { color: 'red', text: '已过期' },
};

const TYPE_META = {
    [ChunkUploadType.VIDEO]: '视频',
    [ChunkUploadType.NORMAL]: '文档',
};

const SORT_FIELD_OPTIONS = [
    { label: '创建时间', value: 'createTime' },
    { label: '更新时间', value: 'updateTime' },
    { label: '文件大小', value: 'fileSize' },
];

const SORT_ORDER_OPTIONS = [
    { label: '升序', value: 'ASC' },
    { label: '降序', value: 'DESC' },
];

const normalizePayload = (payload) => {
    const nextPayload = { ...payload };
    Object.keys(nextPayload).forEach((key) => {
        if (nextPayload[key] === undefined || nextPayload[key] === '' || nextPayload[key] === null) {
            delete nextPayload[key];
        }
    });
    return nextPayload;
};

const formatDateValue = (value) => {
    if (!value && value !== 0) {
        return '-';
    }

    if (typeof value === 'number') {
        if (value > 1000000000000) {
            return moment(value).format('YYYY-MM-DD HH:mm:ss');
        }
        return moment.unix(value).format('YYYY-MM-DD HH:mm:ss');
    }

    const numericValue = Number(value);
    if (!Number.isNaN(numericValue) && value !== '') {
        if (numericValue > 1000000000000) {
            return moment(numericValue).format('YYYY-MM-DD HH:mm:ss');
        }
        return moment.unix(numericValue).format('YYYY-MM-DD HH:mm:ss');
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
        return `${(bytes / 1024).toFixed(2)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const copyCellLinkStyle = {
    display: 'block',
    maxWidth: 50,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
};

const fallbackCopyText = (text) => {
    if (typeof document === 'undefined') {
        return false;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', 'true');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    let copied = false;
    try {
        copied = document.execCommand('copy');
    } catch (error) {
        copied = false;
    }

    document.body.removeChild(textarea);
    return copied;
};

const copyValue = async (value, successText) => {
    if (!value && value !== 0) {
        return;
    }

    const text = String(value);

    try {
        if (typeof navigator !== 'undefined' && navigator?.clipboard?.writeText && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            message.success(successText);
            return;
        }

        if (fallbackCopyText(text)) {
            message.success(successText);
            return;
        }

        message.warning('当前环境不支持自动复制，请手动复制');
    } catch (error) {
        if (fallbackCopyText(text)) {
            message.success(successText);
            return;
        }

        console.error('Copy failed', error);
        message.error('复制失败，请手动复制');
    }
};

const getMoveTargetHint = (type) => {
    if (type === ChunkUploadType.VIDEO) {
        return '迁移到 resource_library/videos';
    }
    if (type === ChunkUploadType.NORMAL) {
        return '迁移到 resource_library/documents（hash 二级目录）';
    }
    return 'type 为空，仅允许展示，不允许迁移';
};

const canMoveRecord = (record) => {
    const isTypeAllowed = record?.type === ChunkUploadType.VIDEO || record?.type === ChunkUploadType.NORMAL;
    return record?.status === 'done' && isTypeAllowed;
};

const FileManage = observer(() => {
    const [form] = Form.useForm();
    const [renameForm] = Form.useForm();
    const [moveForm] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const [moveModalOpen, setMoveModalOpen] = useState(false);
    const [movingRecords, setMovingRecords] = useState([]);
    const [hasQueried, setHasQueried] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformAdmin = currentUserRoles.includes('root') || currentUserRoles.includes('admin');
    const mySchoolId = Store.UserStore.userBaseInfo?.schoolId;

    const showPlatformEmptyTip = isPlatformAdmin && !hasQueried && !loading;

    const buildQueryPayload = useCallback((pageParams, searchParams) => {
        const payload = {
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            id: searchParams.id,
            fileHash: searchParams.fileHash,
            filename: searchParams.filename,
            status: searchParams.status,
            type: searchParams.type,
            creatorId: searchParams.creatorId,
            schoolId: searchParams.schoolId,
            sortBy: searchParams.sortBy,
            sortOrder: searchParams.sortOrder,
        };

        if (!isPlatformAdmin) {
            payload.schoolId = mySchoolId;
        }

        return normalizePayload(payload);
    }, [isPlatformAdmin, mySchoolId]);

    const fetchList = useCallback(async (pageParams, searchParams) => {
        const payload = buildQueryPayload(pageParams, searchParams);

        if (isPlatformAdmin && !payload.schoolId) {
            setData([]);
            setTotal(0);
            return;
        }

        setLoading(true);
        setHasQueried(true);
        try {
            const res = await queryFileChunkAdmin(payload);
            if (res?.code === 200 || res?.data) {
                setData(res?.data?.items || []);
                setTotal(res?.data?.total || 0);
                setSelectedRowKeys([]);
                setSelectedRows([]);
            }
        } catch (error) {
            console.error('Failed to fetch file chunk list', error);
            message.error('获取文件列表失败');
        } finally {
            setLoading(false);
        }
    }, [buildQueryPayload, isPlatformAdmin]);

    useEffect(() => {
        if (!isPlatformAdmin) {
            fetchList({ current: 1, pageSize: 10 }, form.getFieldsValue());
        }
    }, [fetchList, form, isPlatformAdmin]);

    const onSearch = (values) => {
        if (isPlatformAdmin && !values.schoolId) {
            message.warning('平台管理员请先输入学校ID再检索');
            return;
        }

        const nextPagination = {
            ...pagination,
            current: 1,
        };

        setPagination(nextPagination);
        fetchList(nextPagination, values);
    };

    const onReset = () => {
        form.resetFields();
        const resetValues = form.getFieldsValue();

        if (!isPlatformAdmin) {
            const nextPagination = { ...pagination, current: 1 };
            setPagination(nextPagination);
            fetchList(nextPagination, resetValues);
            return;
        }

        setData([]);
        setTotal(0);
        setHasQueried(false);
        setSelectedRowKeys([]);
        setSelectedRows([]);
    };

    const handleTableChange = (newPagination) => {
        const nextPagination = {
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        };

        setPagination(nextPagination);
        fetchList(nextPagination, form.getFieldsValue());
    };

    const handleOpenRenameModal = (record) => {
        setEditingRecord(record);
        renameForm.setFieldsValue({ fileName: record.fileName });
        setRenameModalOpen(true);
    };

    const handleRenameSubmit = async () => {
        try {
            const values = await renameForm.validateFields();
            if (!editingRecord?.id) {
                message.error('未找到可编辑的文件记录');
                return;
            }

            await updateFileChunkFilename({
                id: editingRecord.id,
                fileName: values.fileName,
            });

            message.success('文件名更新成功');
            setRenameModalOpen(false);
            setEditingRecord(null);
            renameForm.resetFields();
            fetchList(pagination, form.getFieldsValue());
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error('Failed to rename file chunk', error);
            message.error('更新文件名失败');
        }
    };

    const handleDeleteRecords = (records) => {
        if (!records?.length) {
            message.warning('请先选择要删除的文件');
            return;
        }

        Modal.confirm({
            title: records.length > 1 ? `确认删除 ${records.length} 条记录` : '确认删除',
            content: '删除将固定以 force=true 执行（忽略物理文件异常，仅清理记录）。是否继续？',
            okText: '确认',
            cancelText: '取消',
            onOk: async () => {
                try {
                    const results = await Promise.allSettled(
                        records.map((record) => deleteFileChunkAdmin(record.id, true))
                    );

                    const successCount = results.filter(
                        (item) => item.status === 'fulfilled' && (item.value?.code === 200 || item.value?.data?.removed)
                    ).length;
                    const failCount = records.length - successCount;

                    if (successCount > 0) {
                        message.success(`删除成功 ${successCount} 条`);
                    }
                    if (failCount > 0) {
                        message.warning(`删除失败 ${failCount} 条`);
                    }

                    fetchList(pagination, form.getFieldsValue());
                } catch (error) {
                    console.error('Failed to delete file chunks', error);
                    message.error('删除失败');
                }
            },
        });
    };

    const handleOpenMoveModal = (records) => {
        if (!records?.length) {
            message.warning('请先选择要迁移的文件');
            return;
        }

        const invalidRecords = records.filter((record) => !canMoveRecord(record));
        if (invalidRecords.length > 0) {
            message.warning('仅可迁移 status=done 且 type 为视频或文档的记录，请调整勾选后重试');
            return;
        }

        setMovingRecords(records);
        moveForm.setFieldsValue({
            schoolId: isPlatformAdmin ? undefined : mySchoolId,
        });
        setMoveModalOpen(true);
    };

    const handleMoveSubmit = async () => {
        try {
            const values = await moveForm.validateFields();
            if (!movingRecords.length) {
                message.error('未找到可迁移的文件记录');
                return;
            }

            const targetSchoolId = isPlatformAdmin ? values.schoolId : mySchoolId;
            if (!targetSchoolId) {
                message.warning('缺少目标学校ID');
                return;
            }

            const results = await Promise.allSettled(
                movingRecords.map((record) =>
                    moveFileChunkToSchool({
                        fileId: record.id,
                        schoolId: targetSchoolId,
                    })
                )
            );

            const successCount = results.filter(
                (item) => item.status === 'fulfilled' && (item.value?.code === 200 || item.value?.data?.id)
            ).length;
            const failCount = movingRecords.length - successCount;

            if (successCount > 0) {
                message.success(`迁移成功 ${successCount} 条`);
            }
            if (failCount > 0) {
                message.warning(`迁移失败 ${failCount} 条`);
            }

            setMoveModalOpen(false);
            setMovingRecords([]);
            moveForm.resetFields();
            fetchList(pagination, form.getFieldsValue());
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error('Failed to move file chunk', error);
            message.error('迁移失败，请检查状态、类型和目标学校后重试');
        }
    };

    const moveRuleHint = useMemo(() => {
        if (!movingRecords.length) {
            return '-';
        }

        const typeSet = new Set(movingRecords.map((record) => record.type));
        if (typeSet.size === 1) {
            return getMoveTargetHint(movingRecords[0]?.type);
        }

        return '将按类型分流迁移：视频 -> resource_library/videos，文档 -> resource_library/documents（hash 二级目录）';
    }, [movingRecords]);

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys, rows) => {
            setSelectedRowKeys(keys);
            setSelectedRows(rows);
        },
    };

    const schoolFieldNode = useMemo(() => {
        if (!isPlatformAdmin) {
            return null;
        }

        return (
            // 预留扩展点：后续可将 Input 无缝替换为学校下拉选择器。
            <Form.Item name="schoolId" label="学校ID">
                <Input placeholder="平台管理员必填" allowClear />
            </Form.Item>
        );
    }, [isPlatformAdmin]);

    const columns = [
        {
            title: '文件ID',
            dataIndex: 'id',
            key: 'id',
            width: 90,
            ellipsis: true,
            render: (value) => (
                <a
                    style={copyCellLinkStyle}
                    onClick={() => copyValue(value, '文件ID已复制')}
                >
                    {value || '-'}
                </a>
            ),
        },
        {
            title: '文件名',
            dataIndex: 'fileName',
            key: 'fileName',
            width: 180,
            ellipsis: true,
            render: (value) => value || '-',
        },
        {
            title: '文件哈希',
            dataIndex: 'fileHash',
            key: 'fileHash',
            width: 90,
            ellipsis: true,
            render: (value) => (
                <a
                    style={copyCellLinkStyle}
                    onClick={() => copyValue(value, '文件哈希已复制')}
                >
                    {value || '-'}
                </a>
            ),
        },
        {
            title: '文件大小',
            dataIndex: 'fileSize',
            key: 'fileSize',
            width: 140,
            render: (value) => formatFileSize(value),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (value) => {
                const meta = STATUS_META[value] || { color: 'default', text: value || '未知' };
                return <Tag color={meta.color}>{meta.text}</Tag>;
            },
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 120,
            render: (value) => TYPE_META[value] || '未知/空',
        },
        {
            title: '创建者ID',
            dataIndex: 'creatorId',
            key: 'creatorId',
            width: 90,
            ellipsis: true,
            render: (value) => (
                <a
                    style={copyCellLinkStyle}
                    onClick={() => copyValue(value, '创建者ID已复制')}
                >
                    {value || '-'}
                </a>
            ),
        },
        {
            title: '创建者',
            dataIndex: 'creatorName',
            key: 'creatorName',
            width: 120,
            ellipsis: true,
            render: (value) => value || '-',
        },
        {
            title: '学校ID',
            dataIndex: 'schoolId',
            key: 'schoolId',
            width: 180,
            ellipsis: true,
            render: (value) => value || '-',
        },
        {
            title: '学校名',
            dataIndex: 'schoolName',
            key: 'schoolName',
            width: 160,
            ellipsis: true,
            render: (value) => value || '-',
        },
        {
            title: '目标路径',
            dataIndex: 'targetPath',
            key: 'targetPath',
            width: 220,
            ellipsis: true,
            render: (value) => value || '-',
        },
        {
            title: '创建时间',
            dataIndex: 'createTime',
            key: 'createTime',
            width: 180,
            render: (value) => formatDateValue(value),
        },
        {
            title: '更新时间',
            dataIndex: 'updateTime',
            key: 'updateTime',
            width: 180,
            render: (value) => formatDateValue(value),
        },
        {
            title: '操作',
            key: 'action',
            width: 160,
            fixed: 'right',
            render: (_, record) => {
                const moveDisabled = !canMoveRecord(record);

                return (
                    <Space size={4} wrap>
                        <a onClick={() => handleOpenRenameModal(record)}>改名</a>
                        <a style={{ color: 'red' }} onClick={() => handleDeleteRecords([record])}>删除</a>
                        <a
                            className={moveDisabled ? 'disabled-action' : ''}
                            onClick={() => handleOpenMoveModal([record])}
                        >
                            迁移
                        </a>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="list-container file-manage-container">
            <div className="search-wrapper">
                <Form
                    form={form}
                    layout="inline"
                    onFinish={onSearch}
                    className="search-form"
                    initialValues={{
                        sortBy: 'updateTime',
                        sortOrder: 'DESC',
                    }}
                >
                    <Form.Item name="id" label="文件ID">
                        <Input placeholder="输入文件记录ID" allowClear />
                    </Form.Item>
                    <Form.Item name="fileHash" label="文件Hash">
                        <Input placeholder="输入文件hash" allowClear />
                    </Form.Item>
                    <Form.Item name="filename" label="文件名">
                        <Input placeholder="输入文件名关键词" allowClear />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select placeholder="全部" allowClear style={{ width: 140 }}>
                            <Option value="pending">{STATUS_META.pending.text}</Option>
                            <Option value="merging">{STATUS_META.merging.text}</Option>
                            <Option value="done">{STATUS_META.done.text}</Option>
                            <Option value="expired">{STATUS_META.expired.text}</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="type" label="类型">
                        <Select placeholder="全部" allowClear style={{ width: 140 }}>
                            <Option value={ChunkUploadType.VIDEO}>1-视频</Option>
                            <Option value={ChunkUploadType.NORMAL}>2-文档</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="creatorId" label="创建者ID">
                        <Input placeholder="输入创建者userId" allowClear />
                    </Form.Item>
                    {schoolFieldNode}
                    <Form.Item name="sortBy" label="排序字段">
                        <Select style={{ width: 140 }} options={SORT_FIELD_OPTIONS} />
                    </Form.Item>
                    <Form.Item name="sortOrder" label="排序方向">
                        <Select style={{ width: 120 }} options={SORT_ORDER_OPTIONS} />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                            <Button danger onClick={() => handleDeleteRecords(selectedRows)} disabled={!selectedRows.length}>批量删除</Button>
                            <Button onClick={() => handleOpenMoveModal(selectedRows)} disabled={!selectedRows.length}>批量迁移</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className="table-wrapper">
                {showPlatformEmptyTip ? (
                    <div className="empty-tip">请先输入学校ID再检索，后续可扩展为学校下拉选择器</div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        rowSelection={rowSelection}
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total,
                            showSizeChanger: true,
                            showTotal: (value) => `共 ${value} 条记录`,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </div>

            <Modal
                title="编辑文件名"
                open={renameModalOpen}
                onOk={handleRenameSubmit}
                onCancel={() => {
                    setRenameModalOpen(false);
                    setEditingRecord(null);
                    renameForm.resetFields();
                }}
                okText="保存"
                cancelText="取消"
                destroyOnHidden
            >
                <Form form={renameForm} layout="vertical">
                    <Form.Item label="文件ID">
                        <Input value={editingRecord?.id} disabled />
                    </Form.Item>
                    <Form.Item
                        name="fileName"
                        label="新文件名"
                        rules={[
                            { required: true, message: '请输入新文件名' },
                            { max: 255, message: '文件名长度不能超过 255' },
                        ]}
                    >
                        <Input placeholder="请输入新文件名" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="迁移到学校资源库"
                open={moveModalOpen}
                onOk={handleMoveSubmit}
                onCancel={() => {
                    setMoveModalOpen(false);
                    setMovingRecords([]);
                    moveForm.resetFields();
                }}
                okText="确认迁移"
                cancelText="取消"
                destroyOnHidden
            >
                <Form form={moveForm} layout="vertical">
                    <Form.Item label="文件ID">
                        <Input value={movingRecords.length > 1 ? `已选择 ${movingRecords.length} 条记录` : movingRecords?.[0]?.id} disabled />
                    </Form.Item>
                    {movingRecords.length === 1 ? (
                        <Form.Item label="文件名">
                            <Input value={movingRecords?.[0]?.fileName} disabled />
                        </Form.Item>
                    ) : null}
                    <Form.Item label="迁移规则">
                        <Input value={moveRuleHint} disabled />
                    </Form.Item>
                    <Form.Item
                        name="schoolId"
                        label="目标学校ID"
                        rules={[{ required: true, message: '请输入目标学校ID' }]}
                    >
                        <Input
                            placeholder={isPlatformAdmin ? '请输入目标学校ID' : '自动带入所属学校ID'}
                            disabled={!isPlatformAdmin}
                        />
                    </Form.Item>
                </Form>
            </Modal>

        </div>
    );
});

export default FileManage;