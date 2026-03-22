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
        path: '/school-manage/school-list',
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
            },
            {
                key: 'role-manage',
                label: '角色管理',
                path: '/user-manage/role-manage',
            },
        ],
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
