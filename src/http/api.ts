import http from "./http.js";
import type { CreateInviteDto } from "@/type/invite";
import type {
    BindCourseMaterialDto,
    BindCourseMaterialResponseDto,
    BindTeachingGroupTeachersDto,
    CourseMaterialListParams,
    CourseMaterialListResponseDto,
    CourseListParams,
    CreateCourseInviteDto,
    CreateCourseDto,
    CreateTeachingGroupAdminDto,
    DeleteCourseMaterialDto,
    DeleteCourseMaterialResponseDto,
    CourseOutlineSource,
    ListTeachingGroupAdminParams,
    PublishCourseOutlineDto,
    QuickUpdateChapterTitleDto,
    QuickUpdateLessonDto,
    SaveCourseDraftDto,
    SchoolTeacherByNameParams,
    UpdateCourseMaterialDto,
    UpdateCourseMaterialResponseDto,
    UpdateTeachingGroupAdminDto,
    UpdateCourseDto,
    UpdateCourseCoverDto
} from "../type/course";
import type {
    DeleteFileChunkResponseDto,
    FileChunkAdminListResponseDto,
    FileChunkAdminQueryParams,
    InitChunkDto,
    MergeChunkDto,
    MoveFileChunkResponseDto,
    MoveFileChunkToSchoolDto,
    UpdateFileChunkFilenameDto,
    UpdateFileChunkFilenameResponseDto
} from "@/type/file";

export const login = (account: string, pwd: string) => {
    return http.post('/auth/admin/login', {
        account,
        pwd
    });
}

export const register = (data: any) => {
    return http.post('/auth/admin/register', data);
}

export const jwtAuth = (accessToken: string) => {
    return http.post('/auth/admin/jwtAuth', {
        accessToken
    });
}

/**
 * 分页获取学校列表
 */
export const getSchools = (params: any) => {
    return http.get('/school', { params });
}

/**
 * 更新学校信息 (包括修改基本信息、修改状态[启用/禁用/通过审核])
 */
export const updateSchool = (id: number | string, data: any) => {
    return http.put(`/school/${id}`, data);
}

/**
 * 拒绝审核并硬删除学校
 */
export const removeSchoolHard = (id: number | string) => {
    return http.delete(`/school/removeHard/${id}`);
}

/**
 * 学校申请
 */
export const applySchool = (data: {
    school_name: string;
    school_address: string;
    charge_name: string;
    charge_phone: string;
    evidence_img_url: string;
}) => {
    return http.post('/school/applySchool', data);
}

/**
 * 分页获取学校申请记录
 */
export const getSchoolApplications = (params: any) => {
    return http.get('/school/applications', { params });
}

/**
 * 审批学校申请
 */
export const reviewSchoolApplication = (
    id: number | string,
    data: {
        action: 'approve' | 'reject';
        review_remark?: string;
        reject_reason?: string;
    }
) => {
    return http.put(`/school/applications/${id}/review`, data);
}

/**
 * 上传图片（<5MB）
 */
export const uploadImageTemp = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return http.post('/file/upload/imageTemp', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}

// ================= 文件管理 (File) =================
/**
 * 初始化分片上传
 */
export const initChunkUpload = (data: InitChunkDto) => {
    return http.post('/file/chunk/init', data);
}

/**
 * 上传单个分片
 */
