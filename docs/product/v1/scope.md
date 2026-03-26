# Project Scope Document — Dude Course

## 1. Document Purpose

This document defines the project scope for Dude Course. Its purpose is to clearly establish what the project will include, what it will not include, and which boundaries should guide product, design, and engineering decisions during the initial phases of development.

A well-defined scope helps avoid misunderstandings, reduces unnecessary complexity, and keeps the team focused on delivering the most valuable outcomes first.

---

## 2. Project Overview

Dude Course is an online learning portal where users can register, browse curated courses built from free YouTube videos, track their learning progress, and receive a certificate after completing a course.

The platform’s main differentiator is that it turns freely available YouTube educational content into structured and guided learning experiences.

---

## 3. Scope Objective

The objective of this scope document is to define the boundaries of the first version of the project, ensuring that the platform delivers its core value without expanding into unnecessary features too early.

The initial scope should prioritize:
- Structured learning from curated YouTube content
- User registration and access control
- Progress tracking
- Certificate generation
- Basic course administration

---

## 4. In-Scope Features

The following items are included in the scope of the initial version of Dude Course.

### 4.1 User Account Management
- User registration
- User login
- User logout
- Basic user profile information
- Password protection and secure authentication flow

### 4.2 Course Discovery
- Homepage with featured or highlighted courses
- Course catalog/listing page
- Course detail page
- Course title, description, thumbnail, and lesson list

### 4.3 Course Consumption
- Lesson pages with embedded YouTube videos
- Lesson title and description
- Ordered lesson navigation within a course
- Clear course structure for learners

### 4.4 Learning Progress
- Manual lesson completion marking
- Progress tracking per lesson
- Progress tracking per course
- Completion percentage display

### 4.5 Certificate Issuance
- Course completion validation based on defined completion rules
- Certificate generation for completed courses
- Certificate viewing and/or downloading

### 4.6 User Dashboard
- List of started courses
- List of completed courses
- Progress overview by course
- Access to earned certificates

### 4.7 Admin Capabilities
- Admin authentication
- Create, edit, publish, and unpublish courses
- Create, edit, remove, and reorder lessons
- Assign YouTube URLs to lessons
- Manage basic course metadata

### 4.8 Basic Platform Infrastructure
- Front-end application
- Back-end application or services
- Database for users, courses, progress, and certificates
- Deployment to a production-ready environment
- Basic logging and error monitoring

---

## 5. Out-of-Scope Features

The following items are explicitly out of scope for the initial phase of the project.

### 5.1 Content and Media
- Native video hosting
- Uploading videos directly to the platform
- Non-video lesson formats such as PDFs, slides, or interactive labs

### 5.2 Monetization
- Paid subscriptions
- Payment processing
- Premium plans
- Marketplace features

### 5.3 Community and Social Features
- Comments on lessons or courses
- Forums or discussion boards
- User-generated content
- Social sharing features
- Peer interaction features

### 5.4 Advanced Learning Features
- Quizzes and exams
- Assignments
- Automatic watch-time based completion tracking
- Learning paths with prerequisites
- Gamification features such as badges, streaks, levels, or points
- AI-based recommendations

### 5.5 Platform Expansion
- Native mobile apps
- Multi-language support
- Multi-tenant architecture
- Public instructor portal
- White-label capabilities
- Enterprise learning features

### 5.6 Advanced Operations
- Advanced analytics dashboards
- Automated course quality scoring
- Deep personalization
- External credential validation systems
- Complex integrations with third-party LMS platforms

---

## 6. Scope Boundaries

The project must remain focused on its core promise: allowing users to learn through curated YouTube-based courses in a structured environment.

To maintain this focus, the following boundaries apply:

- The platform is not intended to replace YouTube as a hosting solution
- The platform is not intended to be a full-featured LMS in its first version
- The initial version should favor simplicity over completeness
- Administrative processes may be partially manual in the first phase
- Only features directly related to the core user journey should be prioritized

---

## 7. Primary User Flow in Scope

The main flow covered by this project scope is:

1. A user visits the platform
2. The user registers or logs in
3. The user browses available courses
4. The user opens a course and views lessons
5. The user watches embedded YouTube videos
6. The user marks lessons as completed
7. The system updates progress
8. The user completes the course
9. The user generates and accesses a certificate

This is the primary flow that the scoped solution must support end to end.

---

