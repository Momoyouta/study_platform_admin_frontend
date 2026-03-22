import { observer } from 'mobx-react-lite';
import { Form, Input, Button, Table, Space, Tag, message, Tooltip, Modal, Select } from 'antd';
const { Option } = Select;
import { useState, useEffect } from 'react';
import { getSchoolAdminList, updateSchoolAdmin, createSchoolAdmin } from '@/http/api.ts';
import { RoleMap, SchoolStatusMap, RoleMapId } from '@/type/map.js';
import Store from '@/store/index.ts';
import moment from 'moment';
import './index.less';

const SchoolAdminList = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm] = Form.useForm();

    // 新增弹窗
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformAdmin = currentUserRoles.includes('root') || currentUserRoles.includes('admin');
    const isSchoolRoot = currentUserRoles.includes('school_root');
    const mySchoolId = Store.UserStore.userBaseInfo?.schoolId;

    const showCreateBtn = isPlatformAdmin || isSchoolRoot;

    const fetchList = (pageParams = pagination, searchParams = form.getFieldsValue()) => {
        const params = {
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            ...searchParams,
        };

        if (!isPlatformAdmin) {
            params.schoolId = mySchoolId;
        } else if (!params.schoolId) {
            // 平台管理员必须输入学校ID才能查询
            return;
        }

        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === '') {
                delete params[key];
            }
        });

        setLoading(true);
        getSchoolAdminList(params)
            .then(res => {
                if (res.code === 200 || res.data) {
                    setData(res.data.items || []);
                    setTotal(res.data.total || 0);
                }
            })
            .catch(error => {
                console.error('Failed to fetch school admin list', error);
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
        if (isPlatformAdmin && !values.schoolId) {
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

    const canEditUser = (record) => {
        const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
        const isRoot = currentUserRoles.includes('root');
        const isAdmin = currentUserRoles.includes('admin');
        const targetRoles = record.role_id || record.userRoles || [];
        const targetRolesArr = Array.isArray(targetRoles) ? targetRoles : [targetRoles];
        const targetIsRoot = targetRolesArr.includes('root') || targetRolesArr.includes('0');
        const targetIsAdmin = targetRolesArr.includes('admin') || targetRolesArr.includes('1');

        if (isRoot) return true;
        if (isAdmin) {
            if (targetIsRoot || targetIsAdmin) return false;
            return true;
        }
        return false;
    };

    const handleEdit = (record) => {
        if (!canEditUser(record)) {
            message.warning('您暂无权限修改该职级的用户信息！');
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
            updateSchoolAdmin(editingUser.id || editingUser.userId, payload)
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
                schoolId: isPlatformAdmin ? values.schoolId : mySchoolId,
            };
            createSchoolAdmin(payload)
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
        updateSchoolAdmin(record.id || record.userId, { status })
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
            width: 80,
            render: (status) => {
                const config = SchoolStatusMap[status] || { color: 'default', text: '未知' };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '角色',
            dataIndex: 'role_id',
            key: 'role_id',
            width: 120,
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
            title: '所属机构',
            key: 'organization',
            width: 120,
            render: (_, record) => {
                if (!record.schoolId || String(record.schoolId) === '0' || record.schoolId === '') {
                    return <Tag color="geekblue">平台</Tag>;
                }
                return <Tag color="cyan">学校 {record.schoolId}</Tag>;
            },
        },
        {
            title: '性别',
            dataIndex: 'sex',
            key: 'sex',
            width: 60,
            render: (sex) => (sex ? '男' : '女'),
        },
        { title: '账号', dataIndex: 'account', key: 'account', width: 120 },
        { title: '电话号', dataIndex: 'phone', key: 'phone', width: 120 },
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
                <Form form={form} layout="inline" onFinish={onSearch} className="search-form">
                    <Form.Item name="id" label="ID">
                        <Input placeholder="输入ID" allowClear />
                    </Form.Item>
                    <Form.Item name="name" label="姓名">
                        <Input placeholder="输入姓名" allowClear />
                    </Form.Item>
                    <Form.Item name="phone" label="电话号">
                        <Input placeholder="输入电话号" allowClear />
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item name="schoolId" label="所属学校ID">
                            <Input placeholder="平台管理员必填" allowClear />
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                            {showCreateBtn && (
                                <Button type="default" onClick={() => setIsCreateModalVisible(true)}>新增管理员</Button>
                            )}
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
                )}
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
                    <div style={{ color: '#888', marginTop: '10px' }}>
                        *注：ID、账号、手机号、角色、归属机构等关键信息不可通过普通编辑接口修改。
                    </div>
                </Form>
            </Modal>

            <Modal
                title="新增学校管理员"
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
                        <Input placeholder="输入真实姓名" />
                    </Form.Item>
                    <Form.Item name="sex" label="性别" initialValue={1}>
                        <Select>
                            <Option value={1}>男</Option>
                            <Option value={0}>女</Option>
                        </Select>
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item name="schoolId" label="所属学校ID" rules={[{ required: true, message: '请输入学校ID' }]}>
                            <Input placeholder="输入该管理员所属学校的ID" />
                        </Form.Item>
                    )}
                    <Form.Item name="role_id" label="职级角色" rules={[{ required: true, message: '请选择角色' }]}>
                        <Select placeholder="请选择角色">
                            <Option value={RoleMapId.school_root}>学校超级管理员</Option>
                            <Option value={RoleMapId.school_admin}>学校管理员</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="phone" label="联系电话">
                        <Input placeholder="选填" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default SchoolAdminList;
