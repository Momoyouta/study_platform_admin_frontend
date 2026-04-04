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
  teacher_names: TeacherSimpleDto[];
  creator_name?: string;
}

export interface CourseListResponseDto {
  list: CourseListItem[];
  total: number;
}

export interface CourseBasicAdminDto {
  id: string;
  school_id: string;
  school_name?: string;
  creator_id?: string;
  creator_name?: string;
  name: string;
  status: CourseStatus;
  cover_img?: string;
  description?: string;
  teacher_names?: TeacherSimpleDto[];
  teacher_ids?: string[];
  teaching_group_id?: string;
  teaching_group?: string;
  invitation_code?: string | null;
  invitation_create_time?: string | null;
  invitation_ttl?: number | null;
  create_time?: string;
  update_time?: string;
}

export interface SchoolTeacherByNameParams {
  school_id?: string;
  name: string;
  page?: number;
  pageSize?: number;
}

export interface TeacherSimpleDto {
  id: string;
  name: string;
}

export type SchoolTeacherSimpleDto = TeacherSimpleDto;

export interface SchoolTeacherByNameResponseDto {
  list: SchoolTeacherSimpleDto[];
  total: number;
}

export interface BindTeachingGroupTeachersDto {
  course_id: string;
  teaching_group_id: string;
  teacher_ids: string[];
}

export interface BindTeachingGroupTeachersResponseDto {
  course_id: string;
  teaching_group_id: string;
  teacher_ids: string[];
  updated: true;
}

export interface CreateCourseInviteDto {
  school_id?: string;
  course_id: string;
  teaching_group_id: string;
  ttl?: number;
}

export interface CreateCourseInviteResponseDto {
  code: string;
  type: number;
  course_id: string;
  teaching_group_id: string;
  createTime: string;
  ttl?: number | null;
  expire_time?: string | null;
}

export interface CreateTeachingGroupAdminDto {
  course_id: string;
  name: string;
}

export interface CreateTeachingGroupAdminResponseDto {
  id: string;
  course_id: string;
  name: string;
  invite_code: string;
}

export type TeachingGroupTeacherDto = TeacherSimpleDto;

export interface TeachingGroupItemDto {
  id: string;
  course_id: string;
  name: string;
  invite_code?: string;
  create_time?: string;
  createTime?: string;
  ttl?: number | null;
  teachers?: TeacherSimpleDto[];
  teacher_ids?: string[];
  teacher_names?: TeacherSimpleDto[];
  invitation_create_time?: string | null;
  invitation_ttl?: number | null;
  expire_time?: string | null;
}

export interface ListTeachingGroupAdminParams {
  course_id: string;
  name?: string;
  page?: number;
  pageSize?: number;
}

export interface ListTeachingGroupAdminResponseDto {
  list: TeachingGroupItemDto[];
  total: number;
}

export interface GetTeachingGroupAdminResponseDto extends TeachingGroupItemDto {}

export interface UpdateTeachingGroupAdminDto {
  teaching_group_id: string;
  name: string;
}

export interface UpdateTeachingGroupAdminResponseDto {
  id: string;
  updated: boolean;
}

export interface DeleteTeachingGroupAdminResponseDto {
  id: string;
  deleted: boolean;
}

export interface CourseOutlineLessonDto {
  lesson_id: string;
  title: string;
  description?: string;
  video_path?: string | null;
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
  video_path?: string | null;
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
