import { observer } from 'mobx-react-lite';
import { Form, Input, Button, Table, Space, Tag, message, Modal, Select } from 'antd';
import { useState, useEffect } from 'react';
import { getInviteList, createInvite, deleteInvite } from '@/http/api.ts';
import Store from '@/store/index.ts';
import moment from 'moment';
import './index.less';

const { Option } = Select;

const InviteTypeMap = {
    0: '老师加入学校',
    1: '学生加入学校',
    2: '学生加入课程',
};

const InviteCodeManage = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();
    const [ttlUnit, setTtlUnit] = useState('hours');

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformAdmin = currentUserRoles.includes('root') || currentUserRoles.includes('admin');
    const mySchoolId = Store.UserStore.userBaseInfo?.schoolId;

    const fetchList = (pageParams = pagination, searchParams = form.getFieldsValue()) => {
        const params = {
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            ...searchParams,
        };

        if (!isPlatformAdmin) {
            params.school_id = mySchoolId;
        } else if (!params.school_id) {
            // 平台管理员必须输入学校ID才能查询
            return;
        }

        // 移除空字段
        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === '') {
                delete params[key];
            }
        });

        setLoading(true);
        getInviteList(params)
            .then(res => {
                if (res.code === 200 || res.data) {
                    setData(res.data.list || []);
                    setTotal(res.data.total || 0);
                }
            })
            .catch(error => {
                console.error('Failed to fetch invite list', error);
                message.error('获取列表失败');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        if (!isPlatformAdmin) {
            fetchList();
        }
    }, []);

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
        setPagination(newPagination);
        fetchList(newPagination);
    };

    const handleDelete = (code) => {
        Modal.confirm({
            title: '确认删除',
            content: `确定要删除邀请码 ${code} 吗？`,
            onOk: () => {
                deleteInvite(code)
                    .then(() => {
                        message.success('删除成功');
                        fetchList();
                    })
                    .catch(err => {
                        console.error('Delete failed', err);
                        message.error('删除失败');
                    });
            },
        });
    };

    const handleCreateOk = () => {
        createForm.validateFields().then(values => {
            let ttlInSeconds = parseInt(values.ttl_value);
            if (ttlUnit === 'hours') {
                ttlInSeconds *= 3600;
            } else if (ttlUnit === 'days') {
                ttlInSeconds *= 86400;
            }

            const payload = {
                type: values.type,
                school_id: isPlatformAdmin ? values.school_id : mySchoolId,
                grade: values.grade,
                class_id: values.class_id,
                ttl: ttlInSeconds,
            };

            createInvite(payload)
                .then(() => {
                    message.success('创建成功');
                    setIsCreateModalVisible(false);
                    createForm.resetFields();
                    fetchList();
                })
                .catch(err => {
                    console.error('Create failed', err);
                    message.error('创建失败');
                });
        });
    };

    const columns = [
        {
            title: '邀请码',
            dataIndex: 'code',
            key: 'code',
            width: 120,
            ellipsis: true,
            render: (text) => (
                <a
                    onClick={() => {
                        navigator.clipboard.writeText(text);
                        message.success('邀请码已复制');
                    }}
                >
                    {text}
                </a>
            ),
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            width: 140,
            render: (type) => InviteTypeMap[type] || '未知',
        },
        {
            title: '状态',
            key: 'status',
            width: 100,
            render: (_, record) => {
                const now = Math.floor(Date.now() / 1000);
                const isValid = now - record.create_time < record.ttl;
                return isValid ? <Tag color="green">有效</Tag> : <Tag color="red">无效</Tag>;
            },
        },
        { title: '学校名', dataIndex: 'school_name', key: 'school_name', ellipsis: true },
        { title: '创建人', dataIndex: 'creator_name', key: 'creator_name', ellipsis: true },
        { title: '年级', dataIndex: 'grade', key: 'grade', width: 100 },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 160,
            render: (val) => moment.unix(val).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '有效期',
            dataIndex: 'ttl',
            key: 'ttl',
            width: 100,
            render: (val) => val / 3600 + 'h'
        },
        {
            title: '操作',
            key: 'action',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <a style={{ color: 'red' }} onClick={() => handleDelete(record.code)}>删除</a>
            ),
        },
    ];

    return (
        <div className="list-container">
            <div className="search-wrapper">
                <Form form={form} layout="inline" onFinish={onSearch} className="search-form">
                    <Form.Item name="code" label="邀请码">
                        <Input placeholder="输入邀请码" allowClear />
                    </Form.Item>
                    <Form.Item name="creater_id" label="创建人ID">
                        <Input placeholder="输入创建人ID" allowClear />
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item name="school_id" label="学校ID">
                            <Input placeholder="学校ID" allowClear />
                        </Form.Item>
                    )}
                    <Form.Item name="class_id" label="班级ID">
                        <Input placeholder="输入班级ID" allowClear />
                    </Form.Item>
                    <Form.Item name="grade" label="年级">
                        <Input placeholder="输入年级" allowClear />
                    </Form.Item>
                    <Form.Item name="type" label="类型" style={{ width: 180 }}>
                        <Select placeholder="选择类型" allowClear>
                            {Object.entries(InviteTypeMap).map(([key, value]) => (
                                <Option key={key} value={parseInt(key)}>{value}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                            <Button type="default" onClick={() => setIsCreateModalVisible(true)}>创建邀请码</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className="table-wrapper">
                {isPlatformAdmin && !data.length && !loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                        请在上方输入学校ID进行查询
                    </div>
                ) : (
                    <Table
                        columns={columns}
                        dataSource={data}
                        rowKey="code"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total,
                            showSizeChanger: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                        }}
                        onChange={handleTableChange}
                        scroll={{ x: 'max-content' }}
                    />
                )}
            </div>

            <Modal
                title="创建邀请码"
                open={isCreateModalVisible}
                onOk={handleCreateOk}
                onCancel={() => setIsCreateModalVisible(false)}
                okText="创建"
                cancelText="取消"
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item name="type" label="邀请码类型" rules={[{ required: true, message: '请选择类型' }]}>
                        <Select placeholder="请选择类型">
                            {Object.entries(InviteTypeMap).map(([key, value]) => (
                                <Option key={key} value={parseInt(key)}>{value}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item name="school_id" label="所属学校ID" rules={[{ required: true, message: '请输入学校ID' }]}>
                            <Input placeholder="输入学校ID" />
                        </Form.Item>
                    )}
                    <Form.Item name="grade" label="所属年级 (选填)">
                        <Input placeholder="例如: 2023" />
                    </Form.Item>
                    <Form.Item name="class_id" label="所属班级ID (选填)">
                        <Input placeholder="课程邀请码必填" />
                    </Form.Item>
                    <Form.Item label="有效期 (TTL)" required>
                        <Space.Compact style={{ width: '100%' }}>
                            <Form.Item
                                name="ttl_value"
                                noStyle
                                rules={[{ required: true, message: '请输入数值' }]}
                            >
                                <Input style={{ width: '70%' }} placeholder="输入数值" />
                            </Form.Item>
                            <Select value={ttlUnit} onChange={setTtlUnit} style={{ width: '30%' }}>
                                <Option value="hours">小时</Option>
                                <Option value="days">天</Option>
                            </Select>
                        </Space.Compact>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default InviteCodeManage;
