import { observer } from 'mobx-react-lite';
import { Form, Input, Button, Table, Space, Tag, message, Tooltip, Modal, Select } from 'antd';
const { Option } = Select;
import { useState, useEffect } from 'react';
import { getStudentList, updateStudent } from '@/http/api.ts';
import { RoleMap, SchoolStatusMap } from '@/type/map.js';
import Store from '@/store/index.ts';
import moment from 'moment';
import './index.less';

const StudentList = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [editForm] = Form.useForm();

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformAdmin = currentUserRoles.includes('root') || currentUserRoles.includes('admin');
    const mySchoolId = Store.UserStore.userBaseInfo?.schoolId;

    const fetchList = (pageParams = pagination, searchParams = form.getFieldsValue()) => {
        setLoading(true);
        const params = {
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            ...searchParams,
        };

        if (!isPlatformAdmin) {
            params.schoolId = mySchoolId;
        }

        Object.keys(params).forEach(key => {
            if (params[key] === undefined || params[key] === '') {
                delete params[key];
            }
        });

        getStudentList(params)
            .then(res => {
                if (res.code === 200 || res.data) {
                    setData(res.data.items || []);
                    setTotal(res.data.total || 0);
                }
            })
            .catch(error => {
                console.error('Failed to fetch student list', error);
                message.error('获取学生列表失败');
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
            updateStudent(editingUser.id || editingUser.userId, payload)
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

    const handleStatusChange = (record, status) => {
        updateStudent(record.id || record.userId, { status })
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
            title: '学号',
            dataIndex: 'student_number',
            key: 'student_number',
            width: 120,
            render: (text) => text || '-',
        },
        {
            title: '所属机构',
            key: 'organization',
            width: 120,
            render: (_, record) => {
                if (!record.school_id || record.school_id === '0' || record.school_id === '') {
                    return <Tag color="geekblue">平台</Tag>;
                }
                return <Tag color="cyan">学校</Tag>;
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
                    <Form.Item name="student_number" label="学号">
                        <Input placeholder="输入学号" allowClear />
                    </Form.Item>
                    <Form.Item name="phone" label="电话号">
                        <Input placeholder="输入电话号" allowClear />
                    </Form.Item>
                    {isPlatformAdmin && (
                        <Form.Item name="schoolId" label="所属学校ID">
                            <Input placeholder="输入学校ID" allowClear />
                        </Form.Item>
                    )}
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
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
                    <div style={{ color: '#888', marginTop: '10px' }}>
                        *注：ID、账号、手机号、学号、归属机构等关键信息不可通过普通编辑接口修改。
                    </div>
                </Form>
            </Modal>
        </div>
    );
});

export default StudentList;
