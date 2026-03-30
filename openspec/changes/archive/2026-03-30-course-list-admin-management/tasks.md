## 1. 接口与类型准备

- [x] 1.1 在 src/env/http/api.ts 中新增或补齐课程管理接口方法：listCourseAdmin、createCourseAdmin、updateCourseAdmin，并统一请求参数命名为 school_id。
- [x] 1.2 在 src/type 下补充课程列表、创建课程、更新课程的类型定义，覆盖 status、teacher_names、chapter_count、total_lesson_count 等字段。
- [x] 1.3 在课程列表页面接入接口方法与类型，移除匿名请求对象，统一通过类型约束构造查询与提交参数。

## 2. 课程列表查询能力实现

- [x] 2.1 在 src/pages/CourseManage/CourseList/index.jsx 实现“搜索区 + 表格区”页面骨架与分页状态管理。
- [x] 2.2 实现查询表单字段 keyword、status、school_id，并接入分页查询触发逻辑。
- [x] 2.3 对平台超级管理员与平台管理员增加 school_id 必填门禁校验，未填写时提示并阻断请求。
- [x] 2.4 确保查询参数不包含 teacher_names、chapter_count、total_lesson_count 等非本期筛选项。

## 3. 创建课程与状态切换

- [x] 3.1 新增“创建课程”按钮与创建弹窗，表单至少包含 name（必填）、school_id、cover_img、description。
- [x] 3.2 完成 createCourseAdmin 提交逻辑，创建成功后关闭弹窗并刷新当前列表数据。
- [x] 3.3 在表格操作列实现课程发布状态切换，调用 updateCourseAdmin({ id, status }) 并在成功后更新列表。
- [x] 3.4 在操作列保留“编辑”入口，本期仅展示“功能建设中”提示或等效占位反馈。

## 4. 联调与回归验证

- [x] 4.1 按角色验证查询行为：平台角色未填 school_id 拦截、填写后可查，非平台角色按既有权限流程可查。
- [x] 4.2 验证创建流程：name 缺失校验、成功创建后列表刷新、失败时错误提示可见。
- [x] 4.3 验证状态切换：未发布→已发布、已发布→未发布两个方向均可成功并正确回显。
- [x] 4.4 验证编辑占位：点击编辑不会进入详情编辑流程，提示文案符合预期。
