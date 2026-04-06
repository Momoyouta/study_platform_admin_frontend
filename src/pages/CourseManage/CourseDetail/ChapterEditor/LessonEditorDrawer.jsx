import React, { useEffect, useState } from 'react';
import { Button, Drawer, Form, Input, Modal, Space, Tooltip, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import FileChunkUpload from '@/components/FileChunkUpload';
import { UploadScenarioMap } from '@/type/map.js';

const { TextArea } = Input;

const buildResourceState = (lesson) => ({
  video_path: lesson?.video_path ?? null,
  resource_name: lesson?.resource_name || '',
});

const LessonEditorDrawer = ({ visible, lesson, onClose, onChange, onSave, onImmediateSave }) => {
  const [form] = Form.useForm();
  const [resourceState, setResourceState] = useState(() => buildResourceState(lesson));
  const canImmediateSave = !String(lesson?.lesson_id || '').startsWith('temp') && !String(lesson?.chapterId || '').startsWith('temp');
  const immediateSaveTip = canImmediateSave
    ? '立刻保存会立即更新并发布该课时。'
    : '立刻保存会立即更新并发布该课时，未发布内容不可立刻保存。';

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

  const handleLocalSave = async () => {
    try {
      const values = await form.validateFields();

      await onSave({
        ...lesson,
        ...values,
        ...resourceState,
      });

      message.success('课时已保存');
    } catch (error) {
      console.error('Validation Error:', error);
    }
  };

  const handleImmediateSave = async () => {
    try {
      await form.validateFields();

      Modal.confirm({
        title: '立刻保存课时',
        content: '该操作会立马发布该更新，确认后将直接保存并关闭编辑弹层。',
        okText: '确认保存',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          await onImmediateSave({
            ...lesson,
            ...form.getFieldsValue(),
            ...resourceState,
          });
        },
      });
    } catch (error) {
      console.error('Validation Error:', error);
    }
  };

  const handleSelectResource = () => {
    // 模拟选择资源
    const mockFile = {
      video_path: `res_mock_${Date.now()}`,
      resource_name: 'mock_video_selected.mp4'
    };
    const nextLesson = {
      ...lesson,
      ...form.getFieldsValue(),
      ...mockFile,
    };
    setResourceState(mockFile);
    onChange(nextLesson);
    message.success(`已选择依赖视频: ${mockFile.resource_name}`);
  };

  const handleChunkUploadSuccess = (path) => {
    const fileName = path.split('/').pop() || 'video.mp4';
    const nextLesson = {
      ...lesson,
      ...form.getFieldsValue(),
      video_path: path,
      resource_name: fileName
    };
    setResourceState({
      video_path: path,
      resource_name: fileName,
    });
    onChange(nextLesson);
  };

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
            <Button type="primary" onClick={handleLocalSave} icon={<SaveOutlined />}>
              保存课时
            </Button>
            <Tooltip title={immediateSaveTip} placement="top">
              <span>
                <Button onClick={handleImmediateSave} icon={<SaveOutlined />} disabled={!canImmediateSave}>
                  立刻保存
                </Button>
              </span>
            </Tooltip>
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
        <FileChunkUpload
          onChange={handleChunkUploadSuccess}
          scenario={UploadScenarioMap.TEMP_VIDEO}
          previewPath={resourceState?.video_path}
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