## 8. Core Entities in Scope

The initial project should support the following main entities:

- User
- Admin
- Course
- Lesson
- Enrollment or course participation record
- Lesson progress record
- Certificate

These entities are sufficient to support the MVP and the first operational version of the platform.

---

## 9. Business Rules in Scope

The initial scope assumes the following business rules:

- A user must be authenticated to track progress and obtain certificates
- A course is composed of ordered lessons
- A lesson is associated with a YouTube video URL
- A user completes a course when all required lessons are marked as completed
- A certificate can only be issued after course completion
- Admin users are responsible for managing course content in the initial phase

Additional rules may be documented separately in a dedicated Business Rules document.

---

## 10. Technical Scope

The initial technical scope includes the minimum required technical foundation to support the product.

### Included
- Responsive web application
- Authentication and authorization
- Persistent database storage
- API layer or equivalent communication mechanism
- Admin management functionality
- Certificate generation capability
- Deployment pipeline or repeatable deployment process
- Basic monitoring and logging

### Excluded
- Microservices architecture unless clearly necessary
- Real-time features
- Complex event-driven workflows
- Advanced search infrastructure
- Machine learning or AI-based platform logic
- High-complexity infrastructure intended only for future scale

---

## 11. Content Scope

The content scope for the initial phase should remain intentionally limited.

### Included
- A small curated catalog of initial courses
- YouTube-based lessons selected manually
- Course metadata such as title, description, category, and thumbnail

### Excluded
- Large-scale automated content ingestion
- Open content submission by external instructors
- Community-driven course creation
- Bulk migration from external learning systems

A smaller content catalog is preferred in the beginning to ensure quality and reduce operational complexity.

---

## 12. Operational Scope

The project should assume a simple operational model in its first phase.

### Included
- Manual course creation by admins
- Manual review of lesson structure and video links
- Manual quality checks for course content
- Basic support for users when needed

### Excluded
- Dedicated support workflows with SLAs
- Automated broken-link scanning at large scale
- Large editorial teams or advanced moderation structures

---

## 13. Constraints

The following constraints shape the scope of the project:

- Limited time and budget for the first release
- Need to validate the business idea quickly
- Dependence on third-party YouTube content
- Need to avoid overengineering
- Initial operational simplicity is preferred over automation-heavy solutions

---

## 14. Assumptions

The project scope is based on the following assumptions:

- Users will find value in structured free courses
- Manual lesson completion is acceptable in the first phase
- Admins can initially manage content manually
- A web-first approach is sufficient for validation
- A smaller set of curated courses is enough to test demand

---

## 15. Risks Related to Scope

The following risks should be monitored because they affect the defined scope:

- Scope creep caused by adding too many features too early
- Reduced perceived value if the platform feels too similar to directly using YouTube
- User dissatisfaction if certificate rules are too weak
- Broken or removed YouTube videos affecting course continuity
- Operational bottlenecks if content management becomes difficult too early

---

## 16. Scope Prioritization

If prioritization is needed, the following order should guide delivery:

### Highest Priority
- Authentication
- Course catalog
- Course detail and lesson viewing
- Progress tracking
- Certificate generation

### Medium Priority
- User dashboard
- Admin course management
- Basic monitoring and error handling

### Lower Priority
- Extra profile features
- Improved filtering and discovery features
- Non-essential interface refinements

---

## 17. Items Deferred to Future Phases

The following items may be considered after the first version proves value:

- Quizzes and assessments
- Course reviews and ratings
- Gamification
- Advanced analytics
- Search and recommendation systems
- Community features
- Mobile applications
- Premium offerings
- Partner or instructor portals
- Multi-language support
- Corporate training features

---

## 18. Scope Acceptance Criteria

The initial project scope can be considered fulfilled when:

- Users can register and log in successfully
- Users can browse and access courses
- Users can watch lesson videos within the platform
- Users can mark lessons as completed
- The platform tracks progress correctly
- Users can receive certificates after completing courses
- Admins can manage courses and lessons without developer intervention for routine content updates

---

## 19. Summary

The scope of Dude Course is centered on delivering a simple but complete learning experience built on curated YouTube content. The initial version includes only the capabilities necessary to validate the product idea and provide clear value to learners.

By limiting the project to authentication, course access, progress tracking, certificate generation, and basic administration, the team can stay focused, reduce risk, and build a solid foundation for future growth.
