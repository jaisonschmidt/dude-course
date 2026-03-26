# MVP Definition Document — Dude Course

## 1. Document Purpose

This document defines the Minimum Viable Product (MVP) for Dude Course. Its purpose is to establish the smallest possible version of the platform that can deliver real value to users, validate the core business idea, and provide learning opportunities from real usage.

The MVP should focus on solving the primary user problem with a simple, functional, and testable product.

---

## 2. Product Context

Dude Course is an online learning portal that allows users to register, access curated courses built from free YouTube videos, track their progress, and receive a certificate after completing a course.

The core idea of the product is to transform freely available YouTube content into structured online learning experiences.

---

## 3. MVP Objective

The objective of the MVP is to validate whether users see value in a platform that:

- Organizes free YouTube educational content into courses
- Provides a simple and structured learning experience
- Tracks course progress
- Issues certificates after completion

The MVP is not intended to be a complete learning platform. It is intended to test the essential concept with the minimum required investment.

---

## 4. Main Hypotheses to Validate

The MVP should help validate the following hypotheses:

1. Users are interested in structured courses based on YouTube videos.
2. Curated content is more valuable than searching for videos independently.
3. Users are willing to create an account to track progress.
4. Users are motivated by course completion and certificate issuance.
5. A simple platform experience can generate engagement even without advanced features.

---

## 5. MVP Scope

### 5.1 In Scope

The MVP should include only the features necessary to deliver the core learning experience.

#### User Access
- User registration
- User login
- Basic authentication flow
- User logout

#### Course Discovery
- Homepage with featured courses
- Course catalog/listing page
- Course detail page

#### Course Consumption
- Lessons organized within a course
- Embedded YouTube videos for lessons
- Lesson navigation
- Basic lesson information such as title and description

#### Learning Progress
- Mark lesson as completed
- Track course progress by completed lessons
- Show course completion percentage

#### Certificate Flow
- Detect when a course is completed
- Allow certificate generation for completed courses
- Provide certificate download or viewing option

#### Basic User Area
- Dashboard with enrolled or started courses
- Progress overview for each course
- Completed courses list

#### Administration
- Admin login
- Create, edit, and publish courses
- Create, edit, and order lessons
- Associate YouTube links with lessons

---

### 5.2 Out of Scope

The following features should not be part of the MVP:

- Native video hosting
- Payment or subscription features
- Advanced search and filtering
- Course reviews and ratings
- Comments or discussion forums
- Community features
- Gamification such as badges, streaks, or points
- AI recommendations
- Mobile app
- Instructor self-service portal
- Multi-language support
- Advanced analytics dashboards
- External certificate validation
- Rich content types beyond video-based lessons
- Social login integrations unless needed for speed

---

## 6. Core User Flow in the MVP

The main user journey for the MVP should be:

1. User visits the platform
2. User creates an account or logs in
3. User browses the course catalog
4. User opens a course detail page
5. User starts watching lessons
6. User marks lessons as completed
7. User tracks course progress
8. User completes all required lessons
9. User generates and downloads a certificate

This flow represents the heart of the MVP and must work reliably.

---

## 7. MVP Functional Requirements

### 7.1 Authentication
- Users must be able to register with basic credentials
- Users must be able to log in and log out securely
- The platform must persist authenticated sessions appropriately

### 7.2 Course Management
- Admin users must be able to create courses
- Each course must include title, description, thumbnail, and lesson list
- Each lesson must support a YouTube video URL
- Lessons must have an explicit order within a course

### 7.3 Course Experience
- Users must be able to access course pages and view lesson content
- Lessons must be displayed in a clear sequence
- Users must be able to mark lessons as completed manually
- Progress must be updated accordingly

### 7.4 Progress Tracking
- The system must store completed lessons per user
- The platform must calculate course completion status
- Users must be able to view their progress in their dashboard

### 7.5 Certificate Issuance
- A certificate must only be available after the completion criteria are met
- The certificate must contain at least the user name, course name, and completion date
- Users must be able to download or view the certificate

---

## 8. MVP Non-Functional Requirements

The MVP should also meet a basic set of quality expectations.

### Performance
- Main pages should load in a reasonable time
- Video embedding should not significantly degrade the user experience

### Security
- Passwords must be stored securely
- Authenticated routes must be protected
- Admin access must be restricted

### Usability
- The platform should be simple and intuitive
- The learning flow should require minimal explanation

### Maintainability
- The codebase should be organized for future growth
- Course and lesson management should be easy to maintain

### Availability
- The MVP should be deployable in a stable environment suitable for early users

---

## 9. Completion Rules for the MVP

A course should be considered completed when:

- The user has marked all required lessons as completed

For the MVP, this rule can remain simple. More advanced validation, such as minimum watch time or quizzes, can be introduced later if needed.

---

## 10. Recommended MVP Course Structure

To keep the MVP manageable, the initial course catalog should be small and curated.

### Suggested Initial Catalog
- 3 to 10 courses
- Each course with a clear topic and audience
- Each course containing a reasonable number of lessons
- Focus on quality and clarity rather than quantity

This helps validate the product idea without operational overload.

---

## 11. Admin Workflow in the MVP

The initial admin workflow may be manual and lightweight.

### Admin Responsibilities
- Curate YouTube videos
- Create courses and lesson sequences
- Publish or unpublish courses
- Update lesson metadata when needed
- Monitor broken or unavailable video links

Operational simplicity is acceptable in the MVP phase.

---

## 12. Success Criteria for the MVP

The MVP should be considered successful if it demonstrates that users can and want to use the platform as intended.

### Product Success Signals
- Users can register and access courses without friction
- Users start and complete courses
- Users generate certificates
- Users return to continue learning
- Curated courses receive meaningful engagement

### Example MVP Metrics
- Number of registered users
- Number of users who start at least one course
- Course completion rate
- Number of certificates issued
- Percentage of returning users
- Average number of completed lessons per user

---

## 13. Risks in the MVP

The MVP should account for the following risks:

- Users may prefer watching videos directly on YouTube
- Manual progress tracking may reduce trust
- Course quality may vary depending on content curation
- Embedded videos may become unavailable
- Certificate value may be questioned if validation is too lightweight

These risks are acceptable at the MVP stage as long as they are monitored.

---

## 14. MVP Constraints

The MVP should respect the following constraints:

- Limited development time and budget
- Need for fast validation
- Low operational complexity
- Dependence on third-party YouTube content
- Need to avoid overengineering early decisions

---

## 15. Features for Later Phases

The following features are intentionally deferred to future iterations:

- Quizzes and assessments
- Automatic lesson completion tracking based on watch behavior
- Badges and gamification
- Course reviews
- Personalized recommendations
- Search and advanced filtering
- Instructor or partner portals
- Payment features
- Rich analytics dashboards
- Corporate learning features
- AI-powered course curation assistance

---

## 16. Summary

The Dude Course MVP should focus on one essential promise: giving users a structured way to learn from free YouTube content and receive a certificate after course completion.

To achieve this, the MVP should include only the minimum necessary capabilities: authentication, course catalog, lesson viewing, progress tracking, certificate generation, and a lightweight admin area.

This approach allows the project to validate the product idea quickly, learn from real users, and build a foundation for future growth.
