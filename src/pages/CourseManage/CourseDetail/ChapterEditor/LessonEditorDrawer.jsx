import React, { useEffect } from 'react';
import { Drawer, Form, Input, Button, message, Space, Upload } from 'antd';
import { FolderOpenOutlined, SaveOutlined } from '@ant-design/icons';

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

  const handleUpload = (info) => {
    const { status, name } = info.file;
    // 模拟上传成功的逻辑
    if (status === 'done' || status === 'uploading') {
      // 模拟秒传或上传成功
      const mockResource = {
        resource_id: `res_up_${Date.now()}`,
        resource_name: name,
      };
      onSave({ ...lesson, ...form.getFieldsValue(), ...mockResource });
      message.success(`文件 ${name} 模拟上传成功`);
    }
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

      <div className="resource-section">
        <label className="section-label">教学视频</label>
        <Upload
          accept="video/*"
          showUploadList={false}
          customRequest={({ onSuccess }) => {
            // 模拟接口延迟
            setTimeout(() => onSuccess("ok"), 500);
          }}
          onChange={handleUpload}
          style={{ width: '100%' }}
        >
          <div className={`resource-card ${isMounted ? 'mounted' : 'empty'}`} style={{ cursor: 'pointer' }}>
            <div className="card-inner">
              <FolderOpenOutlined className="icon-main" />
              {isMounted ? (
                <p className="status-text">
                  上传成功，当前视频：<strong>{lesson?.resource_name}</strong>
                  <br />点击重新上传
                </p>
              ) : (
                <p className="status-text">暂未挂载视频资源</p>
              )}
              <p className="hint-text">支持分片断点续传，最大2GB</p>
            </div>
          </div>
        </Upload>
        
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
