import React, { useEffect, useRef, useState } from 'react';
import { Button, Drawer, Form, Input, Modal, Space, Table, Tooltip, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import FileChunkUpload from '@/components/FileChunkUpload';
import { UploadScenarioMap } from '@/type/map.js';
import { queryLessonVideoLibraryAdmin } from '@/http/api.ts';

const { TextArea } = Input;

const buildResourceState = (lesson) => ({
  video_path: lesson?.video_path ?? null,
  resource_name: lesson?.resource_name || '',
});

const getFileSuffix = (fileName) => {
  const source = String(fileName || '').trim();
  const dotIndex = source.lastIndexOf('.');
  if (dotIndex <= 0 || dotIndex === source.length - 1) {
    return '';
  }
  return source.slice(dotIndex);
};

const buildLibraryVideoPath = (targetPath, fileHash, fileName) => {
  const basePath = String(targetPath || '').trim().replace(/\\/g, '/').replace(/\/+$/, '');
  const normalizedHash = String(fileHash || '').trim();
  if (!basePath || !normalizedHash) {
    return '';
  }

  const suffix = getFileSuffix(fileName);
  return `${basePath}/${normalizedHash}${suffix}`;
};

const LessonEditorDrawer = ({ visible, lesson, courseId, onClose, onChange, onSave, onImmediateSave }) => {
  const [form] = Form.useForm();
  const [resourceState, setResourceState] = useState(() => buildResourceState(lesson));
  const requestIdRef = useRef(0);
  const [libraryVisible, setLibraryVisible] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryData, setLibraryData] = useState([]);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [libraryKeyword, setLibraryKeyword] = useState('');
  const [libraryPagination, setLibraryPagination] = useState({ current: 1, pageSize: 10 });
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

  const fetchVideoLibrary = async (pageParams, keyword = '') => {
    if (!courseId) {
      setLibraryData([]);
      setLibraryTotal(0);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setLibraryLoading(true);
    try {
      const params = {
        course_id: String(courseId),
        page: pageParams.current,
        pageSize: pageParams.pageSize,
      };

      const normalizedKeyword = String(keyword || '').trim();
      if (normalizedKeyword) {
        params.filename = normalizedKeyword;
      }

      const res = await queryLessonVideoLibraryAdmin(params);
      if (!(res?.code === 200 || res?.data)) {
        throw new Error(res?.msg || '获取资源库失败');
      }

      if (currentRequestId !== requestIdRef.current) {
        return;
      }

      const list = Array.isArray(res?.data?.list) ? res.data.list : [];
      const total = Number(res?.data?.total);

      setLibraryData(list.map((item, index) => ({
        fileId: item?.fileId || item?.file_id || `temp_${index}`,
        fileName: item?.fileName || item?.file_name || '',
        target_path: item?.target_path || item?.targetPath || '',
        fileHash: item?.fileHash || item?.file_hash || '',
      })));
      setLibraryTotal(Number.isFinite(total) ? total : list.length);
      setLibraryPagination({
        current: pageParams.current,
        pageSize: pageParams.pageSize,
      });
    } catch (error) {
      console.error('Load lesson video library failed:', error);
      message.error(error?.message || '获取资源库失败');
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLibraryLoading(false);
      }
    }
  };

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

  const bindResourceToLesson = (resourceItem) => {
    const selectedName = String(resourceItem?.fileName || '').trim();
    const selectedPath = String(resourceItem?.target_path || '').trim();
    const selectedHash = String(resourceItem?.fileHash || '').trim();
    const composedVideoPath = buildLibraryVideoPath(selectedPath, selectedHash, selectedName);

    if (!selectedName || !selectedPath || !selectedHash || !composedVideoPath) {
      message.warning('所选资源数据不完整，无法绑定');
      return;
    }

    const nextLesson = {
      ...lesson,
      ...form.getFieldsValue(),
      video_path: composedVideoPath,
      resource_name: selectedName,
    };

    setResourceState({
      video_path: composedVideoPath,
      resource_name: selectedName,
    });
    onChange(nextLesson);
    setLibraryVisible(false);
    message.success(`已绑定资源视频: ${selectedName}`);
  };

  const handleOpenResourceLibrary = async () => {
    if (!courseId) {
      message.warning('课程ID缺失，无法查询资源库');
      return;
    }

    const firstPage = {
      current: 1,
      pageSize: libraryPagination.pageSize,
    };
    setLibraryVisible(true);
    await fetchVideoLibrary(firstPage, libraryKeyword);
  };

  const handleSearchLibrary = async (keyword) => {
    const nextKeyword = String(keyword || '').trim();
    setLibraryKeyword(nextKeyword);
    await fetchVideoLibrary({ current: 1, pageSize: libraryPagination.pageSize }, nextKeyword);
  };

  const handleLibraryTableChange = async (nextPagination) => {
    const pageParams = {
      current: nextPagination.current || 1,
      pageSize: nextPagination.pageSize || libraryPagination.pageSize,
    };
    await fetchVideoLibrary(pageParams, libraryKeyword);
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

  const libraryColumns = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      ellipsis: true,
      render: (value) => value || '-',
    },
  ];

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
          onClick={handleOpenResourceLibrary}
        >
          从资源库中选择
        </Button>
      </div>

      <Modal
        title="选择学校资源库视频"
        open={libraryVisible}
        onCancel={() => setLibraryVisible(false)}
        footer={null}
        width={720}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Input.Search
            placeholder="按文件名搜索"
            allowClear
            value={libraryKeyword}
            onChange={(event) => setLibraryKeyword(event.target.value)}
            onSearch={handleSearchLibrary}
          />

          <Table
            rowKey={(record) => record.fileId}
            columns={libraryColumns}
            dataSource={libraryData}
            loading={libraryLoading}
            pagination={{
              current: libraryPagination.current,
              pageSize: libraryPagination.pageSize,
              total: libraryTotal,
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            onChange={handleLibraryTableChange}
            onRow={(record) => ({
              onClick: () => bindResourceToLesson(record),
              style: { cursor: 'pointer' },
            })}
            locale={{
              emptyText: '暂无可选资源',
            }}
          />
        </Space>
      </Modal>
    </Drawer>
  );
};

export default LessonEditorDrawer;