export const uploadChunk = (formData: FormData) => {
    return http.post('/file/chunk/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
}

/**
 * 查询分片上传进度
 */
export const getChunkProgress = (fileHash: string) => {
    return http.get(`/file/chunk/progress/${fileHash}`);
}

/**
 * 合并所有分片
 */
export const mergeChunks = (data: MergeChunkDto) => {
    return http.post('/file/chunk/merge', data);
}

export const queryFileChunkAdmin = (params: FileChunkAdminQueryParams) => {
    return http.get('/admin/fileChunk/query', { params }) as Promise<{
        code: number;
        msg: string;
        data: FileChunkAdminListResponseDto;
    }>;
}

export const updateFileChunkFilename = (data: UpdateFileChunkFilenameDto) => {
    return http.patch('/admin/fileChunk/updateFilename', data) as Promise<{
        code: number;
        msg: string;
        data: UpdateFileChunkFilenameResponseDto;
    }>;
}

export const deleteFileChunkAdmin = (id: string, force = false) => {
    return http.delete('/admin/fileChunk/delete', {
        params: {
            id,
            force,
        },
    }) as Promise<{
        code: number;
        msg: string;
        data: DeleteFileChunkResponseDto;
    }>;
}

export const moveFileChunkToSchool = (data: MoveFileChunkToSchoolDto) => {
    return http.post('/admin/fileChunk/moveToSchool', data) as Promise<{
        code: number;
        msg: string;
        data: MoveFileChunkResponseDto;
    }>;
}

// ================= 用户管理 (User) =================
export const getUserList = (params: any) => {
    return http.get('/user', { params });
}
export const updateUserStatus = (id: number | string, data: any) => {
    return http.put(`/user/${id}`, data);
}

// ================= 学生管理 (Student) =================
export const getStudentList = (params: any) => {
    return http.get('/student', { params });
}
export const updateStudent = (id: number | string, data: any) => {
    return http.put(`/student/${id}`, data);
}
export const deleteStudent = (id: number | string) => {
    return http.delete(`/student/${id}`);
}

// ================= 教师管理 (Teacher) =================
export const getTeacherList = (params: any) => {
    return http.get('/teacher', { params });
}
export const updateTeacher = (id: number | string, data: any) => {
    return http.put(`/teacher/${id}`, data);
}
export const deleteTeacher = (id: number | string) => {
    return http.delete(`/teacher/${id}`);
}

// ================= 学校管理员管理 (SchoolAdmin) =================
export const getSchoolAdminList = (params: any) => {
    return http.get('/school-admin', { params });
}
export const createSchoolAdmin = (data: any) => {
    return http.post('/school-admin', data);
}
export const updateSchoolAdmin = (id: number | string, data: any) => {
    return http.put(`/school-admin/${id}`, data);
}
export const deleteSchoolAdmin = (id: number | string) => {
    return http.delete(`/school-admin/${id}`);
}

// ================= 邀请码管理 (Invite) =================
/**
 * 分页获取邀请码列表
 */
export const getInviteList = (params: any) => {
    return http.get('/admin/invite', { params });
}

/**
 * 创建邀请码
 */
export const createInvite = (data: CreateInviteDto) => {
    return http.post('/admin/invite', data);
}

/**
 * 删除邀请码
 */
export const deleteInvite = (code: string) => {
    return http.delete(`/admin/invite/${code}`);
}

// ================= 课程管理 (Course) =================
export const listCourseAdmin = (params: CourseListParams) => {
    return http.get('/course/listCourseAdmin', { params });
}

export const createCourseAdmin = (data: CreateCourseDto) => {
    return http.post('/course/createCourseAdmin', data);
}

export const updateCourseAdmin = (data: UpdateCourseDto) => {
    return http.put('/course/updateCourseAdmin', data);
}

export const updateCourseCoverAdmin = (data: UpdateCourseCoverDto) => {
    return http.put('/course/updateCourseCoverAdmin', data);
}

export const getCourseBasicAdmin = (id: string | number) => {
    return http.get(`/course/getCourseBasicAdmin/${id}`);
}

export const querySchoolTeacherByNameAdmin = (params: SchoolTeacherByNameParams) => {
    return http.get('/course/querySchoolTeacherByNameAdmin', { params });
}

export const bindTeachingGroupTeachersAdmin = (data: BindTeachingGroupTeachersDto) => {
    return http.put('/course/bindTeachingGroupTeachersAdmin', data);
}

export const createCourseInviteAdmin = (data: CreateCourseInviteDto) => {
    return http.post('/admin/invite/createCourseInviteAdmin', data);
}

export const createTeachingGroupAdmin = (data: CreateTeachingGroupAdminDto) => {
    return http.post('/course/createTeachingGroupAdmin', data);
}

export const listTeachingGroupAdmin = (params: ListTeachingGroupAdminParams) => {
    return http.get('/course/listTeachingGroupAdmin', { params });
}

export const getTeachingGroupAdmin = (id: string) => {
    return http.get(`/course/getTeachingGroupAdmin/${id}`);
}

export const updateTeachingGroupAdmin = (data: UpdateTeachingGroupAdminDto) => {
    return http.put('/course/updateTeachingGroupAdmin', data);
}

export const deleteTeachingGroupAdmin = (id: string) => {
    return http.delete(`/course/deleteTeachingGroupAdmin/${id}`);
}

export const getCourseDescriptionAdmin = (id: string | number) => {
    return http.get(`/course/getCourseDescription/${id}`);
}

export const saveCourseDraftAdmin = (data: SaveCourseDraftDto) => {
    return http.post('/course/saveCourseDraftAdmin', data);
}

export const publishCourseOutlineAdmin = (data: PublishCourseOutlineDto) => {
    return http.post('/course/publishCourseOutlineAdmin', data);
}

export const getCourseLessonOutline = (id: string | number, source?: CourseOutlineSource) => {
    return http.get(`/course/getCourseLessonOutline/${id}`, source ? { params: { source } } : undefined);
}

export const queryLessonVideoLibraryAdmin = (params: {
    course_id: string;
    page?: number;
    pageSize?: number;
    filename?: string;
}) => {
    return http.get('/course/queryLessonVideoLibraryAdmin', { params });
}

export const updateChapterTitleQuickAdmin = (data: QuickUpdateChapterTitleDto) => {
    return http.put('/course/updateChapterTitleQuickAdmin', data);
}

export const updateLessonQuickAdmin = (data: QuickUpdateLessonDto) => {
    return http.put('/course/updateLessonQuickAdmin', data);
}

// ================= 课程资料管理 (Course Material) =================
export const bindCourseMaterial = (data: BindCourseMaterialDto) => {
    return http.post('/course/material/bind', data) as Promise<{
        code: number;
        msg: string;
        data: BindCourseMaterialResponseDto;
    }>;
}

export const listCourseMaterial = (params: CourseMaterialListParams) => {
    return http.get('/course/material/list', { params }) as Promise<{
        code: number;
        msg: string;
        data: CourseMaterialListResponseDto;
    }>;
}

export const updateCourseMaterial = (data: UpdateCourseMaterialDto) => {
    return http.post('/course/material/update', data) as Promise<{
        code: number;
        msg: string;
        data: UpdateCourseMaterialResponseDto;
    }>;
}

export const deleteCourseMaterial = (data: DeleteCourseMaterialDto) => {
    return http.post('/course/material/delete', data) as Promise<{
        code: number;
        msg: string;
        data: DeleteCourseMaterialResponseDto;
    }>;
}

// ================= 额外补充 =================
export const getSchoolById = (id: number | string) => {
    return http.get(`/school/${id}`);
}
