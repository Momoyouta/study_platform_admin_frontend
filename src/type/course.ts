export type CourseStatus = 0 | 1;

export interface CreateCourseDto {
  name: string;
  school_id?: string;
  cover_img?: string;
  description?: string;
}

export interface UpdateCourseDto {
  id: string;
  name?: string;
  cover_img?: string;
  description?: string;
  status?: CourseStatus;
}

export interface UpdateCourseCoverDto {
  id: string;
  temp_path: string;
}

export interface CourseListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: CourseStatus;
  school_id?: string;
}

export interface CourseListItem {
  id: string;
  school_id: string;
  creator_id: string;
  name: string;
  cover_img?: string;
  status: CourseStatus;
  create_time?: string;
  update_time?: string;
  chapter_count: number;
  total_lesson_count: number;
  teacher_names: string[];
  creator_name?: string;
}

export interface CourseListResponseDto {
  list: CourseListItem[];
  total: number;
}

export interface CourseOutlineLessonDto {
  lesson_id: string;
  title: string;
  description?: string;
  resource_id?: string | null;
  resource_name?: string;
  sort_order: number;
  duration: number;
}

export interface CourseOutlineChapterDto {
  chapter_id: string;
  title: string;
  sort_order: number;
  lessons: CourseOutlineLessonDto[];
}

export interface CourseOutlineDraftDto {
  course_id: string;
  school_id: string;
  status: CourseStatus;
  chapters: CourseOutlineChapterDto[];
}

export type CourseOutlineSource = 'draft' | 'published';

export type CourseOutlineDraftContent = Partial<CourseOutlineDraftDto> & {
  chapters: CourseOutlineChapterDto[];
};

export interface SaveCourseDraftDto {
  course_id: string;
  draft_content: CourseOutlineDraftContent;
}

export interface SaveCourseDraftResponseDto {
  course_id: string;
  updated: boolean;
}

export interface PublishIdMappingItemDto {
  temp_id: string;
  real_id: string;
}

export interface PublishIdMappingsDto {
  chapters: PublishIdMappingItemDto[];
  lessons: PublishIdMappingItemDto[];
}

export interface PublishCourseOutlineDto {
  course_id: string;
  draft_content: CourseOutlineDraftContent;
}

export interface PublishCourseOutlineResponseDto {
  course_id: string;
  published: boolean;
  chapter_count: number;
  lesson_count: number;
  id_mappings: PublishIdMappingsDto;
}

export interface ChapterQuickUpdateDto {
  chapter_id: string;
  title: string;
}

export interface QuickUpdateChapterTitleDto {
  course_id: string;
  draft_content: CourseOutlineDraftContent;
  chapter: ChapterQuickUpdateDto;
}

export interface QuickUpdateChapterTitleResponseDto {
  course_id: string;
  chapter_id: string;
  updated: boolean;
}

export interface LessonQuickUpdateDto {
  lesson_id: string;
  chapter_id: string;
  title: string;
  description?: string;
  resource_id?: string | null;
  duration: number;
  sort_order: number;
}

export interface QuickUpdateLessonDto {
  course_id: string;
  draft_content: CourseOutlineDraftContent;
  lesson: LessonQuickUpdateDto;
}

export interface QuickUpdateLessonResponseDto {
  course_id: string;
  lesson_id: string;
  updated: boolean;
}
