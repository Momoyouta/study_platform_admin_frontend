## Context

当前管理端已有课程列表与创建能力，但“编辑”入口未打通，导致课程详情维护依赖后台或临时脚本。目标是在不改动整体管理后台布局的前提下，新增课程详情页并先落地“基础信息”标签。技术约束包括：

- 继续沿用 React Router 现有路由组织方式，保持 TopBar 与 Sidebar 不卸载。
- 页面表单和交互统一使用 Ant Design。
- 后端仅允许更新 `name`、`cover_img`、`status` 三个字段。
- 封面上传必须复用现有 `TempImageUpload`，避免重复上传逻辑。

## Goals / Non-Goals

**Goals:**

- 从课程列表点击“编辑”可跳转到 `/courseDetail?courseId=` 页面。
- 课程详情页基础信息模块可加载并展示单课程完整基础信息。
- 用户可编辑并提交 `name`、`cover_img`、`status`，提交后刷新显示最新数据。
- 课程列表显示学校名，移除章节数和课时数列，保证字段与后端返回一致。

**Non-Goals:**

- 不实现“任务编辑/章节课时/作业管理/统计信息”标签内容，仅保留页签结构。
- 不新增课程删除相关交互。
- 不变更全局布局组件、权限体系、请求封装基础设施。

## Decisions

### 1) 路由采用 Query 参数承载课程 ID

- Decision: 使用固定路径 `/courseDetail`，通过 query 参数 `courseId` 标识课程。
- Rationale: 与需求明确一致，避免在当前路由树中新增动态 path segment 带来的改造范围扩大。
- Alternative considered:
  - `/courseDetail/:courseId`：语义清晰，但需同步调整若干跳转与潜在面包屑匹配规则，本次收益不高。

### 2) 详情页采用“读写分离字段模型”

- Decision: 查询结果完整展示；编辑表单仅绑定 `name`、`cover_img`、`status`，其余字段以只读描述项呈现。
- Rationale: 与接口约束一致，降低误改风险，便于前后端联调验收。
- Alternative considered:
  - 全字段放入表单并前端禁用不可编辑项：实现简单，但可维护性较差，容易在后续变更时误放开字段。

### 3) 封面上传复用 TempImageUpload

- Decision: 在详情页表单中接入 `TempImageUpload`，通过 `onChange` 回填 `cover_img`，通过 `previewPath` 显示当前封面。
- Rationale: 复用已验证上传流程，减少重复代码与上传行为差异。
- Alternative considered:
  - 页面内直接使用 `Upload` 自定义上传：灵活但会重复实现校验、状态管理与成功回填逻辑。

### 4) 列表页字段最小调整

- Decision: 列表移除 `chapter_count` 与 `total_lesson_count` 列，新增 `school_name` 展示列，其余行为保持不变。
- Rationale: 满足接口变更和展示要求，避免引入额外回归风险。

## Risks / Trade-offs

- [Risk] `courseId` 缺失或非法会导致详情页空白或请求失败。 → Mitigation: 页面初始化校验参数，缺失时提示并提供返回列表入口。
- [Risk] 上传成功但表单未提交可能造成“已上传未保存”的认知偏差。 → Mitigation: 在保存前提示“仅保存后生效”，并以当前表单值作为最终提交源。
- [Risk] 非平台管理员/平台管理员在不同学校上下文下查看编辑可能出现权限边界问题。 → Mitigation: 前端仅负责参数传递与展示，权限以后端返回为准并在失败时展示明确错误信息。

## Migration Plan

1. 新增详情页路由与页面文件，保留原布局容器。
2. 调整课程列表“编辑”行为与列结构。
3. 增加/对接课程详情查询 API 方法（若现有 API 文件未暴露）。
4. 联调更新接口，确认仅提交允许字段。
5. 执行构建与手工回归：列表查询、编辑跳转、详情加载、封面上传、保存成功与失败路径。

回滚策略：

- 若线上出现问题，可快速回滚到上一版本，恢复“编辑功能建设中”行为，不影响课程列表查询和创建功能。

## Open Questions

- 详情页内除“基础信息”外的标签是直接占位展示，还是隐藏未实现标签以避免误导？
- 保存成功后是否需要自动同步刷新列表缓存（若用户返回列表）还是仅依赖重新查询？
