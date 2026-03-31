import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Typography } from 'antd';
import { HolderOutlined, PlusOutlined } from '@ant-design/icons';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import LessonItem from './LessonItem';

const { Text } = Typography;

const toChineseNum = (num) => {
  const cnNums = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (num <= 10) return cnNums[num];
  if (num < 20) return '十' + (num % 10 === 0 ? '' : cnNums[num % 10]);
  if (num < 100) {
    const unit = num % 10;
    const ten = Math.floor(num / 10);
    return cnNums[ten] + '十' + (unit === 0 ? '' : cnNums[unit]);
  }
  return num;
};

const ChapterItem = ({ chapter, index, onAddLesson, onRenameChapter, onEditLesson }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: chapter.chapter_id,
    data: { type: 'chapter', chapter }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 1,
    position: 'relative',
  };

  const lessonIds = chapter.lessons?.map(l => l.lesson_id) || [];

  return (
    <div className="chapter-item-wrapper" ref={setNodeRef} style={style}>
      <div className="chapter-header">
        <div className="chapter-drag-handle" {...attributes} {...listeners}>
          <HolderOutlined />
        </div>
        <div className="chapter-title">
          <span style={{ marginRight: 8, whiteSpace: 'nowrap' }}>第{toChineseNum(index + 1)}章：</span>
          <Text 
            editable={{ onChange: (val) => onRenameChapter(chapter.chapter_id, val) }}
          >
            {chapter.title}
          </Text>
        </div>
        <div className="chapter-extra">
          包含{lessonIds.length}个课时
        </div>
      </div>
      
      <div className="chapter-body">
        <SortableContext 
          items={lessonIds} 
          strategy={verticalListSortingStrategy}
        >
          <div className="lesson-list">
            {(chapter.lessons || []).map((lesson, lessonIdx) => (
              <LessonItem 
                key={lesson.lesson_id} 
                lesson={lesson} 
                chapterId={chapter.chapter_id}
                chapterIndex={index}
                lessonIndex={lessonIdx}
                onEdit={() => onEditLesson(chapter.chapter_id, lesson)}
              />
            ))}
          </div>
        </SortableContext>
        
        <div className="add-lesson-btn" onClick={() => onAddLesson(chapter.chapter_id)}>
          <PlusOutlined /> 添加课时
        </div>
      </div>
    </div>
  );
};

export default ChapterItem;
