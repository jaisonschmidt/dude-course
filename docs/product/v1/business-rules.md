# Business Rules Document — Dude Course

## 1. Document Purpose

This document defines the business rules for Dude Course. Its purpose is to formalize the operational logic, constraints, and decision rules that govern how the platform behaves from a business perspective.

These rules ensure consistency across product behavior, user experience, administration, progress tracking, and certificate issuance.

---

## 2. Product Context

Dude Course is an online learning portal where learners can register, access curated courses built from free YouTube videos, track their learning progress, and receive certificates after course completion.

The platform is based on structured learning journeys created from publicly available video content, with administrators responsible for organizing and maintaining courses and lessons.

---

## 3. Scope of Business Rules

This document covers the business rules related to:

- User accounts and access
- Course visibility and publication
- Lesson organization
- Course participation
- Progress tracking
- Course completion
- Certificate issuance
- Administrative responsibilities
- Content management constraints

---

## 4. Business Entities

The rules in this document apply primarily to the following entities:

- Learner
- Administrator
- Course
- Lesson
- Enrollment or course participation record
- Lesson progress record
- Certificate

---

## 5. User Account Rules

### BR-001 — Account Required for Personalized Features
A user must have a registered account and be authenticated to access personalized features such as progress tracking, dashboard access, and certificate issuance.

### BR-002 — Public Browsing Allowed
Non-authenticated users may browse public areas of the platform, such as the homepage, course catalog, and course detail pages, unless otherwise restricted by product decisions.

### BR-003 — One Learner Profile per Account
Each account represents a single learner identity for the purpose of tracking progress and issuing certificates.

### BR-004 — Certificate Ownership
Certificates must be issued only to the learner account that completed the corresponding course.

---

## 6. Course Publication and Visibility Rules

### BR-005 — Only Published Courses Are Visible to Learners
A course must be in a published state to appear in learner-facing areas of the platform.

### BR-006 — Unpublished Courses Are Hidden from Learners
Courses that are in draft, unpublished, or otherwise inactive status must not be accessible through the public catalog or learner flows.

### BR-007 — Administrator Control of Publication
Only administrators may publish or unpublish courses.

### BR-008 — Course Metadata Must Exist Before Publication
A course should not be published unless the minimum required metadata is present, such as title, description, and lesson structure.

### BR-009 — Course Must Contain Lessons Before Publication
A course should contain at least one valid lesson before it can be published.

---

## 7. Lesson Rules

### BR-010 — Lessons Belong to a Course
Every lesson must be associated with exactly one course.

### BR-011 — Lessons Must Have a Defined Order
Each lesson within a course must have a defined sequence or order.

### BR-012 — Lesson Content Must Reference a Valid Video Source
A lesson must include a valid YouTube video reference in order to be considered a complete lesson for publication.

### BR-013 — Lesson Metadata Must Be Defined
Each lesson should contain minimum descriptive information such as title and, when applicable, a description.

### BR-014 — Lesson Order Determines Course Flow
Learners must see lessons in the order defined by the administrator, even if strict navigation restrictions are not enforced.

---

## 8. Course Participation Rules

### BR-015 — A Learner May Start Any Published Course
Any authenticated learner may start a published course unless future access restrictions are introduced.

### BR-016 — Course Participation Begins on First Meaningful Interaction
A learner is considered to have started a course when they perform the first meaningful tracked action, such as opening lessons or marking progress, according to implementation rules.

### BR-017 — Progress Is Personal
A learner’s progress is unique to that learner and must not be shared across accounts.

### BR-018 — A Learner May Participate in Multiple Courses
A learner may be enrolled in or participate in multiple courses simultaneously.

---

## 9. Progress Tracking Rules

### BR-019 — Progress Requires Authentication
Only authenticated learners may have progress recorded.

### BR-020 — Progress Is Recorded Per Lesson
Progress must be tracked at the lesson level for each learner.

### BR-021 — Lesson Completion Is Learner-Specific
Marking a lesson as completed affects only the learner who performed the action.

### BR-022 — Lesson Completion Counts Toward Course Progress
A completed lesson contributes to the learner’s progress in the associated course.

### BR-023 — Progress Percentage Is Based on Required Lessons
Course progress percentage must be calculated based on the number of required lessons completed relative to the total number of required lessons.

### BR-024 — Duplicate Completion Must Not Inflate Progress
A lesson cannot be counted multiple times for the same learner in a way that artificially increases progress.

### BR-025 — Progress Must Persist Across Sessions
Once a learner’s progress is recorded, it must remain associated with the learner account until explicitly changed by valid system behavior or administrative intervention.

### BR-026 — Course Progress Is Independent Across Courses
Completion of lessons in one course must not affect progress in any other course.

---

## 10. Course Completion Rules

### BR-027 — Course Completion Depends on Required Lessons
A learner completes a course only when all required lessons in that course are marked as completed.

### BR-028 — Completion Must Be Deterministic
The course completion rule must be applied consistently for all learners under the same course definition.

### BR-029 — Completion Status Must Reflect Current Course Rules
If course structure changes after a learner has made progress, the platform must apply a defined product policy to determine whether prior completion remains valid. For the initial version, course completion may be based on the course structure active at the moment of completion, unless future rules define otherwise.

### BR-030 — Completed Courses Must Be Identifiable
The platform must maintain a clear status indicating whether a course is completed by a learner.

---

