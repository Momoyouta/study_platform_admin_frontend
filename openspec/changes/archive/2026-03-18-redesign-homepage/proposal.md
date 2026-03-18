## Why

当前 HomePage 仍为 Vite + React 脚手架默认模板，不具备后台管理系统应有的标准布局。作为"在线学习平台后台管理系统"，需要一个专业的管理后台界面：左侧固定侧边栏菜单 + 顶部导航栏 + 右侧内容区域，以便后续各功能模块能够通过菜单导航正确渲染。

## Non-goals

- 不涉及后端 API 的实现或修改
- 不涉及登录页面 (Login) 的改造
- 不涉及具体业务子页面的开发（只搭建布局框架和示例占位页面）
- 不涉及权限控制或动态菜单功能

## What Changes

- **改造 HomePage 布局**：将现有的 Vite 默认模板页面替换为 Ant Design `Layout` 布局组件，实现左侧 `Sider` + 顶部 `Header` + 右侧 `Content` 的经典后台管理布局
- **左侧侧边栏菜单**：使用 Ant Design `Menu` 组件，支持最多 2 级菜单（SubMenu），菜单顶部展示系统名称"在线学习平台 后台管理系统"，菜单下方有搜索框
- **顶部导航栏**：右上角放置 Profile 头像图标，鼠标 hover 时通过 Ant Design `Popover` 组件展示气泡弹层（包含用户信息和退出登录按钮）
- **路由嵌套**：改造路由结构，使 HomePage 作为布局容器，菜单项对应的子页面通过 `<Outlet />` 在 Content 区域渲染
- **创建示例子页面**：创建若干占位子页面以演示菜单导航效果

## Capabilities

### New Capabilities
- `admin-layout`: 后台管理系统标准布局组件（Sider + Header + Content），使用 Ant Design Layout 实现
- `sidebar-menu`: 左侧侧边栏菜单，支持最多 2 级菜单导航，集成搜索框和系统标题
- `topbar-profile`: 顶部导航栏右上角 Profile 图标及 hover 气泡弹层

### Modified Capabilities
_(无已有 capability 需要修改)_

## Impact

- **src/pages/Home/index.jsx**：完全重写为布局容器组件
- **src/router/route.jsx**：改造路由配置，增加嵌套子路由
- **src/router/index.jsx**：调整路由结构以支持 HomePage 作为布局容器
- **src/components/**：新增 Sidebar、TopBar 等布局组件
- **src/pages/**：新增若干占位子页面
- **依赖**：使用现有 Ant Design (antd 6.x) 和 React Router DOM 7，无需新增依赖
