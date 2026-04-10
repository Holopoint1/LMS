# Courses — Authoring Rules & Architecture

This document covers how the multi-course LMS is put together, the rules every
course (old or new) must follow, and the process for adding the next course.

## The four rules (every course, always)

These are drawn from earlier feedback on the CP4807 course and apply identically
to every course on the site.

### 1. Verbatim content — no rewording, ever

Every intro paragraph, challenge, hint, instruction and caption in a worksheet
must be a **character-for-character match** to the source `.docx`.

- Do not paraphrase.
- Do not "improve" awkward phrasing.
- Do not fix typos in the source — preserve them.
- Do not substitute smart quotes, em-dashes or special characters for
  "cleaner" ones. Convert to HTML entities only if rendering needs it; never
  substitute words.
- Card titles ("About X", "Software Macros & Strings") are acceptable
  structural scaffolding because they don't exist in the source. Body content
  is not.

**Why:** the source `.docx` files are the single source of truth. Any drift
between the rendered site and the source silently breaks alignment with the
author's intent and is hard to spot in review. This rule is also saved to
Claude's persistent memory.

### 2. Worksheet layout order

Every worksheet must read top-to-bottom as:

1. **Hero** (image + tier badge + title + short description)
2. **Section progress bar** (sticky)
3. **Information card** — context text + photograph
4. **Watch card** — video description + YouTube embed
5. **Challenges card(s)** + **Hints toggle**
6. **Previous / Next navigation**

If a worksheet has no video (e.g. WS3 Connection Points, WS7 Prototype Boards),
the Watch card is omitted and the "There is no video for this worksheet" line
from the source is surfaced in the Information card instead.

### 3. Separate cards for every Challenge / Hint block

If the source document lists multiple `Challenges:` or `Hints:` blocks in a
worksheet, each block becomes its own card in the rendered output. Never merge
them.

Example — CP4807 Worksheet 6 (Macros / Subroutines) has two `Challenges:` /
`Hints:` pairs in the source:

- Pair 1 (4 challenges, 3 hints): Software macros & strings
- Pair 2 (2 challenges, 3 hints): 7-segment display & documentation

These render as two separate Challenge cards, each with its own Show Hints
toggle. They are not combined into one list.

### 4. No invented content

Nothing appears in a worksheet that isn't in the source. If content is missing
or wrong, fix the source document — not the rendered output.

---

## Multi-course architecture

The LMS currently holds two courses and is designed to grow. Here's how it's
wired.

### Folder layout

```
LMS/
├── index.html                    # the whole LMS — one file
├── CLAUDE.md                     # project context for AI sessions
├── COURSES.md                    # this file
├── SCORM-Skills-Document.md
├── imsmanifest.xml
├── scorm/
│   └── scorm-api.js
└── Assets/
    ├── CP4807 - Introduction to microcontrollers 05 04 26/
    │   ├── CP4807 - Introduction to microcontrollers 05 04 26.docx   ← source
    │   ├── intro to micros cover.jpg                                 ← hero
    │   ├── first program.jpg
    │   ├── Macros.jpg
    │   ├── ... (all CP4807 images)
    │   └── e-blocks3 logo.png
    │
    └── Digital Techniques for Aviation –/
        ├── Microcontroller based courses 10 04 26.docx               ← source
        ├── CO0003 - opening.png                                      ← hero
        └── CO002 - opening.png
```

Every course lives under its own folder inside `Assets/`. The folder holds the
source `.docx` **and** all of the images that course references. There is no
shared image pool — if two courses legitimately use the same image, copy it
into both folders.

### The `COURSES` array

In `index.html`, near the top of the main `<script>` block:

```js
const COURSES = [
  {
    id: 'cp4807',               // localStorage-safe short ID
    code: 'CP4807',             // displayed code
    title: '...',               // full course title — from source doc
    shortTitle: '...',          // short title for the course picker cards
    description: '...',         // 1–2 sentence description — from source doc
    heroImage: 'Assets/.../..', // big image on the course home + picker card
    thumbImage: 'Assets/.../..',// small image for course tabs / thumbnails
    worksheetIds: [...]         // which WORKSHEETS ids this course uses
  },
  ...
];
```

