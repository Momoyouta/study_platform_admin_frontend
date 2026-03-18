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
                path: 'user-manage/role-manage',
                component: lazy(() => import('../pages/UserManage/RoleManage/index.jsx')),
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
                path: 'system-settings',
                component: lazy(() => import('../pages/SystemSettings/index.jsx')),
            },
        ],
    },
    {
        path: '/login',
        component: lazy(() => import('../pages/Login/index.jsx')),
    },
];

export default routes;
