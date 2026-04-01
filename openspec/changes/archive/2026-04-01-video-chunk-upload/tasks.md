# Video Chunk Upload Implementation Tasks

- [x] 安装 `spark-md5` 依赖库
- [x] 在 `src/http/api.ts` 中定义分片上传相关接口及 DTO (Init, Upload, Progress, Merge)
- [x] 创建 `VideoChunkUpload` 组件核心逻辑 (Web Worker 增量 Hash + 分片并行上传)
    - [x] 实现文件切分逻辑 (Blob.slice)
    - [x] 实现增量 Hash 计算逻辑 (spark-md5 + FileReader + Web Worker)
    - [x] 实现分片上传并发控制 (顺序串行上传，利于进度追踪)
    - [x] 实现进度管理和状态展示 (hashing -> uploading -> merging -> done)
- [x] 在 `VideoChunkUpload` 中集成 Antd `Upload` UI
- [x] 在 `LessonEditorDrawer.jsx` 中替换原有的模拟上传逻辑
- [x] 修复 TypeScript 类型及环境声明问题 (env.d.ts)