## 11. Certificate Issuance Rules

### BR-031 — Certificate Eligibility Requires Course Completion
A learner becomes eligible for a certificate only after completing the course according to the official completion rule.

### BR-032 — No Certificate Before Completion
The system must not allow certificate issuance for a course that is not completed.

### BR-033 — Certificate Must Be Linked to Learner and Course
Every certificate must be associated with a specific learner and a specific course.

### BR-034 — Certificate Must Include Minimum Identification Data
A certificate must include, at minimum, the learner name, course name, and completion date.

### BR-035 — Certificate Date Must Reflect a Valid Completion Context
The completion date shown on the certificate must correspond to a valid completion event or certificate issuance rule defined by the platform.

### BR-036 — Certificate Access Is Restricted to the Owner
Only the learner who earned a certificate, and authorized administrators if applicable, may access that learner’s certificate record.

### BR-037 — Reissued Certificates Must Preserve Logical Integrity
If a certificate is regenerated or reissued, it must remain logically tied to the same learner and course completion context.

---

## 12. Administrative Rules

### BR-038 — Only Administrators Manage Course Content
Only users with administrator privileges may create, edit, publish, unpublish, or remove courses and lessons.

### BR-039 — Administrators Are Responsible for Content Curation
Administrators are responsible for selecting, organizing, and maintaining course content quality.

### BR-040 — Administrators Must Maintain Valid Course Structures
Administrators should ensure that published courses contain coherent lesson sequences and valid lesson references.

### BR-041 — Administrative Changes Must Respect Existing Learner Data
Administrative changes to courses and lessons should avoid unnecessary disruption to learner progress and certificate records.

### BR-042 — Course Removal Must Follow Defined Data Policy
If a course is removed, the platform must follow a defined data policy regarding existing learner progress and certificates. In the initial version, hard deletion should be avoided when it could invalidate historical learner records, unless explicitly approved by operational policy.

---

## 13. Content Dependency Rules

### BR-043 — Course Value Depends on Curated Content
A course is considered valuable only if its lessons are intentionally curated and organized, not merely grouped without learning structure.

### BR-044 — External Video Availability Is a Business Dependency
Since lessons rely on YouTube videos, continued course usability depends on external content remaining available and embeddable.

### BR-045 — Broken Content Should Be Corrected by Administration
If a lesson video becomes unavailable or invalid, administrators should update, replace, or unpublish the affected content in a reasonable timeframe.

### BR-046 — Platform Does Not Own Third-Party Video Availability
The platform may organize third-party content but does not control the continued existence or accessibility of external videos.

---

## 14. Certificate Trust and Credibility Rules

### BR-047 — Certificate Credibility Depends on Transparent Rules
The value of a certificate depends on the clarity and consistency of the completion rules applied by the platform.

### BR-048 — Certificates Represent Platform Completion, Not External Accreditation
Unless explicitly stated otherwise, certificates represent completion within Dude Course and do not imply formal accreditation by external educational authorities.

### BR-049 — Certificate Issuance Must Follow the Same Rule Set for All Learners
Learners under the same course conditions must be evaluated by the same completion criteria.

---

## 15. Dashboard and Visibility Rules

### BR-050 — Learners May View Their Own Progress
A learner may view their own progress and completion status for courses in which they have participation data.

### BR-051 — Learners May View Their Own Certificates
A learner may access certificates earned through their own account.

### BR-052 — Learners Must Not Access Other Learners’ Records
A learner must not be able to access another learner’s progress or certificates unless explicitly authorized by a future feature.

---

## 16. Data Consistency Rules

### BR-053 — Business Records Must Remain Consistent
The relationships between learners, courses, lessons, progress records, and certificates must remain logically consistent.

### BR-054 — Progress and Certificates Must Be Traceable
The platform should maintain sufficient internal consistency to determine why a learner is considered in progress, completed, or certified.

### BR-055 — Course State Changes Must Be Handled Predictably
Publishing, unpublishing, editing, or removing course content must follow predictable rules so that learners and administrators are not exposed to inconsistent outcomes.

---

## 17. Operational Rules for Initial Phase

### BR-056 — Manual Administration Is Acceptable in Early Stages
During the initial phase, manual administration and manual content curation are acceptable operational practices.

### BR-057 — Small Curated Catalog Preferred Initially
The platform should prioritize a smaller number of well-structured courses over a large but inconsistent catalog.

### BR-058 — Simplicity Has Priority Over Advanced Validation
In the first version, simpler business rules may be preferred over advanced completion validation mechanisms such as watch-time verification or quizzes.

---

## 18. Assumptions Behind These Rules

The business rules in this document assume that:

- The platform is initially web-based
- Courses are curated by administrators, not by open public contributors
- Lesson completion is initially tracked through a simple mechanism
- Certificates are platform-level proof of completion
- Course content quality depends on curation discipline

---

## 19. Exclusions from This Document

This document does not define:

- Technical implementation details
- API contracts
- Database schema design
- UI design patterns
- Security controls in technical depth
- Detailed compliance legal interpretation

These subjects should be covered in dedicated technical, legal, and design documents.

---

## 20. Summary

The business rules for Dude Course define the core decision logic that governs how learners, administrators, courses, lessons, progress, and certificates behave within the platform.

These rules ensure that the product remains consistent, predictable, and aligned with its core promise: offering structured learning experiences based on curated YouTube content and rewarding learners with certificates upon completion.
