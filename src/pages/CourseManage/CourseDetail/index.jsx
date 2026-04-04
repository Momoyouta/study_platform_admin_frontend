import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Tabs,
    Form,
    Input,
    Button,
    Select,
    message,
    Spin,
    Descriptions,
    Space,
    Divider,
    Alert,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { getCourseBasicAdmin, updateCourseAdmin, updateCourseCoverAdmin } from '@/http/api.ts';
import TempImageUpload from '@/components/TempImageUpload';
import moment from 'moment';
import TaskEditor from './TaskEditor';
import CourseOutline from './ChapterEditor';
import TeachingGroupManage from './TeachingGroupManage';
import './index.less';

const { TabPane } = Tabs;
const { Option } = Select;

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

const CourseDetail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const courseId = searchParams.get('courseId');
    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [courseData, setCourseData] = useState(null);
    const [error, setError] = useState(null);

    const fetchDetail = useCallback(async () => {
        if (!courseId) {
            setError('课程ID缺失');
            return;
        }

        setLoading(true);
        try {
            const res = await getCourseBasicAdmin(courseId);
            if (res.code === 200 || res.data) {
                const data = res.data;
                setCourseData(data);
                form.setFieldsValue({
                    name: data.name,
                    status: data.status,
                    cover_img: data.cover_img,
                });
            } else {
                setError(res.msg || '获取课程详情失败');
            }
        } catch (err) {
            console.error('Fetch course detail failed:', err);
            setError('获取课程详情接口异常');
        } finally {
            setLoading(false);
        }
    }, [courseId, form]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaving(true);

            if (values.cover_img) {
                const coverPayload = {
                    id: courseId,
                    temp_path: values.cover_img,
                };
                const coverRes = await updateCourseCoverAdmin(coverPayload);
                if (coverRes.code !== 200 && !coverRes.success) {
                    message.error(coverRes.msg || '封面更新失败');
                    setSaving(false);
                    return;
                }
            }

            const payload = {
                id: courseId,
                name: values.name,
                status: values.status,
            };

            const updateRes = await updateCourseAdmin(payload);
            if (updateRes.code === 200 || updateRes.success) {
                message.success('保存成功');
                fetchDetail();
            } else {
                message.error(updateRes.msg || '保存失败');
            }
        } catch (err) {
            console.error('Save course basic info failed:', err);
            if (err?.errorFields) {
                message.warning('请检查输入项');
            } else {
                message.error('保存接口异常');
            }
        } finally {
            setSaving(false);
        }
    };

    if (error) {
        return (
            <div className="course-detail-error">
                <Alert
                    message="访问错误"
                    description={error}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" type="primary" onClick={() => navigate('/course-manage/course-list')}>
                            返回列表
                        </Button>
                    }
                />
            </div>
        );
    }

    if (loading && !courseData) {
        return <div className="course-detail-loading"><Spin tip="加载中..." /></div>;
    }

    return (
        <div className="home-content-inner">
            <div className="detail-header">
                <Space>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
                    <h2 className="title">课程详情 - {courseData?.name || '...'}</h2>
                </Space>
            </div>

            <Tabs defaultActiveKey="basic" className="detail-tabs">
                <TabPane tab="基础信息" key="basic">
                    <div className="tab-content basic-info-tab">
                        <Descriptions bordered size="small" column={2} className="read-only-descriptions">
                            <Descriptions.Item label="课程ID">{courseData?.id}</Descriptions.Item>
                            <Descriptions.Item label="学校名称">{courseData?.school_name || '-'}</Descriptions.Item>
                            <Descriptions.Item label="学校ID">{courseData?.school_id}</Descriptions.Item>
                            <Descriptions.Item label="任课老师">
                                {formatTeacherNameText(courseData?.teacher_names)}
                            </Descriptions.Item>
                            <Descriptions.Item label="创建时间">
                                {courseData?.create_time ? moment.unix(Number(courseData.create_time)).format('YYYY-MM-DD HH:mm:ss') : '-'}
                            </Descriptions.Item>
                            <Descriptions.Item label="更新时间">
                                {courseData?.update_time ? moment.unix(Number(courseData.update_time)).format('YYYY-MM-DD HH:mm:ss') : '-'}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">可编辑信息</Divider>

                        <Form
                            form={form}
                            layout="vertical"
                            className="edit-form"
                            initialValues={{ status: 0 }}
                        >
                            <Form.Item
                                name="name"
                                label="课程名称"
                                rules={[{ required: true, message: '请输入课程名称' }]}
                            >
                                <Input placeholder="请输入课程名称" maxLength={255} />
                            </Form.Item>

                            <Form.Item
                                name="status"
                                label="状态"
                                rules={[{ required: true }]}
                            >
                                <Select style={{ width: 200 }}>
                                    <Option value={0}>未发布</Option>
                                    <Option value={1}>已发布</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="cover_img"
                                label="封面图"
                                extra="建议尺寸 16:9，大小不超过 5MB"
                            >
                                <div className="cover-upload-wrapper">
                                    <TempImageUpload
                                        variant="picture-card"
                                        previewPath={form.getFieldValue('cover_img')}
                                        onChange={(path) => form.setFieldsValue({ cover_img: path })}
                                    />
                                </div>
                            </Form.Item>

                            <Form.Item className="form-actions">
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    onClick={handleSave}
                                    size="large"
                                >
                                    保存修改
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </TabPane>

                <TabPane tab="教学组管理" key="teaching-groups">
                    <div className="tab-content teaching-group-tab">
                        <TeachingGroupManage
                            courseId={courseId}
                            schoolId={courseData?.school_id}
                        />
                    </div>
                </TabPane>

                <TabPane tab="章节课时" key="chapters">
                    <div className="tab-content outline-tab">
                        <CourseOutline courseId={courseId} />
                    </div>
                </TabPane>
                <TabPane tab="任务编辑" key="tasks">
                    <div className="tab-content task-editor-tab">
                        <TaskEditor courseId={courseId} />
                    </div>
                </TabPane>
                <TabPane tab="作业管理" key="homework">
                    <div className="placeholder-content">
                        <Alert message="作业管理功能暂未开放" type="info" showIcon />
                    </div>
                </TabPane>
                <TabPane tab="统计信息" key="stats">
                    <div className="placeholder-content">
                        <Alert message="统计信息功能暂未开放" type="info" showIcon />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
};

export default CourseDetail;
