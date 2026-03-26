# Functional Requirements Document — Dude Course

## 1. Document Purpose

This document defines the functional requirements for Dude Course. Its purpose is to describe the behaviors and capabilities the system must provide in order to support the expected user experience and business goals.

These requirements focus on what the system must do, not how it will be technically implemented.

---

## 2. Product Context

Dude Course is an online learning portal where users can register, browse curated courses built from free YouTube videos, track their progress, and receive a certificate after completing a course.

The platform includes two main user groups:

- Learners, who consume courses and track their progress
- Administrators, who manage courses and lessons

---

## 3. Functional Scope

The functional requirements in this document cover the core platform capabilities for the initial version of the product, including:

- Authentication and access control
- Course discovery
- Course consumption
- Progress tracking
- Certificate issuance
- User dashboard
- Administrative course management

---

## 4. User Roles

## 4.1 Learner
A learner is a registered user who accesses courses, watches lessons, tracks progress, and earns certificates.

## 4.2 Administrator
An administrator is a privileged user who can manage courses, lessons, and course publication status.

---

## 5. Functional Requirements

## 5.1 Authentication and Account Management

### FR-001 — User Registration
The system must allow a new user to create an account by providing the required registration information.

### FR-002 — User Login
The system must allow a registered user to authenticate using valid credentials.

### FR-003 — User Logout
The system must allow an authenticated user to log out of the platform.

### FR-004 — Session Persistence
The system must maintain the authenticated session for a logged-in user until logout, expiration, or invalidation.

### FR-005 — Invalid Login Handling
The system must inform the user when login credentials are invalid.

### FR-006 — Protected User Access
The system must restrict learner-specific features, such as progress tracking and certificate access, to authenticated users only.

### FR-007 — Protected Admin Access
The system must restrict administrative features to users with administrator privileges.

### FR-008 — Basic Profile Access
The system must allow an authenticated user to view their basic profile information.

---

## 5.2 Course Discovery

### FR-009 — Homepage Course Display
The system must display a set of featured or highlighted courses on the homepage.

### FR-010 — Course Catalog Access
The system must provide a course catalog page listing the available published courses.

### FR-011 — Course Summary Display
The system must display summary information for each course in the catalog, including at least title, thumbnail, and brief description.

### FR-012 — Course Detail Access
The system must allow users to open a course detail page.

### FR-013 — Course Detail Information
The course detail page must display the course title, description, thumbnail, lesson list, and any other relevant metadata defined for the course.

### FR-014 — Published Course Visibility
The system must display only published courses to learners in public-facing areas of the platform.

---

## 5.3 Course Consumption

### FR-015 — Lesson Listing
The system must display the lessons belonging to a course in their defined order.

### FR-016 — Lesson Detail Access
The system must allow users to open an individual lesson view from a course.

### FR-017 — Embedded Video Display
The system must display the lesson’s YouTube video using an embedded player or equivalent viewing mechanism.

### FR-018 — Lesson Metadata Display
The system must display lesson metadata such as title and description.

### FR-019 — Lesson Navigation
The system must allow users to navigate between lessons within the same course.

### FR-020 — Ordered Course Flow
The system must preserve the configured lesson order within each course.

---

## 5.4 Progress Tracking

### FR-021 — Mark Lesson as Completed
The system must allow an authenticated learner to mark a lesson as completed.

### FR-022 — Persist Lesson Completion
The system must store lesson completion status per learner.

### FR-023 — Course Progress Calculation
The system must calculate course progress based on the learner’s completed lessons.

### FR-024 — Progress Display in Course Context
The system must display course progress to the learner while they are viewing a course.

### FR-025 — Progress Display in Dashboard
The system must display progress information for each started course in the learner dashboard.

### FR-026 — Completion Status Update
The system must update the course completion status when all required lessons have been completed.

### FR-027 — Per-User Progress Isolation
The system must ensure that one learner’s progress does not affect another learner’s progress.

---

## 5.5 Certificate Issuance

### FR-028 — Certificate Eligibility Validation
The system must verify whether a learner satisfies the course completion rules before allowing certificate generation.

### FR-029 — Certificate Generation
The system must generate a certificate for a learner who has completed a course.

### FR-030 — Certificate Content
The generated certificate must include at least the learner name, course name, and completion date.

### FR-031 — Certificate Access
The system must allow the learner to view and/or download an earned certificate.

### FR-032 — Certificate Restriction
The system must prevent certificate generation for learners who have not completed the required lessons.

### FR-033 — Certificate Association
The system must associate each generated certificate with the corresponding learner and course.

---

## 5.6 Learner Dashboard

