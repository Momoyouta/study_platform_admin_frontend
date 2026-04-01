## MODIFIED Requirements

### Requirement: Editable fields MUST be restricted to name, status, and optional cover_img
The system MUST allow editing `name`, `status`, and optionally `cover_img` in the basic info form, and MUST keep all other course fields read-only in the UI. When saving with a new cover image, both updateCourseCoverAdmin and updateCourseAdmin will be called (in that order).

#### Scenario: Save updates with cover image change
- **WHEN** the user uploads a new cover, modifies name or status, and submits the form
- **THEN** the system first sends `PUT /course/updateCourseCoverAdmin` with `{ id, temp_path }`
- **AND** then sends `PUT /course/updateCourseAdmin` with `{ id, name, status }` (cover_img NOT included)
- **AND** both succeed before displaying "save successful" message

#### Scenario: Save updates without cover change
- **WHEN** the user modifies only name or status (no cover upload) and submits
- **THEN** the system sends only `PUT /course/updateCourseAdmin` with `{ id, name, status }`
- **AND** cover endpoint is not called

#### Scenario: Non-editable fields remain immutable
- **WHEN** the page renders fields such as school_name, creator_name, create_time
- **THEN** these fields are displayed as read-only and are never submitted in any payload

### Requirement: Cover image uploads MUST use TempImageUpload with temp_path storage
The system MUST use the existing `TempImageUpload` component for course cover updates and SHALL store the uploaded temp path into the form `cover_img` field for later submission.

#### Scenario: Upload cover and store temp path
- **WHEN** the user uploads a new image via `TempImageUpload`
- **THEN** the form `cover_img` value is updated with the returned temp path
- **AND** the path is NOT submitted until the user clicks the main save button
