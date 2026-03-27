import { observer } from 'mobx-react-lite';
import { Form, Input, Select, Button, Table, Space, Tag, Modal, message, Radio, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import moment from 'moment';
import { applySchool, getSchoolApplications, reviewSchoolApplication, uploadImageTemp } from '@/http/api.ts';
import { SchoolApplicationStatusMap } from '@/type/map.js';
import { toViewFileUrl } from '@/utils/fileUrl.ts';
import './index.less';

const { Option } = Select;

const SchoolApproval = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [total, setTotal] = useState(0);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

    const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
    const [reviewForm] = Form.useForm();
    const [reviewingRecord, setReviewingRecord] = useState(null);

    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();
    const [uploading, setUploading] = useState(false);

    const normalizeParams = (params) => {
        const next = { ...params };
        Object.keys(next).forEach((key) => {
            if (next[key] === undefined || next[key] === '') {
                delete next[key];
            }
        });
        return next;
    };

    const fetchList = (pageParams = pagination, searchParams = form.getFieldsValue()) => {
        setLoading(true);
        const params = normalizeParams({
            page: pageParams.current,
            pageSize: pageParams.pageSize,
            ...searchParams,
        });

        getSchoolApplications(params)
            .then((res) => {
                if (res.code === 200 || res.data) {
                    setData(res.data?.list || []);
                    setTotal(res.data?.total || 0);
                }
            })
            .catch((error) => {
                console.error('Failed to fetch school application list', error);
                message.error('获取学校申请列表失败');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const showEvidenceImage = (url) => {
        if (!url) {
            message.warning('暂无证明图片');
            return;
        }
        const viewUrl = toViewFileUrl(url);
        console.log('Viewing evidence image:', viewUrl);
        Modal.info({
            title: '证明图片',
            width: 600,
            content: (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <img src={viewUrl} alt="证明" style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} />
                </div>
            ),
            okText: '关闭',
            maskClosable: true,
        });
    };

    const openReviewModal = (record) => {
        setReviewingRecord(record);
        reviewForm.setFieldsValue({
            action: 'approve',
            review_remark: '',
            reject_reason: '',
        });
        setIsReviewModalVisible(true);
    };

    const handleReviewCancel = () => {
        setIsReviewModalVisible(false);
        setReviewingRecord(null);
        reviewForm.resetFields();
    };

    const handleReviewSubmit = async () => {
        try {
            const values = await reviewForm.validateFields();
            await reviewSchoolApplication(reviewingRecord.id, values);
            message.success('审批成功');
            handleReviewCancel();
            fetchList();
        } catch (error) {
            if (error?.errorFields) return;
            console.error('Review school application failed', error);
            message.error('审批失败');
        }
    };

    const extractUploadedPath = (res) => {
        if (typeof res === 'string') return res;
        if (typeof res?.data === 'string') return res.data;
        if (typeof res?.data?.path === 'string') return res.data.path;
        if (typeof res?.path === 'string') return res.path;
        return '';
    };

    const handleEvidenceUpload = async (file) => {
        const isImage = file.type?.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件');
            return Upload.LIST_IGNORE;
        }

        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('图片大小不能超过 5MB');
            return Upload.LIST_IGNORE;
        }

        setUploading(true);
        try {
            const res = await uploadImageTemp(file);
            const relativePath = extractUploadedPath(res);
            if (!relativePath) {
                throw new Error('Upload response missing file path');
            }
            createForm.setFieldValue('evidence_img_url', relativePath);
            message.success('图片上传成功');
        } catch (error) {
            console.error('Upload evidence image failed', error);
            message.error('图片上传失败');
        } finally {
            setUploading(false);
        }

        return Upload.LIST_IGNORE;
    };

    const handleCreateCancel = () => {
        setIsCreateModalVisible(false);
        createForm.resetFields();
    };

    const handleCreateSubmit = async () => {
        try {
            const values = await createForm.validateFields();
            await applySchool(values);
            message.success('学校申请提交成功');
            handleCreateCancel();
            fetchList();
        } catch (error) {
            if (error?.errorFields) return;
            console.error('Create school application failed', error);
            message.error('提交申请失败');
        }
    };

    const columns = [
        {
            title: '申请ID',
            dataIndex: 'id',
            key: 'id',
            width: 140,
            ellipsis: true,
            render: (text) => (
                <a
                    style={{ display: 'block', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    onClick={() => {
                        navigator.clipboard.writeText(String(text));
                        message.success('申请ID已复制');
                    }}
                >
                    {text}
                </a>
            ),
        },
        { title: '学校名', dataIndex: 'school_name', key: 'school_name', ellipsis: true },
        { title: '学校地址', dataIndex: 'school_address', key: 'school_address', ellipsis: true },
        { title: '负责人', dataIndex: 'charge_name', key: 'charge_name', width: 120 },
        { title: '负责人电话', dataIndex: 'charge_phone', key: 'charge_phone', width: 140 },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 110,
            render: (status) => {
                const config = SchoolApplicationStatusMap[status] || { color: 'default', text: '未知' };
                return <Tag color={config.color}>{config.text}</Tag>;
            },
        },
        {
            title: '证明',
            key: 'evidence_img_url',
            width: 100,
            render: (_, record) => <a onClick={() => showEvidenceImage(record.evidence_img_url)}>查看图片</a>,
        },
        {
            title: '审批备注',
            dataIndex: 'review_remark',
            key: 'review_remark',
            ellipsis: true,
            width: 180,
            render: (text) => text || '-',
        },
        {
            title: '驳回原因',
            dataIndex: 'reject_reason',
            key: 'reject_reason',
            ellipsis: true,
            width: 180,
            render: (text) => text || '-',
        },
        {
            title: '申请时间',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (val) => (val ? moment(val).format('YYYY-MM-DD HH:mm:ss') : '-'),
        },
        {
            title: '操作',
            key: 'action',
            fixed: 'right',
            width: 100,
            render: (_, record) => {
                if (record.status !== 0) {
                    return <span style={{ color: '#999' }}>已审批</span>;
                }
                return <a onClick={() => openReviewModal(record)}>审批</a>;
            },
        },
    ];

    const reviewAction = Form.useWatch('action', reviewForm);

    return (
        <div className="school-approval-container">
            <div className="search-wrapper">
                <Form form={form} layout="inline" onFinish={onSearch} className="search-form">
                    <Form.Item name="school_name" label="学校名">
                        <Input placeholder="请输入学校名称" allowClear />
                    </Form.Item>
                    <Form.Item name="charge_phone" label="负责人电话">
                        <Input placeholder="请输入负责人电话" allowClear />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select placeholder="请选择状态" allowClear style={{ width: 120 }}>
                            <Option value={0}>待审核</Option>
                            <Option value={1}>通过</Option>
                            <Option value={2}>驳回</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit">查询</Button>
                            <Button onClick={onReset}>重置</Button>
                            <Button onClick={() => setIsCreateModalVisible(true)}>新建申请</Button>
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
                        showTotal: (count) => `共 ${count} 条记录`,
                    }}
                    onChange={handleTableChange}
                    scroll={{ x: 'max-content' }}
                />
            </div>

            <Modal
                title="审批学校申请"
                open={isReviewModalVisible}
                onOk={handleReviewSubmit}
                onCancel={handleReviewCancel}
                okText="确认"
                cancelText="取消"
            >
                <Form form={reviewForm} layout="vertical">
                    <Form.Item name="action" label="审批动作" rules={[{ required: true, message: '请选择审批动作' }]}>
                        <Radio.Group>
                            <Radio value="approve">通过</Radio>
                            <Radio value="reject">驳回</Radio>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item name="review_remark" label="审批备注">
                        <Input.TextArea rows={3} placeholder="可填写审批说明" />
                    </Form.Item>
                    {reviewAction === 'reject' && (
                        <Form.Item
                            name="reject_reason"
                            label="驳回原因"
                            rules={[{ required: true, message: '请填写驳回原因' }]}
                        >
                            <Input.TextArea rows={3} placeholder="请填写驳回原因" />
                        </Form.Item>
                    )}
                </Form>
            </Modal>

            <Modal
                title="新建学校申请"
                open={isCreateModalVisible}
                onOk={handleCreateSubmit}
                onCancel={handleCreateCancel}
                okText="提交申请"
                cancelText="取消"
            >
                <Form form={createForm} layout="vertical">
                    <Form.Item
                        name="school_name"
                        label="学校名称"
                        rules={[{ required: true, message: '请输入学校名称' }]}
                    >
                        <Input placeholder="请输入学校名称" />
                    </Form.Item>
                    <Form.Item
                        name="school_address"
                        label="学校地址"
                        rules={[{ required: true, message: '请输入学校地址' }]}
                    >
                        <Input placeholder="请输入学校地址" />
                    </Form.Item>
                    <Form.Item
                        name="charge_name"
                        label="负责人姓名"
                        rules={[{ required: true, message: '请输入负责人姓名' }]}
                    >
                        <Input placeholder="请输入负责人姓名" />
                    </Form.Item>
                    <Form.Item
                        name="charge_phone"
                        label="负责人电话"
                        rules={[{ required: true, message: '请输入负责人电话' }]}
                    >
                        <Input placeholder="请输入负责人电话" />
                    </Form.Item>
                    <Form.Item
                        name="evidence_img_url"
                        label="证明材料URL"
                        rules={[{ required: true, message: '请上传证明图片或填写URL' }]}
                    >
                        <Input placeholder="上传后自动填充，也可手动输入" />
                    </Form.Item>
                    <Upload
                        maxCount={1}
                        showUploadList={false}
                        beforeUpload={handleEvidenceUpload}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />} loading={uploading}>上传证明图片</Button>
                    </Upload>
                    <div className="upload-tip">支持图片格式，大小不超过 5MB</div>
                </Form>
            </Modal>
        </div>
    );
});

export default SchoolApproval;
