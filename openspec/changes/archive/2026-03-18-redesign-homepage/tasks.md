## 1. 基础配置与菜单数据

- [x] 1.1 创建菜单配置文件 `src/config/menuConfig.jsx`，定义菜单数据结构（key, label, icon, path, children），包含示例的一级和二级菜单项
- [x] 1.2 更新 `src/theme/variables.less`，添加侧边栏主题色（紫灰色）、Header 背景色等 CSS 变量

## 2. 布局组件开发

- [x] 2.1 创建 Sidebar 组件 `src/components/Sidebar/index.jsx`，使用 Ant Design `Layout.Sider` + `Menu` 实现侧边栏，包含系统标题、搜索框、最多 2 级菜单
- [x] 2.2 创建 TopBar 组件 `src/components/TopBar/index.jsx`，使用 Ant Design `Layout.Header` 实现顶部导航栏，右上角放置 Profile 图标 + `Popover` hover 气泡弹层（含用户信息和退出登录按钮）

## 3. HomePage 改造

- [x] 3.1 重写 `src/pages/Home/index.jsx`，使用 Ant Design `Layout` 组合 Sidebar + TopBar + Content（`<Outlet />`），实现标准后台管理布局
- [x] 3.2 创建 HomePage 对应的布局样式文件 `src/pages/Home/index.less`

## 4. 路由改造

- [x] 4.1 创建若干示例占位子页面（如 `src/pages/Dashboard/index.jsx` 等），用于演示菜单导航
- [x] 4.2 改造 `src/router/route.jsx`，将路由从扁平结构改为嵌套结构，HomePage 作为布局容器，菜单项对应子路由作为其 children
- [x] 4.3 更新 `src/router/index.jsx`，适配新的嵌套路由结构

## 5. 验证与调试

- [x] 5.1 启动开发服务器 (`npm run dev`)，验证整体布局渲染正确（Sider + Header + Content）
- [x] 5.2 验证菜单点击能正确导航，Content 区域渲染对应子页面
- [x] 5.3 验证 Profile 图标 hover 时 Popover 正确弹出
- [x] 5.4 验证退出登录功能正常（清除 token + 跳转到 /login）
