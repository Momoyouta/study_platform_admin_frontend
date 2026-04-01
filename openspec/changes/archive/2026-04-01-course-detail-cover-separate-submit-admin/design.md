## Context

当前课程详情基础信息编辑页在 `CourseDetail/index.jsx` 中使用单一 handleSave 方法，将所有表单字段（包括临时上传的 cover_img 路径）一次性提交至后端 `PUT /course/updateCourseAdmin`。TempImageUpload 组件的 onChange 回调直接将上传返回的临时路径写入表单，与其他字段一起进入 payload。这种耦合方式导致：

1. **临时文件过期风险**：上传成功但若用户未保存或保存失败，临时文件可能被自动清理
2. **错误恢复复杂性**：基础信息保存失败时，用户已上传的临时封面地址状态不清
3. **用户交互反馈不清晰**：用户无法区分"上传中"和"保存中"的状态差异

技术约束包括：
- 前端框架已选定为 React 19 + Ant Design，TempImageUpload 复用现有组件，不更换
- 暂无表单自动上传中间态管理机制（如 draft 存储），依赖用户显式保存
- 后端接口约定通过 Body 传递 `temp_path` 为临时路径时自动转正为正式路径

## Goals / Non-Goals

**Goals:**

- 前端上传成功后立即调用 `updateCourseCoverAdmin` 接口，单独保存封面，不再等待基础信息表单提交
- 将 cover_img 从基础信息提交 payload 中移除，使 `updateCourseAdmin` 仅包含 `name` 和 `status`
- 为上传和基础信息提交各设独立的 loading 状态，提升交互反馈清晰度
- 在 API 层和类型定义中新增 `updateCourseCoverAdmin` 方法和 DTO，保持代码组织一致

**Non-Goals:**

- 不实现封面的撤销/回滚，已保存的变更即为最终
- 不新增自动保存、草稿存储或本地缓存机制
- 不改变 TempImageUpload 组件本身的上传逻辑、校验或预览行为
- 不涉及其他详情标签页（章节、任务等）的改造

## Decisions

### 1) 上传后立即提交与延迟提交的选择

- **Decision**: 改为上传成功后不立即调用接口，而是在点击"保存修改"时统一提交封面与基础信息。先提交 updateCourseCoverAdmin（如果有新的 cover_img），再提交 updateCourseAdmin
- **Rationale**: 
  - 用户体验一致：一次点击保存解决所有修改，不需多次确认
  - 降低并发风险：两个请求有序执行，避免数据竞争
  - 临时文件过期问题由后端定时清理机制处理，不是前端阻塞因素
  - 简化前端状态管理，无需 savingCover 这样的拆分状态
- **Alternative considered**:
  - `上传后立即提交`：速度快但用户体验割裂，需管理多个 loading 状态

### 2) 分离提交函数的粒度

- **Decision**: 在 handleSave 中检查 cover_img 字段，如果有值则先调用 updateCourseCoverAdmin，再调用 updateCourseAdmin，保持单一保存事件入口
- **Rationale**: 
  - 流程清晰：用户一次操作（点击保存）完成所有更新
  - TempImageUpload 的 onChange 仅负责设置表单值，不发起请求，职责清晰
  - 同一个 saving loading 状态，避免状态管理复杂度
- **Alternative considered**:
  - `拆分两个处理函数`：handleSaveCover + handleSaveBasicInfo，会导致用户需点击两次或在 onChange 中自动触发请求（体验割裂）
  
### 3) Loading 状态管理

- **Decision**: 使用单一 loading 状态变量 `saving`，在 handleSave 中同时控制两个接口调用的进度显示
- **Rationale**: 
  - 用户体验统一，保存按钮 loading 清晰反馈整体保存进度
  - 状态管理简化，无需跟踪 cover 和 basic-info 的独立状态
  - 封面与基础信息顺序提交，降低并发风险
- **Alternative considered**:
  - `两个独立 loading 状态`：更细粒度但管理复杂，用户可能困惑

### 4) API 层新增方法的命名与位置

- **Decision**: 在 `src/http/api.ts` 中新增 `updateCourseCoverAdmin` 方法，在 `src/type/course.ts` 新增 `UpdateCourseCoverDto` 类型定义 `{ id: string; temp_path: string }`，保持与现有 API 封装的风格一致
- **Rationale**: 
  - 遵循现有代码组织规范，API 方法和类型定义各自独立管理
  - 方法命名与后端接口对齐（updateCourseCoverAdmin），便于联调
- **Alternative considered**:
  - `复用 UpdateCourseDto`：减少类型重复，但需为 cover_img 添加条件校验，不够清晰

## Risks / Trade-offs
若用户修改了 cover_img 但未点击保存就返回，临时文件会被后端定时清理。 → Mitigation: 前端可提示"有未保存的修改"（可选），后端定时清理不影响已保存关键数据。

- [Risk] 两个接口调用中，若第一个成功第二个失败，会出现封面已更新但基础信息未更新的状态。 → Mitigation: 提供明确的失败提示；基础信息更新失败时用户可在返回后再进入编辑重新提交。

- [Trade-off] 延迟提交 vs 立即提交：前者简化交互（一次保存）但临时文件失效由后端处理，后者立即确保但拆分用户操作。选择延迟是为了用户体验一致性
- [Trade-off] 上传立即保存 vs 批量保存：前者提升可靠性，后者减少请求次数。选择前者是为了降低临时文件失效风险和提升用户反馈感。

## Migration Plan

1. 后端实现新接口 `PUT /course/updateCourseCoverAdmin`，接收 `{ id, temp_path }` 并将临时路径转为正式路径
2. 前端 API 层添加 `updateCourseCoverAdmin` 方法和 `UpdateCourseCoverDto` 类型定义
3. 改造 CourseDetail 组件：拆分 handleSave，添加 handleSaveCover，修改 TempImageUpload 的 onChange 回调
4. 分离 loading 状态管理，调整表单提交按钮和上传组件的禁用逻辑
5. 手工验证端到端流程：上传封面、修改基础信息、分别提交、失败重试等
6. 执行构建与回归测试

回滚策略：若 updateCourseCoverAdmin 接口存在问题，可快速回滚前端改动至原耦合提交方式，后端移除新接口或隐藏在旧接口内部兼容处理。

## Open Questions & Decisions

**已澄清：**

- ✓ **TTL 参数**：不需要在上传请求中传递 TTL，后端已通过定时任务在凌晨清除 temp 目录下所有过期文件。
- ✓ **临时文件垃圾处理**：用户点击返回未保存时，临时文件由后端定时清理机制自动清除，前端无需额外操作。

**结论**：前端实现可不涉及临时文件生命周期管理，专注于上传与保存的交互流程即可。