### How `worksheetIds` enables safe content sharing

The `WORKSHEETS` array defines each worksheet **once** — `ws1`, `ws2`, `ws3`,
etc. Each one has a single `<div id="page-ws1">…</div>` block in the DOM.
There is **no duplicate copy** of any worksheet anywhere in `index.html`.

When a course's `worksheetIds` includes `'ws1'`, it means "when the user is on
this course, show them the one `page-ws1` that already exists in the DOM."

- **CP4807** has `worksheetIds: ['ws1', 'ws2', ..., 'ws12']` — all 12.
- **CO0003** currently has the same 12, because the source document for CO0003
  explicitly lists `CP4807-1.docx` through `CP4807-12.docx` as its `Document`
  screens — i.e. the source *itself* says to reuse the exact same files.

**This means verbatim-content drift is impossible between these two courses.**
They are literally rendering the same DOM. If you fix a typo in the WS3 hints
for CP4807, CO0003 gets the fix automatically.

### Per-course progress tracking

Although the DOM is shared, progress is scoped per course in localStorage:

| Key                         | Contents                                         |
|-----------------------------|--------------------------------------------------|
| `lms-current-course`        | currently selected course ID (`cp4807` / `co0003`) |
| `lms-progress-cp4807`       | `{ ws1: [true, false, ...], ws2: [...], ... }`   |
| `lms-progress-co0003`       | same shape, separate data                        |
| `lms-achievements-cp4807`   | `["first_steps", "hint_seeker", ...]`            |
| `lms-achievements-co0003`   | same shape, separate data                        |

Switching courses via the All Courses page:

1. Ends any active SCORM session on the old course.
2. Updates `currentCourse` and `localStorage['lms-current-course']`.
3. Rebuilds `NAV_ORDER` from the new course's `worksheetIds`.
4. Swaps the sidebar header (course code + title) and the course home hero.
5. Re-hydrates every checkbox from `lms-progress-<newCourse>`.
6. Re-runs `checkAchievements()` silently (no toasts) so the badges match the
   new course's state.
7. Repaints the sidebar nav and progress bars.

All of this happens in one function: `switchCourse(courseId)`.

---

## Adding a new course — step by step

Use this checklist when a new course arrives.

### 1. Create the folder

```
Assets/<course name and version>/
```

Put the source `.docx` and all course images in here. Use a stable, descriptive
folder name — never rename it once live, because `index.html` hard-codes the
paths.

### 2. Read the source `.docx` before writing any code

Open the source and identify:

- Course code (e.g. `CO0003`)
- Full course title
- 1–2 sentence description (pull from the source — do not write your own)
- Hero image filename
- The list of worksheet filenames referenced in its screen list

If the source reuses existing worksheets from another course (like CO0003
reuses CP4807-1 through 12), **you do not re-build those worksheets**. They
already exist in the DOM. Just add their IDs to `worksheetIds`.

If the source introduces new worksheets (e.g. `CP1972-1.docx` sensor
worksheets), those need to be built — see step 4.

### 3. Add the course to the `COURSES` array

In `index.html`, find `const COURSES = [` and add a new object. Required
fields are `id`, `code`, `title`, `shortTitle`, `description`, `heroImage`,
`thumbImage`, `worksheetIds`.

That's all that's needed for the course picker to show the new card and the
sidebar to switch to it cleanly.

### 4. (Only if new worksheets exist) Add them to `WORKSHEETS` and build DOM

If the source introduces worksheets that aren't already on the site:

1. Add an entry to the `WORKSHEETS` array with the right `id`, `title`, `tier`
   and `challenges` count.
2. Add a new `<div class="worksheet" id="page-<id>">…</div>` block in the HTML,
   following the exact layout of an existing worksheet like `page-ws1`.
3. Fill the intro, video description, challenges and hints **verbatim** from
   the source `.docx`. See rule 1.
4. If the source has multiple Challenge/Hint blocks, render them as separate
   cards. See rule 3.
5. Add a sidebar `<a class="nav-item">` entry so the worksheet shows in the
   Bronze / Silver / Gold section nav.

