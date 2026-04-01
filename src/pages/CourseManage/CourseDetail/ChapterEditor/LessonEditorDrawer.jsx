import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Space } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import VideoChunkUpload from '@/components/VideoChunkUpload';

const { TextArea } = Input;

const LessonEditorDrawer = ({ visible, lesson, onClose, onSave }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && lesson) {
      form.setFieldsValue({
        title: lesson.title,
        description: lesson.description || '',
      });
    } else {
      form.resetFields();
    }
  }, [visible, lesson, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      onSave({ ...lesson, ...values });
      message.success('课时已更新');
    } catch (error) {
      console.error('Validation Error:', error);
    }
  };

  const handleSelectResource = () => {
    // 模拟选择资源
    const mockFile = {
      resource_id: `res_mock_${Date.now()}`,
      resource_name: 'mock_video_selected.mp4'
    };
    onSave({ ...lesson, ...form.getFieldsValue(), ...mockFile });
    message.success(`已选择依赖视频: ${mockFile.resource_name}`);
  };

  const handleChunkUploadSuccess = (path) => {
    const fileName = path.split('/').pop() || 'video.mp4';
    onSave({
      ...lesson,
      ...form.getFieldsValue(),
      resource_id: path,
      resource_name: fileName
    });
  };

  const isMounted = !!(lesson?.resource_id);

  return (
    <Drawer
      title="编辑课时"
      placement="right"
      onClose={onClose}
      open={visible}
      width={450}
      footer={
        <div style={{ textAlign: 'right', padding: '10px 0' }}>
          <Space>
            <Button onClick={onClose}>取消</Button>
            <Button type="primary" onClick={handleSave} icon={<SaveOutlined />}>
              保存课时
            </Button>
          </Space>
        </div>
      }
    >
      <Form layout="vertical" form={form}>
        <Form.Item
          name="title"
          label="课时名称"
          rules={[{ required: true, message: '请输入课时名称' }]}
        >
          <Input placeholder="例如: 1.1 lesson" />
        </Form.Item>
        <Form.Item
          name="description"
          label="课时简介（选填）"
        >
          <TextArea placeholder="简要描述本节课的学习目标..." rows={4} />
        </Form.Item>
      </Form>

      <div className="resource-section" style={{ marginTop: '24px' }}>
        <p style={{ fontWeight: '500', marginBottom: '8px', fontSize: '14px', color: 'rgba(0, 0, 0, 0.88)' }}>教学视频</p>
        <VideoChunkUpload
          onChange={handleChunkUploadSuccess}
          scenario="temp_video"
          previewPath={lesson?.resource_id}
          buttonText="上传教学视频"
          style={{ width: '100%', marginBottom: '16px' }}
        />

        <Button
          type="primary"
          block
          className="select-resource-btn"
          onClick={handleSelectResource}
        >
          从资源库中选择
        </Button>
      </div>
    </Drawer>
  );
};

export default LessonEditorDrawer;
