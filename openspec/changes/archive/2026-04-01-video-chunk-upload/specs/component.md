# Video Chunk Upload Component Spec

## Component Definition

- **Name**: `FileChunkUpload`
- **Path**: `src/components/FileChunkUpload/index.tsx`
- **Type**: Functional Component with Hooks

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `onChange` | `(path: string) => void` | 上传完成并成功后的回调 |
| `scenario` | `UploadScenario` | 业务场景 ('avatar' \| 'school_resource' \| 'course_homework') |
| `businessConfig` | `BusinessConfig` | 业务关联 ID ({ schoolId?, courseId?, homeworkId? }) |
| `buttonText` | `string` | 按钮文字，默认为 '上传视频' |
| `maxSizeMB` | `number` | 文件限制大小，默认 2048 (2GB) |
| `previewPath` | `string` | 初始回显的文件路径 |
| `disabled` | `boolean` | 是否禁用 |

## Logic States

1. **Calculating**: `calculatingHash: boolean`, `hashProgress: number`
2. **Uploading**: `uploading: boolean`, `uploadProgress: number`
3. **Merging**: `merging: boolean`
4. **Completed**: `done: boolean`

## API Integration

### `initChunkUpload`
- **Request**: `{ fileHash: string, fileName: string, fileSize: number, totalChunks: number }`
- **Response**: `{ uploadId: string, uploadedChunks: number[] }` (or final path if 秒传)

### `uploadChunk`
- **Request**: `Multipart/form-data`
  - `file`: Blob (chunk)
  - `uploadId`: string
  - `chunkIndex`: number
  - `fileHash`: string
  - `scenario`: string
  - `schoolId`, `courseId`, `homeworkId`: number (optional)

### `mergeChunks`
- **Request**: `{ uploadId: string, fileHash: string, fileName: string, scenario: string, ...IDs }`
- **Response**: `{ path: string }`

## UI Elements

- **Upload Area**: Antd `Upload` component wrapper.
- **Progress Display**:
  - `Progress` component during hashing and uploading.
  - Custom status labels: "计算特征值...", "正在上传 (X/N)...", "合并分片中...".
- **Error Handling**: `message.error` for API or IO errors.
