# Video Chunk Upload Component Design

## Overview

本设计旨在封装一个通用的 `VideoChunkUpload` 组件，支持大文件分片上传、断点续传和秒传。组件将基于 Ant Design 的 `Upload` 组件进行定制，利用 `spark-md5` 进行文件哈希计算。

## Component Architecture

### 核心逻辑
1. **文件选择**：用户选择视频文件。
2. **计算 Hash**：分块读取文件并计算 MD5 值。为了避免大文件计算引起页面卡顿，建议使用 `FileReader.readAsArrayBuffer` 配合 `spark-md5` 增量计算。
3. **InitUpload**：将文件通过 Web Worker 进行增量 Hash 计算（避免主线程卡顿），计算完成后拿着 `hash` 请求 `/file/chunk/init`。
   - 如果已存在：秒传成功。
   - 如果不存在：获取 `uploadId` 和已上传的分片索引列表。
4. **ChunkUpload**：并行或串行上传剩余分片。
   - 每个分片上传成功后更新进度。
5. **MergeUpload**：所有分片完成后，请求 `/file/chunk/merge`。
6. **完成**：回调 `onSuccess` 并返回最终的文件路径。

### 技术架构
- **Main Thread**: 负责 UI 展示、分片调度、API 调用。
- **Web Worker**: 负责读取文件内容并调用 `spark-md5` 计算指纹。

### 接口设计 (src/http/api.ts)
- `initChunkUpload(data: InitChunkDto)`
- `uploadChunk(formData: FormData)`
- `getChunkProgress(fileHash: string)`
- `mergeChunks(data: MergeChunkDto)`

### 组件 Props (`VideoChunkUploadProps`)
- `onChange: (path: string) => void`：上传完成后返回文件路径。
- `scenario: string`：业务场景（avatar, school_resource, course_homework）。
- `businessConfig: { schoolId?, courseId?, homeworkId? }`：关联的业务 ID。
- `accept?: string`：默认 `video/*`。
- `maxSize?: number`：最大文件限制，默认 2GB。

## Technical Decisions

- **分片大小**：固定 5MB，平衡请求数量和网络稳定性。
- **并发控制**：默认并发数 3，避免瞬间占用过多带宽导致其他请求超时。
- **Hash 计算优化**：使用 Web Worker 进行异步增量 Hash 计算。Worker 内部使用 `spark-md5`，计算过程会向主线程发送进度消息。
- **状态管理**：使用组件内部状态记录上传进度、已完成分片、当前阶段等。

## Risks & Trade-offs

- **浏览器兼容性**：需要支持 `Blob.slice` 和 `FileReader`。现代浏览器均支持。
- **计算性能**：计算大文件 Hash 耗时较长，UI 需要提供清晰的反馈（例如百分比或 Loading）。
- **合并超时**：对于超大文件，合并过程可能在后端耗时较久，前端需设置较长的超时时间或支持轮询合并状态。
