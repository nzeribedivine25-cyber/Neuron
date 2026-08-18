# Neuron — E-Learning Quiz Platform

**Live app:** https://neuron-sync.vercel.app
**Backend API:** https://neuron-api-iamy.onrender.com/api/health
**Repository:** https://github.com/nzeribedivine25-cyber/Neuron

Capstone project for the 3MTT (Three Million Technical Talent) programme.

## Problem

Quality practice tools for Nigerian university students are scarce. Existing quiz platforms (Kahoot, Quizizz, Google Forms) are built for generic trivia or classroom engagement — not for structured, curriculum-specific exam practice tied to actual course content. Students preparing for real coursework often have no free, organized way to test themselves against material that matches what they're actually being examined on.

## What Neuron does

Neuron is a course-based practice quiz platform. Quizzes are grouped by course (not generic categories), and each course maps to real curriculum content. It currently covers seven 100-level, second-semester Computer Science courses at UNICAL:

- COS 102 — Problem Solving & Algorithms
- CSC 162 — Computer Hardware & Electronics Fundamentals
- CSC 182 — Computer Programming Basics
- GST 112 — Nigerian Peoples and Culture
- MTH 102 — Limits, Continuity & Calculus Fundamentals
- PHY 102 — Electrostatics & Charge
- PHY 108 — Lab Physics (Error Analysis & Instruments)

## Core features

- **Authentication** — email/password registration and login (JWT-based)
- **Course-organized quizzes** — every quiz belongs to a specific course, so the platform can scale to more departments and course updates over time without becoming a flat, unsorted list
- **Two quiz modes:**
  - _Practice_ — untimed or user-selectable timer, unlimited retries
  - _Focused_ — timed, strictly one attempt per user (enforced server-side, not just in the UI)
  - Both MCQ and short-answer question types are supported
- **Automatic scoring** — answers are graded server-side on submission, with short-answer grading normalized (case/whitespace-insensitive) to reduce false negatives
- **Progress tracking** — per-user attempt history and an accuracy chart across completed quizzes, so students can see improvement over time rather than just a single score

## Tech stack

- **Frontend:** React (Vite), React Router, Axios, Recharts — deployed on Vercel
- **Backend:** Node.js, Express — deployed on Render
- **Database:** PostgreSQL, hosted on Supabase

## Architecture notes

- Quizzes, questions, attempts, and answers are normalized across five tables (`users`, `courses`, `quizzes`, `questions`, `attempts`, `answers`), with quizzes linked to courses via foreign key rather than free-text topic strings — this was a deliberate choice so new courses/departments can be added without restructuring the schema.
- The one-attempt rule for focused quizzes is enforced in the API layer (checking for a prior completed attempt before allowing a new one), not just hidden in the UI — so it can't be bypassed by calling the API directly.
- Timer enforcement happens server-side using `started_at` and `time_limit_seconds`, not purely a frontend countdown.

## Content sourcing

Quiz content is compiled from a mix of sources: for GST 112 and PHY 108, from the student's own compiled past-question sets and lab material; for the remaining courses, from standard first/second-semester syllabus content where clean source material with verified answers wasn't available. This mix is disclosed here in the interest of transparency about content provenance.

## Running locally

**Backend:**

```bash
cd server
npm install
# create a .env file with DATABASE_URL, JWT_SECRET, PORT
node index.js
```

**Frontend:**

```bash
cd client
npm install
npm run dev
```

## Deliverables

- Deployed link: https://neuron-sync.vercel.app
- Source code: this repository
- Demo video: [link to be added]

## Known Limitations & Future Work

This is a capstone MVP, and some gaps are deliberately left for future iteration rather than rushed under deadline pressure:

**Security**

- No rate limiting on login/register endpoints (brute-force risk)
- JWT tokens have no revocation mechanism — once issued, a token is valid until its 7-day expiry
- No server-side authentication middleware verifying the logged-in user on protected actions (e.g. quiz creation/deletion currently trust the `user_id` sent in the request body rather than a verified session token)
- Limited input validation on quiz creation — no sanitization or size limits on submitted content

**Account management**

- No email verification on registration
- No password reset flow

**Content**

- Quiz content is a mix of sources: some courses (GST 112, PHY 108) draw from compiled past-question sets and lab material; others use general syllabus-level content where verified source material wasn't available. This is disclosed for transparency — content should be reviewed by course instructors before use in a real academic setting.
- No content moderation/review step before a submitted quiz becomes visible to other users
- Answer explanations exist in the schema but are only populated for newly created questions going forward, not retroactively for existing content

**Scale & reliability**

- Backend is hosted on Render's free tier, which spins down after inactivity — the first request after idle time may take 30–60 seconds
- No automated tests
- No pagination on the quiz list (fine at current scale, would need addressing with significant content growth)

**Learning features**

- No spaced repetition or adaptive difficulty
- Progress tracking shows per-course accuracy and attempt history, but doesn't yet identify specific weak topics within a course or suggest targeted review
