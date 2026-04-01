## ADDED Requirements

### Requirement: Course cover update MUST use dedicated endpoint with temp_path parameter
The system MUST call `PUT /course/updateCourseCoverAdmin` with `{ id, temp_path }` when the user saves basic info with a new cover image, distinct from other basic info submission.

#### Scenario: Save with new cover image
- **WHEN** the user uploads a new image, modifies name/status, and clicks save button
- **THEN** the system first sends `PUT /course/updateCourseCoverAdmin` with the course id and the returned temp path
- **AND** the system then sends `PUT /course/updateCourseAdmin` with name and status (without cover)
- **AND** both requests complete successfully (or fail with clear error message)

#### Scenario: Save without cover image change
- **WHEN** the user modifies name/status but does not upload a new cover, and clicks save
- **THEN** the system only calls `PUT /course/updateCourseAdmin` (cover endpoint is skipped)

### Requirement: Cover update failure MUST be reported separately from basic info failure
The system MUST handle cover update errors distinctly so users know which part of the save failed.

#### Scenario: Cover update fails
- **WHEN** `PUT /course/updateCourseCoverAdmin` returns an error while `PUT /course/updateCourseAdmin` succeeds
- **THEN** the system displays an error message indicating "failed to update cover" while basic info is saved
- **AND** the user can retry the entire save or return and re-edit
