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