**Important:** only include the new worksheet's ID in the `worksheetIds` of
the course(s) that actually reference it in their source screen list. Don't
add it to every course by default.

### 5. Verify before committing

- Does the course card appear on the All Courses page with the right title
  and image?
- Does clicking it drop into a Course Home with the right hero, title and
  description?
- Does the sidebar show the same nav as the other courses (or a subset, if
  that course uses fewer worksheets)?
- Does progress stay separate? Tick a box in one course, switch to the other,
  confirm the other course's boxes aren't ticked.
- Does `checkAchievements` still work? (First Steps should fire after the
  first tick in each course independently.)

---

## Current course catalogue

### CP4807 — Introduction to Microcontrollers

- **Source**: `Assets/CP4807 - Introduction to microcontrollers 05 04 26/CP4807 - Introduction to microcontrollers 05 04 26.docx`
- **Worksheets**: 12 (ws1–ws12)
- **Tiers**: 7 Bronze, 3 Silver, 2 Gold
- **Status**: all 12 worksheets rendered verbatim from source, layout rule
  compliant, challenge/hint blocks separated per source structure.

### CO0003 — Digital techniques for aviation technicians

- **Source**: `Assets/Digital Techniques for Aviation –/Microcontroller based courses 10 04 26.docx`
- **Worksheets**: 12 (reuses ws1–ws12 by reference — source doc explicitly
  lists `CP4807-1.docx` through `CP4807-12.docx` in its screen list)
- **Status**: course home and progress tracking live. The source also lists
  additional screens not yet built (see "Not yet built" below).

#### Not yet built for CO0003

The source CO0003 screen list references content we don't have files for
yet. None of these can be added without the source material:

| Screen type | Title                        | File                                        |
|-------------|------------------------------|---------------------------------------------|
| HTML        | Welcome                      | `CO0003 – welcome.HTM`                      |
| YouTube     | Introducing E-blocks 3       | (link only — `youtu.be/KmpyVmv6J_Y`)        |
| YouTube     | Introducing Flowcode         | (link only — `youtu.be/tDdptTbvDM0`)        |
| PDF         | E-blocks datasheet           | `CP9645-Eblocks-3-Datasheet-1.pdf` (URL OK) |
| PowerPoint  | Microcontroller basics 1     | `Microcontroller basics 1 24 02 26.pptx`    |
| PowerPoint  | Microcontroller basics 2     | `Microcontroller basics 2 24 02 26.pptx`    |
| HTML        | Getting started guide        | (Flowcode wiki URL)                         |
| Document    | Analogue inputs              | `CP1972-1.docx` (new worksheet)             |
| Document    | Light sensor                 | `CP1972-2.docx` (new worksheet)             |
| Document    | Analogue temperature sensor  | `CP1972-3.docx` (new worksheet)             |
| Document    | Digital temperature sensor   | `CP1972-4.docx` (new worksheet)             |
| Document    | Digital accelerometer        | `CP1972-5.docx` (new worksheet)             |
| Document    | Basic DC motors              | `CP0507-1.docx` (new worksheet)             |
| Document    | Full bridge motor control    | `CP0507-2.docx` (new worksheet)             |
| Document    | Servo motor control          | `CP0507-4.docx` (new worksheet)             |
| HTML        | Homework 1–3                 | `CP4807-H1.htm`, `-H2.htm`, `-H3.htm`       |

When these source files become available, follow the "Adding a new course" →
"new worksheets" steps in section 4 above.

---

## Things you should never do

- **Never revert to a flat `Assets/Media/` path.** That folder no longer
  exists — all image paths now point into course-specific folders.
- **Never duplicate a worksheet's DOM block** to "make each course have its
  own copy". That guarantees drift the first time someone fixes a typo in
  only one place. Use `worksheetIds` to share.
- **Never merge two Challenge or Hint blocks** from the source into one
  rendered card, even if they look similar. Each source block is a separate
  card. See rule 3.
- **Never rewrite a paragraph** from the source because it reads awkwardly.
  The source is the truth. See rule 1.
- **Never delete a user's progress** when switching courses. Progress is
  stored under `lms-progress-<courseid>` and each course's data must be
  preserved independently.
