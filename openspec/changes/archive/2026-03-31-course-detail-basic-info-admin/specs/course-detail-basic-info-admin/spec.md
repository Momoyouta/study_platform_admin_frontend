## ADDED Requirements

### Requirement: Course list edit action SHALL navigate to course detail route
The system SHALL navigate to `/courseDetail?courseId=<id>` when the user clicks the edit action in course list rows, and SHALL keep the existing admin top bar and sidebar visible.

#### Scenario: Navigate from list to detail
- **WHEN** the user clicks the edit action on a course row with id `C001`
- **THEN** the browser route becomes `/courseDetail?courseId=C001`
- **THEN** the page remains inside the existing admin layout (top bar and sidebar are not replaced)

### Requirement: Course detail basic info page SHALL load and display full course data
The system SHALL call `GET /course/getCourseBasicAdmin/{id}` using `courseId` from the route query and SHALL display all returned course basic fields, including but not limited to id, school_id, school_name, creator_id, creator_name, name, cover_img, status, create_time, update_time, and teacher_names.

#### Scenario: Load detail successfully
- **WHEN** the route contains a valid `courseId` and the detail API returns success
- **THEN** the page shows all returned course basic information in the basic info section

#### Scenario: Missing courseId in route query
- **WHEN** the route does not contain `courseId`
- **THEN** the page shows a clear validation message and SHALL NOT send the detail API request

### Requirement: Editable fields MUST be restricted to name cover image and status
The system MUST allow editing only `name`, `cover_img`, and `status`, and MUST keep all other course fields read-only in the UI.

#### Scenario: Save updates with allowed fields only
- **WHEN** the user modifies name, cover image, or status and submits the form
- **THEN** the system sends `PUT /course/updateCourseAdmin` with payload containing only `id` plus changed values among `name`, `cover_img`, and `status`

#### Scenario: Non-editable fields remain immutable
- **WHEN** the page renders fields such as school_name, creator_name, or create_time
- **THEN** these fields are displayed as read-only and are never submitted in update payload

### Requirement: Cover image upload MUST reuse TempImageUpload component
The system MUST use the existing `TempImageUpload` component for course cover updates and SHALL store the uploaded temp path into `cover_img` before form submission.

#### Scenario: Upload cover and save
- **WHEN** the user uploads a new image via `TempImageUpload`
- **THEN** the form `cover_img` value is updated with the returned temp path and can be submitted through update API

### Requirement: Course list columns SHALL match updated admin list response
The course list view SHALL display school name from `school_name`, and SHALL NOT display chapter count or total lesson count columns.

#### Scenario: Render updated columns
- **WHEN** list data is loaded from `GET /course/listCourseAdmin`
- **THEN** each row includes a school name column
- **THEN** chapter count and lesson count columns are absent from the table