### FR-034 — Dashboard Access
The system must provide an authenticated learner with access to a personal dashboard.

### FR-035 — Started Courses List
The dashboard must display the courses the learner has started.

### FR-036 — Completed Courses List
The dashboard must display the courses the learner has completed.

### FR-037 — Progress Overview
The dashboard must display progress information for each relevant course.

### FR-038 — Certificate Listing
The dashboard must provide access to certificates earned by the learner.

---

## 5.7 Administration — Course Management

### FR-039 — Admin Course Creation
The system must allow an administrator to create a course.

### FR-040 — Admin Course Editing
The system must allow an administrator to edit existing course information.

### FR-041 — Admin Course Publishing
The system must allow an administrator to publish a course.

### FR-042 — Admin Course Unpublishing
The system must allow an administrator to unpublish a course.

### FR-043 — Admin Course Deletion
The system must allow an administrator to remove a course, subject to defined business and data rules.

### FR-044 — Course Metadata Management
The system must allow an administrator to manage core course metadata, such as title, description, thumbnail, and category if applicable.

---

## 5.8 Administration — Lesson Management

### FR-045 — Admin Lesson Creation
The system must allow an administrator to create a lesson within a course.

### FR-046 — Admin Lesson Editing
The system must allow an administrator to edit lesson information.

### FR-047 — Admin Lesson Removal
The system must allow an administrator to remove a lesson from a course.

### FR-048 — YouTube URL Assignment
The system must allow an administrator to associate a YouTube video URL with a lesson.

### FR-049 — Lesson Ordering
The system must allow an administrator to define and update the order of lessons within a course.

### FR-050 — Lesson Metadata Management
The system must allow an administrator to manage lesson title, description, and other defined lesson properties.

---

## 5.9 Access Control and Visibility Rules

### FR-051 — Public Access to Non-Protected Pages
The system must allow non-authenticated users to access public-facing pages such as the homepage and course catalog, unless otherwise defined.

### FR-052 — Restricted Access to Protected Features
The system must require authentication before allowing users to perform protected actions such as marking lessons complete or accessing personal certificates.

### FR-053 — Admin-Only Management Features
The system must make course and lesson management features available only to administrators.

---

## 5.10 Basic Platform Behaviors

### FR-054 — Data Persistence
The system must persist users, courses, lessons, progress, and certificates in a durable data store.

### FR-055 — Publication-State Awareness
The system must distinguish between draft/unpublished and published course states, if draft support is implemented.

### FR-056 — Error Feedback
The system must provide users with understandable feedback when a relevant action cannot be completed successfully.

### FR-057 — Consistent Course Availability Rules
The system must ensure that only courses meeting publication requirements are visible to learners.

---

## 6. Functional Requirements by User Journey

## 6.1 Learner Journey
The system must support the following learner journey:

1. Register or log in
2. Browse available courses
3. Open a course detail page
4. Access lessons in sequence
5. Watch embedded YouTube videos
6. Mark lessons as completed
7. Track progress throughout the course
8. Complete all required lessons
9. Generate and access a certificate

## 6.2 Administrator Journey
The system must support the following administrator journey:

1. Log in as administrator
2. Create or edit a course
3. Add lessons to the course
4. Associate YouTube videos to lessons
5. Order the lessons correctly
6. Publish the course
7. Update or unpublish the course when necessary

---

## 7. Assumptions Related to Functional Requirements

The following assumptions apply to the initial version of the platform:

- Lesson completion is manually marked by the learner
- A course is considered complete when all required lessons are marked as completed
- Course content is curated manually by administrators
- Courses are primarily video-based in the first version
- The initial release does not require advanced learning validation such as quizzes or watch-time enforcement

---

## 8. Dependencies Related to Functional Scope

The functional behavior of the platform depends on the following conditions:

- YouTube videos remain accessible and embeddable
- Administrators provide valid and properly curated course data
- Authentication and authorization mechanisms work reliably
- The certificate generation mechanism is available when completion rules are met

---

## 9. Exclusions from This Document

This document does not define:

- Technical architecture decisions
- Database schema details
- API design details
- UI design specifications
- Performance, scalability, and security standards in depth
- Future features outside the initial project scope

Those topics should be covered in dedicated documents.

---

## 10. Summary

The functional requirements for Dude Course define the core behavior needed to deliver a structured learning platform based on curated YouTube videos.

The platform must support user registration, course browsing, lesson consumption, progress tracking, certificate generation, learner dashboards, and administrative content management. These requirements establish the essential capabilities required for the initial version of the product and provide a clear foundation for design, development, and testing.
