import { observer } from 'mobx-react-lite';
import { Button, Form, Input, Modal, Popconfirm, Space, Table, message } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import {
    createCollege,
    deleteCollege,
    getCollegeById,
    getCollegeList,
    updateCollege,
} from '@/http/api.ts';
import Store from '@/store/index.ts';
import moment from 'moment';
import './index.less';

const CollegeManage = observer(() => {
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformAdmin = currentUserRoles.includes('root') || currentUserRoles.includes('admin');
    const mySchoolId = Store.UserStore.userBaseInfo?.schoolId;

    const getCollegeId = (record) => record?.id || record?.college_id || record?.collegeId;

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
        } catch {
            copied = false;
        }

        document.body.removeChild(textarea);
        return copied;
    };

    const copyCollegeId = async (value) => {
        if (value === undefined || value === null || value === '') {
            message.warning('暂无可复制ID');
            return;
        }

        const text = String(value);

        try {
            const canUseClipboardApi =
                typeof navigator !== 'undefined' &&
                navigator?.clipboard?.writeText &&
                typeof window !== 'undefined' &&
                window.isSecureContext;

            if (canUseClipboardApi) {
                await navigator.clipboard.writeText(text);
                message.success('ID已复制');
                return;
            }

            if (fallbackCopyText(text)) {
                message.success('ID已复制');
                return;
            }

            message.warning('当前环境不支持自动复制，请手动复制');
        } catch (error) {
            if (fallbackCopyText(text)) {
                message.success('ID已复制');
                return;
            }

            console.error('Copy college id failed', error);
            message.error('复制失败，请手动复制');
        }
    };

    const formatTime = (value) => {
        if (value === undefined || value === null || value === '') {
            return '-';
        }
        const numberValue = Number(value);
        if (!Number.isNaN(numberValue)) {
            if (numberValue <= 0) {
                return '-';
            }
            const timestamp = numberValue > 1e12 ? numberValue : numberValue * 1000;
            return moment(timestamp).format('YYYY-MM-DD HH:mm:ss');
        }
        const date = moment(value);
        return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : '-';
    };

    const normalizeParams = (params) => {
        const copied = { ...params };
        Object.keys(copied).forEach((key) => {
            if (copied[key] === undefined || copied[key] === '') {
                delete copied[key];
            }
        });
        return copied;
    };

    const fetchList = useCallback((pageParams, searchParams) => {
        const params = {
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            ...searchParams,
        };

        if (!isPlatformAdmin) {
            params.schoolId = mySchoolId;
        }

        setLoading(true);
        getCollegeList(normalizeParams(params))
            .then((res) => {
                const list = res?.data?.items || res?.data?.list || [];
                setData(list);
                setTotal(res?.data?.total || 0);
            })
            .catch((error) => {
                console.error('Failed to fetch college list', error);
                message.error('获取学院列表失败');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isPlatformAdmin, mySchoolId]);

    useEffect(() => {
        fetchList({ current: 1, pageSize: 10 }, form.getFieldsValue());
    }, [fetchList, form]);

    const onSearch = (values) => {
        const nextPagination = { ...pagination, current: 1 };
        setPagination(nextPagination);
        fetchList(nextPagination, values);
    };

    const onReset = () => {
        form.resetFields();
        const resetValues = form.getFieldsValue();
        onSearch(resetValues);
    };

    const handleTableChange = (nextPagination) => {
        setPagination(nextPagination);
        fetchList(nextPagination);
    };

    const openCreateModal = () => {
        createForm.resetFields();
        if (!isPlatformAdmin && mySchoolId) {
            createForm.setFieldValue('school_id', mySchoolId);
        }
        setIsCreateModalVisible(true);
    };

    const handleCreate = async () => {
        try {
            const values = await createForm.validateFields();
            const payload = {
                name: values.name.trim(),
                school_id: isPlatformAdmin ? values.school_id : mySchoolId,
            };
            setSubmitLoading(true);
            await createCollege(payload);
            message.success('创建学院成功');
            setIsCreateModalVisible(false);
            createForm.resetFields();

            const nextPagination = { ...pagination, current: 1 };
            setPagination(nextPagination);
            fetchList(nextPagination, form.getFieldsValue());
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error('Create college failed', error);
            message.error('创建学院失败');
        } finally {
            setSubmitLoading(false);
        }
    };

    const openEditModal = async (record) => {
        const id = getCollegeId(record);
        if (!id) {
            message.error('未找到学院ID');
            return;
        }

        setEditingRecord(record);
        setSubmitLoading(true);
        try {
            const res = await getCollegeById(id);
            const detail = res?.data || {};
            editForm.setFieldsValue({
                name: detail.name || record.name || '',
            });
            setIsEditModalVisible(true);
        } catch (error) {
            console.error('Fetch college detail failed', error);
            editForm.setFieldsValue({
                name: record.name || '',
            });
            setIsEditModalVisible(true);
            message.warning('获取学院详情失败，已使用列表数据');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleEdit = async () => {
        const id = getCollegeId(editingRecord);
        if (!id) {
            message.error('未找到学院ID');
            return;
        }

        try {
            const values = await editForm.validateFields();
            setSubmitLoading(true);
            await updateCollege(id, { name: values.name.trim() });
            message.success('更新学院成功');
            setIsEditModalVisible(false);
            setEditingRecord(null);
            fetchList(pagination, form.getFieldsValue());
        } catch (error) {
            if (error?.errorFields) {
                return;
            }
            console.error('Update college failed', error);
            message.error('更新学院失败');
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleDelete = async (record) => {
        const id = getCollegeId(record);
        if (!id) {
            message.error('未找到学院ID');
            return;
        }

        try {
            await deleteCollege(id);
            message.success('删除学院成功');
            fetchList(pagination, form.getFieldsValue());
        } catch (error) {
            console.error('Delete college failed', error);
            const backendMsg = error?.response?.data?.msg;
            message.error(backendMsg || '删除学院失败');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 140,
            ellipsis: true,
            render: (_, record) => {
                const id = getCollegeId(record);
                return (
                    <a
                        style={{ display: 'block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onClick={() => {
                            copyCollegeId(id);
                        }}
                    >
                        {id || '-'}
                    </a>
                );
            },
        },
        {
            title: '学院名称',
            dataIndex: 'name',
            key: 'name',
            ellipsis: true,
        },
        {
            title: '学校ID',
            key: 'school_id',
            width: 120,
            render: (_, record) => record.schoolId || record.school_id || '-',
        },
        {
            title: '学校名称',
            key: 'school_name',
            width: 160,
            ellipsis: true,
            render: (_, record) => record.school_name || record.schoolName || '-',
        },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 170,
            render: (value) => formatTime(value),
        },
        {
            title: '更新时间',
            dataIndex: 'update_time',
            key: 'update_time',
            width: 170,
            render: (value) => formatTime(value),
        },
        {
            title: '操作',
            key: 'action',
            width: 160,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <a onClick={() => openEditModal(record)}>编辑</a>
                    <Popconfirm
                        title="确认删除学院"
                        description="删除前请确认该学院下没有学生引用"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => handleDelete(record)}
                    >
                        <a style={{ color: 'red' }}>删除</a>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="list-container">
            <div className="search-wrapper">
                <Form form={form} layout="inline" onFinish={onSearch} className="search-form">
                    <Form.Item name="id" label="ID">
                        <Input placeholder="输入学院ID" allowClear />
                    </Form.Item>
                    <Form.Item name="name" label="学院名称">
                        <Input placeholder="输入学院名称" allowClear />
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item name="schoolId" label="学校ID">
                            <Input placeholder="输入学校ID" allowClear />
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                            <Button onClick={openCreateModal}>新增学院</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className="table-wrapper">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={(record) => getCollegeId(record) || `${record.name}-${record.school_id}`}
                    loading={loading}
                    pagination={{
                        current: pagination.current,
                        pageSize: pagination.pageSize,
                        total,
                        showSizeChanger: true,
                        showTotal: (all) => `共 ${all} 条记录`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </div>

            <Modal
                title="新增学院"
                open={isCreateModalVisible}
                onOk={handleCreate}
                confirmLoading={submitLoading}
                onCancel={() => setIsCreateModalVisible(false)}
                okText="创建"
                cancelText="取消"
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="学院名称"
                        rules={[
                            { required: true, message: '请输入学院名称' },
                            { max: 50, message: '学院名称最多 50 个字符' },
                        ]}
                    >
                        <Input placeholder="请输入学院名称" maxLength={50} />
                    </Form.Item>
                    {isPlatformAdmin ? (
                        <Form.Item
                            name="school_id"
                            label="所属学校ID"
                            rules={[{ required: true, message: '请输入所属学校ID' }]}
                        >
                            <Input placeholder="请输入所属学校ID" />
                        </Form.Item>
                    ) : (
                        <Form.Item label="所属学校ID">
                            <Input value={mySchoolId || ''} disabled />
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            <Modal
                title="编辑学院"
                open={isEditModalVisible}
                onOk={handleEdit}
                confirmLoading={submitLoading}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setEditingRecord(null);
                }}
                okText="保存"
                cancelText="取消"
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="学院名称"
                        rules={[
                            { required: true, message: '请输入学院名称' },
                            { max: 50, message: '学院名称最多 50 个字符' },
                        ]}
                    >
                        <Input placeholder="请输入学院名称" maxLength={50} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default CollegeManage;
