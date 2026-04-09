import { observer } from 'mobx-react-lite';
import { Form, Input, Button, Table, Space, Tag, message, Select } from 'antd';
const { Option } = Select;
import { useState, useEffect, useCallback } from 'react';
import { getStudentList, updateStudent } from '@/http/api.ts';
import { SchoolStatusMap } from '@/type/map.js';
import Store from '@/store/index.ts';
import moment from 'moment';
import UserEditModal from '@/components/UserEditModal';
import './index.less';

const StudentList = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const currentUserRoles = Store.UserStore.userBaseInfo?.userRoles || [];
    const isPlatformAdmin = currentUserRoles.includes('root') || currentUserRoles.includes('admin');
    const mySchoolId = Store.UserStore.userBaseInfo?.schoolId;

    const fetchList = useCallback((pageParams, searchParams) => {
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
    }, [isPlatformAdmin, mySchoolId]);

    useEffect(() => {
        fetchList({ current: 1, pageSize: 10 }, form.getFieldsValue());
    }, [fetchList, form]);

    const onSearch = (values) => {
        const newPagination = { ...pagination, current: 1 };
        setPagination(newPagination);
        fetchList(newPagination, values);
    };

    const onReset = () => {
        form.resetFields();
        const resetValues = form.getFieldsValue();
        onSearch(resetValues);
    };

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
        fetchList(newPagination, form.getFieldsValue());
    };

    const getStudentCollegeName = (record) => {
        return record?.collegeName || record?.college_name || record?.colleageName || record?.colleage_name || '-';
    };

    const getStudentCollegeId = (record) => {
        return record?.college_id || record?.collegeId || record?.colleage_id || record?.colleageId || '';
    };

    const getStudentApiId = (record) => {
        return record?.student_id || record?.studentId || record?.id || record?.userId;
    };

    const handleEdit = (record) => {
        setEditingUser({
            ...record,
            college_id: getStudentCollegeId(record),
            grade: record?.grade || '',
        });
        setIsModalVisible(true);
    };

    const handleEditSubmit = async (payload) => {
        try {
            const endpointId = getStudentApiId(editingUser);
            if (!endpointId) {
                message.error('未找到学生ID');
                return;
            }

            const schoolId = editingUser?.school_id ?? editingUser?.schoolId ?? mySchoolId;
            const studentId =
                editingUser?.student_id ??
                editingUser?.studentId ??
                editingUser?.id ??
                editingUser?.userId;

            const editPayload = {
                ...payload,
                school_id: schoolId,
            };

            await updateStudent(endpointId, editPayload);
            message.success('更新成功');
            setIsModalVisible(false);
            fetchList(pagination, form.getFieldsValue());
        } catch (err) {
            console.error('Update failed', err);
            message.error('信息更新失败');
            throw err;
        }
    };

    const handleStatusChange = (record, status) => {
        const endpointId = getStudentApiId(record);
        if (!endpointId) {
            message.error('未找到学生ID');
            return;
        }

        updateStudent(endpointId, { status })
            .then(() => {
                message.success('状态更新成功');
                fetchList(pagination, form.getFieldsValue());
            })
            .catch(error => {
                console.error('Status update failed', error);
                message.error('状态更新失败');
            });
    };

    const getStudentDisplayId = (record) => record?.studentId || record?.student_id || record?.id;

    const columns = [
        {
            title: 'ID',
            dataIndex: 'student_id',
            key: 'student_id',
            width: 120,
            ellipsis: true,
            render: (_, record) => {
                const id = getStudentDisplayId(record);
                return (
                    <a
                        style={{ display: 'block', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                        onClick={() => {
                            navigator.clipboard.writeText(String(id || ''));
                            message.success('ID已复制');
                        }}
                    >
                        {id || '-'}
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
            title: '学院',
            key: 'collegeName',
            width: 140,
            render: (_, record) => getStudentCollegeName(record),
        },
        {
            title: '年级',
            dataIndex: 'grade',
            key: 'grade',
            width: 100,
            render: (text) => text || '-',
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
                    <Form.Item name="status" label="状态" initialValue="">
                        <Select style={{ width: 120 }}>
                            <Option value="">全部</Option>
                            <Option value={1}>启用</Option>
                            <Option value={2}>禁用</Option>
                        </Select>
                    </Form.Item>
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

            <UserEditModal
                open={isModalVisible}
                title="编辑学生信息"
                record={editingUser}
                onSubmit={handleEditSubmit}
                onCancel={() => setIsModalVisible(false)}
                extraFields={[
                    { name: 'student_number', label: '学号', placeholder: '请输入学号' },
                    { name: 'college_id', label: '学院ID', placeholder: '请输入学院ID' },
                    { name: 'grade', label: '年级', placeholder: '请输入年级' },
                ]}
                avatarFieldKey="avatar"
                note="*注：ID、账号等关键信息不可通过普通编辑接口修改。支持编辑学号、学院ID、年级。"
            />
        </div>
    );
});

export default StudentList;
