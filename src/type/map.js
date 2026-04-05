export const RoleMap = {
    admin: '平台普通管理员',
    teacher: '教师',
    student: '学生',
    root: '平台超级管理员',
    school_admin: '学校平台管理员',
    school_root: '学校超级管理员'
}

export const RoleMapId = {
    admin: '1',
    teacher: '4',
    student: '3',
    root: '0',
    school_admin: '5',
    school_root: '6'
}

export const SchoolStatusMap = {
    0: { color: 'orange', text: '审核中' },
    1: { color: 'green', text: '启用' },
    2: { color: 'red', text: '禁用' },
};

export const SchoolApplicationStatusMap = {
    0: { color: 'orange', text: '待审核' },
    1: { color: 'green', text: '已通过' },
    2: { color: 'red', text: '已驳回' },
};

export const UploadScenarioMap = {
    TEMP_VIDEO: 'temp_video',
    TEMP_DOCUMENT: 'temp_document',
};