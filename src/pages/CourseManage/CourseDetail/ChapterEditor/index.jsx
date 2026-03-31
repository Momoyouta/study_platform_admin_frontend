import React, { useState } from 'react';
import { Button, message, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import ChapterItem from './ChapterItem';
import LessonEditorDrawer from './LessonEditorDrawer';
import './index.less';

// 预设的 JSON 测试数据
const initialData = [
  {
    chapter_id: '201',
    title: '前端工程化基础',
    sort_order: 1,
    lessons: [
      {
        lesson_id: '301',
        title: 'Vite 核心原理解析',
        description: '本节课主要讲解 Vite 的双引擎架构...',
        sort_order: 1,
        resource_id: 'res_88291',
        resource_name: 'xxx.mp4',
        duration: 1250
      },
      {
        lesson_id: 'temp_uuid_a1b2',
        title: 'React 19 新特性',
        description: '',
        sort_order: 2,
        resource_id: null,
        duration: 0
      }
    ]
  },
  {
    chapter_id: 'temp_uuid_c3d4',
    title: '后端与微服务架构',
    sort_order: 2,
    lessons: [
      {
        lesson_id: 'temp_uuid_e5f6',
        title: 'NestJS 依赖注入机制',
        description: '深入理解 IoC 容器',
        sort_order: 1,
        resource_id: 'res_99302',
        resource_name: 'nestjs.mp4',
        duration: 3400
      }
    ]
  }
];

const CourseOutline = ({ courseId }) => {
  const [chapters, setChapters] = useState(initialData);
  const [editingLesson, setEditingLesson] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSaveDraft = () => {
    console.log('保存草稿:', chapters);
    message.success('已保存草稿');
  };

  const handlePublish = () => {
    console.log('发布大纲:', chapters);
    message.success('大纲已发布');
  };

  const handleAddChapter = () => {
    const newChapter = {
      chapter_id: `chap_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: '未命名章节',
      sort_order: chapters.length + 1,
      lessons: []
    };
    setChapters([...chapters, newChapter]);
  };

  const handleAddLesson = (chapterId) => {
    setChapters(prev => prev.map(chap => {
      if (chap.chapter_id === chapterId) {
        return {
          ...chap,
          lessons: [
            ...chap.lessons,
            {
              lesson_id: `les_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              title: '新建课时',
              description: '',
              sort_order: chap.lessons.length + 1,
              resource_id: null,
              duration: 0
            }
          ]
        };
      }
      return chap;
    }));
  };

  const handleRenameChapter = (chapterId, newTitle) => {
    setChapters(prev => prev.map(chap => {
      if (chap.chapter_id === chapterId) {
        return {
          ...chap,
          title: newTitle
        };
      }
      return chap;
    }));
  };

  const handleEditLesson = (chapterId, lesson) => {
    setEditingLesson({ chapterId, ...lesson });
  };

  const handleSaveLesson = (updatedLesson) => {
    setChapters(prev => prev.map(chap => {
      if (chap.chapter_id === updatedLesson.chapterId) {
        return {
          ...chap,
          lessons: chap.lessons.map(les => 
            les.lesson_id === updatedLesson.lesson_id ? { ...les, ...updatedLesson } : les
          )
        };
      }
      return chap;
    }));
    setEditingLesson(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const activeType = active.data.current?.type;
      const overType = over.data.current?.type;

      if (!activeType || !overType) return;

      // 章节排序
      if (activeType === 'chapter' && overType === 'chapter') {
        setChapters((items) => {
          const oldIndex = items.findIndex(item => item.chapter_id === active.id);
          const newIndex = items.findIndex(item => item.chapter_id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }

      // 课时排序 (只允许在同一个章节内排序)
      if (activeType === 'lesson' && overType === 'lesson') {
        const activeChapterId = active.data.current?.chapterId;
        const overChapterId = over.data.current?.chapterId;
        
        if (activeChapterId === overChapterId) {
          setChapters((items) => items.map(chap => {
            if (chap.chapter_id === activeChapterId) {
              const oldIndex = chap.lessons.findIndex(l => l.lesson_id === active.id);
              const newIndex = chap.lessons.findIndex(l => l.lesson_id === over.id);
              return {
                ...chap,
                lessons: arrayMove(chap.lessons, oldIndex, newIndex)
              };
            }
            return chap;
          }));
        }
      }
    }
  };

  const chapterIds = chapters.map(c => c.chapter_id);

  return (
    <div className="course-outline-wrapper">
      <div className="outline-header">
        <h3 className="outline-title">课程大纲构建</h3>
        <Space>
          <Button onClick={handleSaveDraft}>存为草稿</Button>
          <Button type="primary" onClick={handlePublish}>发布大纲</Button>
        </Space>
      </div>

      <div className="outline-content">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="chapter-list-container">
            <SortableContext 
              items={chapterIds}
              strategy={verticalListSortingStrategy}
            >
              {chapters.map((chapter, index) => (
                <ChapterItem 
                  key={chapter.chapter_id}
                  chapter={chapter}
                  index={index}
                  onAddLesson={handleAddLesson}
                  onRenameChapter={handleRenameChapter}
                  onEditLesson={handleEditLesson}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>

        <div className="add-chapter-btn" onClick={handleAddChapter}>
          <PlusOutlined /> 添加新章节
        </div>
      </div>

      <LessonEditorDrawer 
        visible={!!editingLesson}
        lesson={editingLesson}
        onClose={() => setEditingLesson(null)}
        onSave={handleSaveLesson}
      />
    </div>
  );
};

export default CourseOutline;
