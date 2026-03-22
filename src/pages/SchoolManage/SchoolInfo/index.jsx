import { observer } from 'mobx-react-lite';
import { Form, Input, Button, Card, message, Spin, Upload } from 'antd';
import { useState, useEffect } from 'react';
import { getSchoolById, updateSchool } from '@/http/api.ts';
import Store from '@/store/index.ts';
import { UploadOutlined } from '@ant-design/icons';
import './index.less';

const SchoolInfo = observer(() => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const schoolId = Store.UserStore.userBaseInfo?.schoolId;

    useEffect(() => {
        if (!schoolId || schoolId === '0') {
            message.error('当前登录账号未绑定对应学校ID，无法查看学校配置信息');
            return;
        }

        setLoading(true);
        getSchoolById(schoolId)
            .then(res => {
                if (res.code === 200 && res.data) {
                    form.setFieldsValue({
                        name: res.data.name,
                        address: res.data.address,
                        charge_name: res.data.charge_name,
                        charge_phone: res.data.charge_phone,
                        evidence_img_url: res.data.evidence_img_url,
                    });
                } else {
                    message.error(res.message || '获取学校信息失败');
                }
            })
            .catch(err => {
                console.error('Failed to get school info', err);
                message.error('请求异常');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [schoolId, form]);

    const onFinish = (values) => {
        if (!schoolId || schoolId === '0') return;

        setSubmitting(true);
        updateSchool(schoolId, values)
            .then(res => {
                if (res.code === 200) {
                    message.success('学校信息更新成功！');
                } else {
                    message.error(res.message || '更新失败');
                }
            })
            .catch(err => {
                console.error('Update failed', err);
                message.error('修改请求异常');
            })
            .finally(() => {
                setSubmitting(false);
            });
    };

    return (
        <div className="school-info-container">
            <Card title="学校基础信息配置" bordered={false} className="info-card">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        className="info-form"
                    >
                        <Form.Item
                            name="name"
                            label="学校名称"
                            rules={[{ required: true, message: '请输入学校名称' }]}
                        >
                            <Input placeholder="请输入学校名称" />
                        </Form.Item>

                        <Form.Item name="address" label="学校地址">
                            <Input placeholder="请输入学校地址" />
                        </Form.Item>

                        <Form.Item name="charge_name" label="负责人姓名">
                            <Input placeholder="请输入负责人姓名" />
                        </Form.Item>

                        <Form.Item name="charge_phone" label="负责人电话">
                            <Input placeholder="请输入负责人电话" />
                        </Form.Item>

                        <Form.Item name="evidence_img_url" label="资质证明图片(URL或外部链接)">
                            <Input placeholder="请输入图片外链" />
                        </Form.Item>
                        
                        <div style={{ marginTop: 10, color: '#888', fontSize: '12px', marginBottom: 20 }}>
                            *注：当前系统暂不支持直接上传文件到服务器，请填写有效的图片链接。
                        </div>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={submitting} size="large">
                                保存修改
                            </Button>
                        </Form.Item>
                    </Form>
                )}
            </Card>
        </div>
    );
});

export default SchoolInfo;
