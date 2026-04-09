import { lazy } from 'react';

const routes = [
    {
        path: '/',
        component: lazy(() => import('../pages/Home/index.jsx')),
        children: [
            {
                index: true,
                component: lazy(() => import('../pages/Dashboard/index.jsx')),
            },
            {
                path: 'dashboard',
                component: lazy(() => import('../pages/Dashboard/index.jsx')),
            },
            {
                path: 'user-manage/user-list',
                component: lazy(() => import('../pages/UserManage/UserList/index.jsx')),
            },
            {
                path: 'user-manage/platform-admin-list',
                component: lazy(() => import('../pages/UserManage/PlatformAdminList/index.jsx')),
            },
            {
                path: 'course-manage/course-list',
                component: lazy(() => import('../pages/CourseManage/CourseList/index.jsx')),
            },
            {
                path: 'course-manage/category-manage',
                component: lazy(() => import('../pages/CourseManage/CategoryManage/index.jsx')),
            },
            {
                path: 'content-manage',
                component: lazy(() => import('../pages/ContentManage/index.jsx')),
            },
            {
                path: 'file-manage',
                component: lazy(() => import('../pages/FileManage/index.jsx')),
            },
            {
                path: 'system-settings',
                component: lazy(() => import('../pages/SystemSettings/index.jsx')),
            },
            {
                path: 'school-manage/school-list',
                component: lazy(() => import('../pages/SchoolManage/SchoolList/index.jsx')),
            },
            {
                path: 'school-manage/college-manage',
                component: lazy(() => import('../pages/SchoolManage/CollegeManage/index.jsx')),
            },
            {
                path: 'school-manage/school-approval',
                component: lazy(() => import('../pages/SchoolManage/SchoolApproval/index.jsx')),
            },
            {
                path: 'school-manage/teacher-list',
                component: lazy(() => import('../pages/SchoolManage/TeacherList/index.jsx')),
            },
            {
                path: 'school-manage/student-list',
                component: lazy(() => import('../pages/SchoolManage/StudentList/index.jsx')),
            },
            {
                path: 'school-manage/school-admin-list',
                component: lazy(() => import('../pages/SchoolManage/SchoolAdminList/index.jsx')),
            },
            {
                path: 'school-manage/invite-code-manage',
                component: lazy(() => import('../pages/SchoolManage/InviteCodeManage/index.jsx')),
            },
            {
                path: 'school-manage/school-info',
                component: lazy(() => import('../pages/SchoolManage/SchoolInfo/index.jsx')),
            },
            {
                path: 'courseDetail',
                component: lazy(() => import('../pages/CourseManage/CourseDetail/index.jsx')),
            },
        ],
    },
    {
        path: '/login',
        component: lazy(() => import('../pages/Login/index.jsx')),
    },
];

export default routes;
