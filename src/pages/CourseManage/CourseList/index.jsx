import { observer } from 'mobx-react-lite';
import { Form, Input, Select, Button, Table, Space, Tag, message, Modal } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourseAdmin, listCourseAdmin, updateCourseAdmin } from '@/http/api.ts';
import Store from '@/store/index.ts';
import moment from 'moment';
import './index.less';

const { Option } = Select;

const CourseStatusMap = {
    0: { color: 'orange', text: '未发布' },
    1: { color: 'green', text: '已发布' },
};

const cleanPayload = (payload) => {
    const nextPayload = { ...payload };
    Object.keys(nextPayload).forEach((key) => {
        if (nextPayload[key] === undefined || nextPayload[key] === '') {
            delete nextPayload[key];
        }
    });
    return nextPayload;
};

const formatTeacherNameText = (teachers) => {
    if (!Array.isArray(teachers) || !teachers.length) {
        return '-';
    }

    const names = teachers
        .map((item) => {
            if (typeof item === 'string') {
                return item.trim();
            }
            return String(item?.name || item?.id || '').trim();
        })
        .filter((item) => !!item);

    return names.length ? names.join('、') : '-';
};

const CourseList = observer(() => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [createForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformAdmin = currentUserRoles.includes('root') || currentUserRoles.includes('admin');
    const mySchoolId = Store.UserStore.userBaseInfo?.schoolId;

    const buildQueryParams = useCallback((pageParams, searchParams) => {
        const params = {
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            keyword: searchParams.keyword,
            status: searchParams.status,
            school_id: searchParams.school_id,
        };

        if (!isPlatformAdmin) {
            params.school_id = mySchoolId;
        }

        return cleanPayload(params);
    }, [isPlatformAdmin, mySchoolId]);

    const fetchList = useCallback((pageParams, searchParams) => {
        const params = buildQueryParams(pageParams, searchParams);

        if (isPlatformAdmin && !params.school_id) {
            return;
        }

        setLoading(true);
        listCourseAdmin(params)
            .then((res) => {
                if (res.code === 200 || res.data) {
                    setData(res.data?.list || []);
                    setTotal(res.data?.total || 0);
                }
            })
            .catch((error) => {
                console.error('Failed to fetch course list', error);
                message.error('获取课程列表失败');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [buildQueryParams, isPlatformAdmin]);

    useEffect(() => {
        if (!isPlatformAdmin) {
            fetchList({ current: 1, pageSize: 10 }, form.getFieldsValue());
        }
    }, [fetchList, form, isPlatformAdmin]);

    const onSearch = (values) => {
        if (isPlatformAdmin && !values.school_id) {
            message.warning('平台管理员请先填入学校ID才能进行查询！');
            return;
        }

        const newPagination = { ...pagination, current: 1 };
        setPagination(newPagination);
        fetchList(newPagination, values);
    };

    const onReset = () => {
        form.resetFields();
        if (!isPlatformAdmin) {
            onSearch(form.getFieldsValue());
        } else {
            setData([]);
            setTotal(0);
        }
    };

    const handleTableChange = (newPagination) => {
        const nextPagination = {
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        };
        setPagination(nextPagination);
        fetchList(nextPagination, form.getFieldsValue());
    };

    const handleCreateOk = () => {
        createForm.validateFields().then((values) => {
            if (isPlatformAdmin && !values.school_id) {
                message.warning('平台管理员创建课程时必须填写学校ID');
                return;
            }

            const payload = cleanPayload({
                name: values.name,
                school_id: isPlatformAdmin ? values.school_id : mySchoolId,
                cover_img: values.cover_img,
                description: values.description,
            });

            createCourseAdmin(payload)
                .then(() => {
                    message.success('课程创建成功');
                    setIsCreateModalVisible(false);
                    createForm.resetFields();

                    if (isPlatformAdmin && !form.getFieldValue('school_id') && values.school_id) {
                        form.setFieldValue('school_id', values.school_id);
                    }
                    fetchList(pagination, form.getFieldsValue());
                })
                .catch((error) => {
                    console.error('Failed to create course', error);
                    message.error('创建课程失败');
                });
        });
    };

    const handleEdit = (record) => {
        navigate(`/courseDetail?courseId=${record.id}`);
    };

    const handleStatusChange = (record, status) => {
        const actionText = status === 1 ? '发布' : '下架';

        Modal.confirm({
            title: '确认状态变更',
            content: `确定要${actionText}课程「${record.name}」吗？`,
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
                return updateCourseAdmin({ id: record.id, status })
                    .then(() => {
                        message.success(`${actionText}成功`);
                        fetchList(pagination, form.getFieldsValue());
                    })
                    .catch((error) => {
                        console.error('Failed to update course status', error);
                        message.error('状态更新失败');
                    });
            },
        });
    };

    const columns = [
        {
            title: '课程ID',
            dataIndex: 'id',
            key: 'id',
            width: 140,
            ellipsis: true,
            render: (value) => (
                <a
                    onClick={() => {
                        navigator.clipboard.writeText(value);
                        message.success('课程ID已复制');
                    }}
                >
                    {value}
                </a>
            ),
        },
        {
            title: '课程名称',
            dataIndex: 'name',
            key: 'name',
            width: 180,
            ellipsis: true,
        },
        {
            title: '学校ID',
            dataIndex: 'school_id',
            key: 'school_id',
            width: 140,
            ellipsis: true,
        },
        {
            title: '学校名称',
            dataIndex: 'school_name',
            key: 'school_name',
            width: 180,
            ellipsis: true,
            render: (value) => value || '-',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
                const config = CourseStatusMap[status] || { color: 'default', text: '未知' };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '任课老师',
            dataIndex: 'teacher_names',
            key: 'teacher_names',
            width: 220,
            render: (teachers) => formatTeacherNameText(teachers),
        },
        {
            title: '创建人',
            dataIndex: 'creator_name',
            key: 'creator_name',
            width: 120,
            render: (value) => value || '-',
        },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 170,
            render: (value) => (value ? moment.unix(Number(value)).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
            title: '更新时间',
            dataIndex: 'update_time',
            key: 'update_time',
            width: 170,
            render: (value) => (value ? moment.unix(Number(value)).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
            title: '操作',
            key: 'action',
            width: 140,
            fixed: 'right',
            render: (_, record) => {
                const nextStatus = record.status === 1 ? 0 : 1;
                const actionText = nextStatus === 1 ? '发布' : '下架';

                return (
                    <Space>
                        <a onClick={() => handleEdit(record)}>编辑</a>
                        <a
                            style={{ color: nextStatus === 1 ? 'green' : 'red' }}
                            onClick={() => handleStatusChange(record, nextStatus)}
                        >
                            {actionText}
                        </a>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="list-container">
            <div className="search-wrapper">
                <Form form={form} layout="inline" onFinish={onSearch} className="search-form">
                    <Form.Item name="keyword" label="课程名称">
                        <Input placeholder="输入课程名称关键词" allowClear />
                    </Form.Item>
                    <Form.Item name="status" label="课程状态">
                        <Select placeholder="全部状态" allowClear style={{ width: 140 }}>
                            <Option value={0}>未发布</Option>
                            <Option value={1}>已发布</Option>
                        </Select>
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item name="school_id" label="学校ID">
                            <Input placeholder="平台管理员必填" allowClear />
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                            <Button type="default" onClick={() => setIsCreateModalVisible(true)}>创建课程</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className="table-wrapper">
                {isPlatformAdmin && !data.length && !loading ? (
                    <div className="empty-tip">请在上方输入学校ID进行查询</div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
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
                title="创建课程"
                open={isCreateModalVisible}
                onOk={handleCreateOk}
                onCancel={() => setIsCreateModalVisible(false)}
                okText="创建"
                cancelText="取消"
                destroyOnHidden
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="课程名称"
                        rules={[{ required: true, message: '请输入课程名称' }]}
                    >
                        <Input placeholder="请输入课程名称" maxLength={255} />
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item
                            name="school_id"
                            label="学校ID"
                            rules={[{ required: true, message: '平台管理员创建课程时必须填写学校ID' }]}
                        >
                            <Input placeholder="请输入学校ID" />
                        </Form.Item>
                    )}
                    <Form.Item name="cover_img" label="封面图 URL">
                        <Input placeholder="选填，输入封面图地址" maxLength={500} />
                    </Form.Item>
                    <Form.Item name="description" label="课程描述">
                        <Input.TextArea placeholder="选填，输入课程描述" rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default CourseList;
