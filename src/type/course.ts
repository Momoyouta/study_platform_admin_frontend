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
