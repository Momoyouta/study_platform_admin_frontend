import { observer } from 'mobx-react-lite';
import { Form, Input, Select, Button, Table, Space, Tag, message, Modal } from 'antd';
import { useState, useEffect } from 'react';
import { getUserList, updateUserStatus, register } from '@/http/api.ts';
import { RoleMap, SchoolStatusMap, RoleMapId } from '@/type/map.js';
import Store from '@/store/index.ts';
import moment from 'moment';
import './index.less';

const { Option } = Select;

const PlatformAdminList = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    // 编辑弹窗
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm] = Form.useForm();

    // 新增弹窗
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isRoot = currentUserRoles.includes('root');

    const fetchList = (pageParams = pagination, searchParams = form.getFieldsValue()) => {
        setLoading(true);
        const params = {
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            ...searchParams,
        };
        // 过滤空值
        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === '') {
                delete params[key];
            }
        });

        getUserList(params)
            .then(res => {
                if (res.code === 200 || res.data) {
                    setData(res.data.list || []);
                    setTotal(res.data.total || 0);
                }
            })
            .catch(error => {
                console.error('Failed to fetch platform admin list', error);
                message.error('获取列表失败');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchList();
    }, []);

    const onSearch = (values) => {
        const newPagination = { ...pagination, current: 1 };
        setPagination(newPagination);
        fetchList(newPagination, values);
    };

    const onReset = () => {
        form.resetFields();
        onSearch(form.getFieldsValue());
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchList(newPagination);
    };

    const handleEdit = (record) => {
        if (!isRoot && record.userRoles?.includes('root')) {
            message.warning('您暂无权限修改超级管理员的信息！');
            return;
        }
        setEditingUser(record);
        editForm.setFieldsValue({
            name: record.userName || record.name,
            sex: record.sex ? 1 : 0,
            password: '',
        });
        setIsModalVisible(true);
    };

    const handleEditOk = () => {
        editForm.validateFields().then(values => {
            const payload = {
                name: values.name,
                sex: values.sex === 1,
            };
            if (values.password) {
                payload.password = values.password;
            }
            updateUserStatus(editingUser.id || editingUser.userId, payload)
                .then(() => {
                    message.success('更新成功');
                    setIsModalVisible(false);
                    fetchList();
                })
                .catch(err => {
                    console.error('Update failed', err);
                    message.error('信息更新失败');
                });
        });
    };

    const handleCreateOk = () => {
        createForm.validateFields().then(values => {
            const payload = {
                ...values,
                sex: values.sex === 1,
                inviteCode: '000000', // 默认邀请码
            };
            register(payload)
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

    const handleStatusChange = (record, status) => {
        if (!isRoot && record.userRoles?.includes('root')) {
            message.error('无权操作超级管理员账号！');
            return;
        }
        updateUserStatus(record.id || record.userId, { status })
            .then(() => {
                message.success('状态更新成功');
                fetchList();
            })
            .catch(error => {
                console.error('Status update failed', error);
                message.error('状态更新失败');
            });
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 120,
            ellipsis: true,
            render: (text, record) => {
                const id = text || record.userId;
                return (
                    <a
                        style={{ display: 'block', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onClick={() => {
                            navigator.clipboard.writeText(id);
                            message.success('ID已复制');
                        }}
                    >
                        {id}
                    </a>
                );
            }
        },
        { title: '姓名', dataIndex: 'name', key: 'name', ellipsis: true, render: (text, record) => text || record.userName },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status) => {
                const config = SchoolStatusMap[status] || { color: 'default', text: '未知' };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '角色',
            dataIndex: 'role_id',
            key: 'role_id',
            render: (roleId, record) => {
                let roles = roleId || record.userRoles;
                if (!roles) return '-';
                if (!Array.isArray(roles)) {
                    roles = [roles];
                }
                const roleIdToStr = {
                    '0': 'root', '1': 'admin', '3': 'student',
                    '4': 'teacher', '5': 'school_root', '6': 'school_admin'
                };
                return roles.map(r => {
                    const mappedStr = roleIdToStr[String(r)] || r;
                    return <Tag color="blue" key={r}>{RoleMap[mappedStr] || RoleMap[r] || r}</Tag>
                });
            },
        },
        {
            title: '性别',
            dataIndex: 'sex',
            key: 'sex',
            width: 80,
            render: (sex) => (sex ? '男' : '女'),
        },
        { title: '账号', dataIndex: 'account', key: 'account', width: 140 },
        { title: '电话号', dataIndex: 'phone', key: 'phone', width: 140 },
        {
            title: '创建时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 160,
            render: (val) => val ? moment.unix(val).format('YYYY-MM-DD HH:mm:ss') : '-',
        },
        {
            title: '更新时间',
            dataIndex: 'update_time',
            key: 'update_time',
            width: 160,
            render: (val) => val ? moment.unix(val).format('YYYY-MM-DD HH:mm:ss') : '-',
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_, record) => {
                return (
                    <Space>
                        <a onClick={() => handleEdit(record)}>编辑</a>
                        {record.status === 1 || record.status === undefined ? (
                            <a style={{ color: 'red' }} onClick={() => handleStatusChange(record, 2)}>禁用</a>
                        ) : (
                            <a style={{ color: 'green' }} onClick={() => handleStatusChange(record, 1)}>启用</a>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="list-container">
            <div className="search-wrapper">
                <Form form={form} layout="inline" onFinish={onSearch} className="search-form" initialValues={{ role_id: RoleMapId.admin }}>
                    <Form.Item name="id" label="ID">
                        <Input placeholder="输入ID" allowClear />
                    </Form.Item>
                    <Form.Item name="name" label="姓名">
                        <Input placeholder="输入姓名" allowClear />
                    </Form.Item>
                    <Form.Item name="phone" label="电话号">
                        <Input placeholder="输入电话号" allowClear />
                    </Form.Item>
                    <Form.Item name="role_id" label="角色">
                        <Select placeholder="请选择角色" allowClear style={{ width: 160 }}>
                            <Option value={RoleMapId.root}>超级管理员</Option>
                            <Option value={RoleMapId.admin}>平台管理员</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                            {isRoot && (
                                <Button type="default" onClick={() => setIsCreateModalVisible(true)}>新增平台管理员</Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className="table-wrapper">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey={(record) => record.id || record.userId}
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
            </div>

            <Modal
                title="编辑属性"
                open={isModalVisible}
                onOk={handleEditOk}
                onCancel={() => setIsModalVisible(false)}
                okText="保存"
                cancelText="取消"
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: '姓名不能为空' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="sex" label="性别">
                        <Select>
                            <Option value={1}>男</Option>
                            <Option value={0}>女</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="password" label="新密码" tooltip="如果不修改密码请留空">
                        <Input.Password placeholder="留空则不修改密码" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="新增平台管理员"
                open={isCreateModalVisible}
                onOk={handleCreateOk}
                onCancel={() => setIsCreateModalVisible(false)}
                okText="创建"
                cancelText="取消"
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item name="account" label="账号 (手机号)" rules={[{ required: true, message: '请输入账号' }]}>
                        <Input placeholder="输入登录账号" />
                    </Form.Item>
                    <Form.Item name="password" label="初始密码" rules={[{ required: true, message: '请输入初始密码' }]}>
                        <Input.Password placeholder="输入初始密码" />
                    </Form.Item>
                    <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
                        <Input placeholder="输入姓名" />
                    </Form.Item>
                    <Form.Item name="sex" label="性别" initialValue={1}>
                        <Select>
                            <Option value={1}>男</Option>
                            <Option value={0}>女</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="role_id" label="角色" initialValue={RoleMapId.admin} rules={[{ required: true }]}>
                        <Select>
                            <Option value={RoleMapId.root}>超级管理员</Option>
                            <Option value={RoleMapId.admin}>平台管理员</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default PlatformAdminList;
