import http from "./http.js";

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
export const createInvite = (data: any) => {
    return http.post('/admin/invite', data);
}

/**
 * 删除邀请码
 */
export const deleteInvite = (code: string) => {
    return http.delete(`/admin/invite/${code}`);
}

// ================= 额外补充 =================
export const getSchoolById = (id: number | string) => {
    return http.get(`/school/${id}`);
}
