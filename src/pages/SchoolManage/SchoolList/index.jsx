import { observer } from 'mobx-react-lite';
import { Form, Input, Select, Button, Table, Space, Tag, Modal, message } from 'antd';
import { useState, useEffect } from 'react';
import { getSchools, updateSchool, removeSchoolHard } from '@/http/api.ts';
import { SchoolStatusMap } from '@/type/map.js';
import './index.less';

const { Option } = Select;

const SchoolList = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [editForm] = Form.useForm();

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

        getSchools(params)
            .then(res => {
                if (res.code === 200 || res.data) {
                    setData(res.data.list || []);
                    setTotal(res.data.total || 0);
                }
            })
            .catch(error => {
                console.error('Failed to fetch school list', error);
                message.error('获取学校列表失败');
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

    const handleStatusChange = (id, status, isDelete = false) => {
        const request = isDelete 
            ? removeSchoolHard(id) 
            : updateSchool(id, { status });

        request
            .then(() => {
                message.success(isDelete ? '学校已拒绝并删除' : '操作成功');
                fetchList();
            })
            .catch(error => {
                console.error('Action failed', error);
                message.error('操作失败');
            });
    };

    const handleEditClick = (record) => {
        setEditingSchool(record);
        editForm.setFieldsValue({
            name: record.name,
            address: record.address,
            charge_name: record.charge_name,
            charge_phone: record.charge_phone,
        });
        setIsEditModalVisible(true);
    };

    const handleEditCancel = () => {
        setIsEditModalVisible(false);
        setEditingSchool(null);
        editForm.resetFields();
    };

    const handleEditSubmit = () => {
        editForm.validateFields()
            .then(values => {
                return updateSchool(editingSchool.id, values);
            })
            .then(() => {
                message.success('编辑成功');
                setIsEditModalVisible(false);
                setEditingSchool(null);
                fetchList();
            })
            .catch(error => {
                if (error.errorFields) return; // Form validation error
                console.error('Edit failed', error);
                message.error('编辑失败');
            });
    };

    const showEvidenceImage = (url) => {
        if (!url) {
            message.warning('暂无证明图片');
            return;
        }
        Modal.info({
            title: '证明图片',
            width: 600,
            content: (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <img src={url} alt="证明" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
                </div>
            ),
            okText: '关闭',
            maskClosable: true,
        });
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
        { title: '学校名', dataIndex: 'name', key: 'name', ellipsis: true },
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
        { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
        { title: '负责人', dataIndex: 'charge_name', key: 'charge_name', width: 120 },
        { title: '负责人电话', dataIndex: 'charge_phone', key: 'charge_phone', width: 140 },
        {
            title: '证明',
            key: 'evidence_img_url',
            width: 100,
            render: (_, record) => (
                <a onClick={() => showEvidenceImage(record.evidence_img_url)}>
                    查看图片
                </a>
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 180,
            render: (_, record) => {
                if (record.status === 0) {
                    return (
                        <Space>
                            <a onClick={() => handleStatusChange(record.id, 1)}>通过</a>
                            <a style={{ color: 'red' }} onClick={() => handleStatusChange(record.id, null, true)}>拒绝</a>
                        </Space>
                    );
                }
                return (
                    <Space>
                        <a onClick={() => handleEditClick(record)}>编辑</a>
                        {record.status === 1 ? (
                            <a style={{ color: 'red' }} onClick={() => handleStatusChange(record.id, 2)}>禁用</a>
                        ) : (
                            <a onClick={() => handleStatusChange(record.id, 1)}>启用</a>
                        )}
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="school-list-container">
            <div className="search-wrapper">
                <Form form={form} layout="inline" onFinish={onSearch} className="search-form">
                    <Form.Item name="id" label="ID">
                        <Input placeholder="请输入学校ID" allowClear />
                    </Form.Item>
                    <Form.Item name="name" label="学校名">
                        <Input placeholder="请输入学校名称" allowClear />
                    </Form.Item>
                    <Form.Item name="charge_name" label="负责人">
                        <Input placeholder="请输入负责人姓名" allowClear />
                    </Form.Item>
                    <Form.Item name="charge_phone" label="负责人电话">
                        <Input placeholder="请输入负责人电话" allowClear />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
                            <Option value={0}>审核中</Option>
                            <Option value={1}>启用</Option>
                            <Option value={2}>禁用</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">
                                查询
                            </Button>
                            <Button onClick={onReset}>重置</Button>
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <div className="table-wrapper">
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
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </div>

            <Modal
                title="编辑学校信息"
                open={isEditModalVisible}
                onOk={handleEditSubmit}
                onCancel={handleEditCancel}
                okText="保存"
                cancelText="取消"
            >
                <Form form={editForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="学校名"
                        rules={[{ required: true, message: '请输入学校名称' }]}
                    >
                        <Input placeholder="请输入学校名称" />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="地址"
                    >
                        <Input placeholder="请输入学校地址" />
                    </Form.Item>
                    <Form.Item
                        name="charge_name"
                        label="负责人"
                    >
                        <Input placeholder="请输入负责人姓名" />
                    </Form.Item>
                    <Form.Item
                        name="charge_phone"
                        label="负责人电话"
                    >
                        <Input placeholder="请输入负责人电话" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
});

export default SchoolList;

