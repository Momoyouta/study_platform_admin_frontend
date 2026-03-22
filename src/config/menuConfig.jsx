import {
    DashboardOutlined,
    UserOutlined,
    BookOutlined,
    FileTextOutlined,
    SettingOutlined,
    BankOutlined,
} from '@ant-design/icons';

/**
 * 菜单配置
 * key: 菜单唯一标识（同时用作路由 path 的一部分）
 * label: 菜单显示文本
 * icon: 菜单图标（Ant Design Icon 组件）
 * path: 路由路径（叶子节点必须有）
 * children: 子菜单（最多一层，即整体最多 2 级）
 */
const menuConfig = [
    {
        key: 'dashboard',
        label: '仪表盘',
        icon: <DashboardOutlined />,
        path: '/dashboard',
    },
    {
        key: 'school-manage',
        label: '学校管理',
        icon: <BankOutlined />,
        children: [
            {
                key: 'school-list',
                label: '学校列表',
                path: '/school-manage/school-list',
                roles: ['root', 'admin']
            },
            {
                key: 'teacher-list',
                label: '教师管理',
                path: '/school-manage/teacher-list',
                roles: ['root', 'admin', 'school_root', 'school_admin']
            },
            {
                key: 'student-list',
                label: '学生管理',
                path: '/school-manage/student-list',
                roles: ['root', 'admin', 'school_root', 'school_admin']
            },
            {
                key: 'school-admin-list',
                label: '学校管理员管理',
                path: '/school-manage/school-admin-list',
                roles: ['root', 'admin', 'school_root', 'school_admin']
            },
            {
                key: 'school-info',
                label: '学校信息',
                path: '/school-manage/school-info',
                roles: ['school_root']
            }
        ],
    },
    {
        key: 'user-manage',
        label: '用户管理',
        icon: <UserOutlined />,
        children: [
            {
                key: 'user-list',
                label: '用户列表',
                path: '/user-manage/user-list',
                roles: ['root', 'admin']
            },
            {
                key: 'platform-admin-list',
                label: '平台管理员管理',
                path: '/user-manage/platform-admin-list',
                roles: ['root']
            }
        ]
    },
    {
        key: 'course-manage',
        label: '课程管理',
        icon: <BookOutlined />,
        children: [
            {
                key: 'course-list',
                label: '课程列表',
                path: '/course-manage/course-list',
            },
            {
                key: 'category-manage',
                label: '分类管理',
                path: '/course-manage/category-manage',
            },
        ],
    },
    {
        key: 'content-manage',
        label: '内容管理',
        icon: <FileTextOutlined />,
        path: '/content-manage',
    },
    {
        key: 'system-settings',
        label: '系统设置',
        icon: <SettingOutlined />,
        path: '/system-settings',
    },
];

export default menuConfig;
