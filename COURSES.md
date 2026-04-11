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

### How `worksheetIds` works

The `WORKSHEETS` array defines every worksheet once. Each entry has a unique
`id` and a matching `<div id="page-<id>">…</div>` block in the DOM. A course
declares which worksheets it owns via its `worksheetIds` array.

- **CP4807** has `worksheetIds: CP4807_IDS` → `ws1`, `ws2`, …, `ws12`.
- **CO0003** has `worksheetIds: CO0003_IDS` → `co-ws1`, `co-ws2`, …, `co-ws12`
  (placeholder pages — see Placeholder worksheets below).

Each course points at its own worksheet IDs, so navigating between courses
shows different content in the body. Two courses *can* share an ID if you
deliberately want shared content (e.g. an "Introduction" page used by every
course) — just include the same ID in both courses' `worksheetIds`. Progress
on shared IDs is still per-course because the storage key is per-course.

### Placeholder worksheets

Some worksheets are placeholders — they exist in the navigation and have a
DOM block, but the body just says "Coming soon — source content awaiting
authoring". They're declared in `WORKSHEETS` with two extra fields:

```js
{ id: 'co-ws1', title: 'First Program', tier: 'bronze', challenges: 0, placeholder: true }
```

- `challenges: 0` — no checkboxes, no scoring math, no SCORM interactions.
- `placeholder: true` — flagged so future tooling can spot them.

The maths functions (`calcWSPercent`, `calcCourseOverall`, `checkAchievements`)
all guard against `challenges: 0` so a placeholder worksheet is silently skipped
from progress percentages and achievement counts.

In `imsmanifest.xml`, placeholder worksheets get their own organization
(`CO0003-org` separate from `CP4807-org`) and use `CO-ITEM-WSn` / `CO-RES-WSn`
identifiers so they don't collide with the real `ITEM-WSn` / `RES-WSn` SCOs.
Placeholder items deliberately have **no** `<adlcp:masteryscore>` because
there's nothing to score yet.

**To replace a placeholder with real content** when source files arrive:
1. In the `WORKSHEETS` entry, set the real `challenges` count and remove
   `placeholder: true`.
2. Replace the `<div id="page-co-wsN">` block with a full worksheet body
   following the layout rule (context → video → challenges → hints) using
   verbatim text from the source `.docx`.
3. Add `<adlcp:masteryscore>40</adlcp:masteryscore>` to the matching
   `CO-ITEM-WSN` in the manifest.
4. Run `python audit.py` (regenerate it from this doc if needed) to confirm
   no rules broken.

### Per-course progress tracking

Although the DOM is shared, progress is scoped per course in localStorage.
Achievements are **global** (shared across all courses) and live on the
All Courses page rather than on any individual course's Dashboard.

| Key                         | Scope    | Contents                                         |
|-----------------------------|----------|--------------------------------------------------|
| `lms-current-course`        | global   | currently selected course ID (`cp4807` / `co0003`) |
| `lms-progress-cp4807`       | per-course | `{ ws1: [true, false, ...], ws2: [...], ... }` |
| `lms-progress-co0003`       | per-course | same shape, separate data                      |
| `lms-achievements`          | global   | `["first_steps", "hint_seeker", ...]` — unlocked badges span all courses |

**Why achievements are global:** a learner shouldn't have to re-earn "First
Steps" every time they start a new course, and "Bronze Champion" means the
same thing regardless of which course's Bronze tier they completed. The
badges live on the All Courses landing page as the learner's overall
journey, not the current course's progress dashboard.

Aggregation rules used by `checkAchievements()`:
- **Counting achievements** (First Steps, Getting Started, Dedicated, Century
  Club, Page Turner): sum across all courses. Ticking 3 challenges in CP4807
  and 2 in CO0003 unlocks "Getting Started" (5 total).
- **Tier Champions** (Bronze/Silver/Gold): unlock when *any single course*
  has that entire tier finished. You can't cherry-pick Bronze worksheets
  from multiple courses — the learner must commit to a tier in one course.
- **Halfway There / Perfectionist / Course Master**: unlock when any *one*
  course hits the relevant threshold, not the aggregate.
- **Multi-course achievements** (Explorer, Multi-Discipline, Double Trouble):
  require activity in more than one course. Explorer uses the
  `lms-visited-courses` localStorage key (populated whenever a course card
  is clicked from the All Courses page).
- **Course-specific badges** (Embedded Expert, Aviation Ace): fire only when
  that specific course is 100% done. Hard-coded by course ID so they won't
  accidentally unlock for a future course.
- **Course Collector**: 2+ whole courses complete.
- **Resetting a course's progress does NOT clear achievements.** Badges are
  earned once and kept; Reset Progress only wipes the current course's
  challenge ticks and re-runs the check against the remaining courses.

### Current achievement roster (20 badges)

| # | ID                | Icon | Name              | Trigger                                    |
|---|-------------------|------|-------------------|--------------------------------------------|
| 1 | `first_steps`     | 🎯  | First Steps       | First challenge ticked (any course)        |
| 2 | `getting_started` | ⚡  | Getting Started   | 5 challenges ticked (any course)           |
| 3 | `page_turner`     | 📘  | Page Turner       | First worksheet completed                  |
| 4 | `hint_seeker`     | 💡  | Hint Seeker       | Opened a Show Hints panel                  |
| 5 | `on_a_roll`       | 🔥  | On a Roll         | 3 challenges ticked within 60s (session)   |
| 6 | `halfway_there`   | 🎯  | Halfway There     | 50% in any single course                   |
| 7 | `bronze_champion` | 🥉  | Bronze Champion   | All Bronze worksheets done in one course   |
| 8 | `silver_champion` | 🥈  | Silver Champion   | All Silver worksheets done in one course   |
| 9 | `gold_champion`   | 🥇  | Gold Champion     | All Gold worksheets done in one course     |
| 10| `tier_trifecta`   | 🌈  | Tier Trifecta     | A worksheet from each tier (any course)    |
| 11| `perfectionist`   | 🌟  | Perfectionist     | Every challenge ticked in a course         |
| 12| `course_master`   | 🎓  | Course Master     | 100% in any course                         |
| 13| `explorer`        | 🗝  | Explorer          | Opened more than one course                |
| 14| `multi_discipline`| 🧩  | Multi-Discipline  | Ticked challenges in 2+ courses            |
| 15| `double_trouble`  | 🔁  | Double Trouble    | Completed a worksheet in 2+ courses        |
| 16| `embedded_expert` | 🔌  | Embedded Expert   | CP4807 100% complete                       |
| 17| `aviation_ace`    | ✈  | Aviation Ace      | CO0003 100% complete                       |
| 18| `course_collector`| 🏛  | Course Collector  | 2+ full courses complete                   |
| 19| `dedicated`       | 💪  | Dedicated         | 50 challenges ticked across all courses    |
| 20| `century_club`    | 💯  | Century Club      | 100 challenges ticked across all courses   |

**Adding a course-specific badge for a new course:** add an entry to
`ACHIEVEMENTS`, then extend the bottom of `checkAchievements()` with a check
against `fullyCompletedCourseIds.indexOf('<new-course-id>')`. Follow the
pattern of `embedded_expert` / `aviation_ace`.

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
- **Worksheets**: 12 placeholder pages (`co-ws1` … `co-ws12`)
- **Status**: course home and progress tracking live. Worksheet pages are
  placeholders with no challenges (`challenges: 0`, `placeholder: true`)
  until source content is authored. Each placeholder shows a "Coming soon"
  card explaining what's needed. This is what makes CO0003 visibly distinct
  from CP4807 in the body — even though the original source doc says CO0003
  reuses CP4807 worksheet files, the practical reality is each course needs
  its own pages.

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

## SCORM structure rules

The LMS is SCORM 1.2 compliant (`scorm/scorm-api.js` implements LMS-RTE3, and
`imsmanifest.xml` declares the content package). **Every course must respect
the SCORM structure rules below so packaging the site as a SCORM zip keeps
working.**

The authoritative reference is [`SCORM-Skills-Document.md`](./SCORM-Skills-Document.md) —
this section is the short list of things you must not break.

### 1. Each worksheet is a Sharable Content Object (SCO)

Every `<div class="worksheet" id="page-<id>">` block in `index.html` is a
SCO. The matching manifest resource in `imsmanifest.xml` refers to it via a
fragment (`<resource href="index.html#ws1">`). This means:

- **Never rename a worksheet ID** (`ws1`, `ws2`, …, `ws12`) without also
  updating `imsmanifest.xml` *and* the migration path for existing
  `lms-progress-<course>` localStorage entries.
- **Never remove a worksheet ID** that appears in `WORKSHEETS` without
  removing the matching `<item>` and `<resource>` from the manifest.
- **Never add a worksheet** to `WORKSHEETS` without also adding its manifest
  item/resource entry. A worksheet that tracks progress in localStorage but
  isn't declared in the manifest will silently vanish when the course is
  exported as SCORM.

### 2. Interactions stay 1-to-1 with checkboxes

`scormUpdateChallenge()` in `index.html` writes each ticked challenge as a
`cmi.interactions.<idx>` entry. The `<idx>` value *is* the checkbox's
`data-idx` attribute.

- **Checkbox `data-idx` values must be contiguous integers starting at 0**
  within a worksheet. No gaps, no duplicates. If a worksheet has 6 challenges
  split across two cards, the first card is `data-idx` 0–3 and the second
  card is `data-idx` 4–5. See WS6 for the canonical example.
- **Never reuse a `data-idx`** across cards in the same worksheet.
- **Never renumber** a worksheet's `data-idx` values in place, because the
  existing learners' `cmi.interactions.<idx>` records will then point at the
  wrong challenges. If you need to restructure a worksheet, bump the
  worksheet ID (`ws4` → `ws4v2`) and add a migration note.

### 3. The `WORKSHEETS[].challenges` count must match the DOM

The `challenges` field in `WORKSHEETS` is the denominator for percentage
scoring and SCORM `cmi.core.score.raw`. It must equal the number of
`.challenge-check` inputs inside that worksheet's `<div>`.

When you change the number of challenges in a worksheet (add, remove, split
a card), update the `WORKSHEETS[].challenges` value in the same commit. This
was caught during the content audit — WS3 went 4→3, WS4 went 4→6, WS8 went
6→1, WS11 went 2→3 in that pass.

### 4. Mastery score stays at 40

Every manifest `<item>` uses `<adlcp:masteryscore>40</adlcp:masteryscore>`.
This matches the Bronze threshold in the Grading Mapping table in
`SCORM-Skills-Document.md` (40–59 Bronze, 60–79 Silver, 80–100 Gold).

- **Do not change mastery score per item** without updating the grading
  mapping doc and discussing with John.
- **Do not drop below 40** on any item — 40 is the pass threshold.

### 5. Suspend data stays JSON-serialisable

The LMS stores per-worksheet state via `cmi.suspend_data`, which in our
implementation holds `JSON.stringify(progressArray)`. The only thing that
should ever go in there is the boolean array of ticked challenges.

- **Do not stuff chat history, achievements, theme preferences, or anything
  else into `cmi.suspend_data`.** Those belong in separate localStorage keys
  (`lms-achievements-<course>`, etc.).
- **Keep the array length ≤ the worksheet's challenge count.** A shorter
  array (partial progress) is fine; a longer one breaks the scoring maths.

### 6. Organization structure mirrors tiers

In `imsmanifest.xml`, worksheets are grouped into three `<item>` folders:
Bronze / Silver / Gold. This mirrors the `tier` field in `WORKSHEETS` and
the sidebar nav headings. The three must stay in sync:

| Where           | Field                                    |
|-----------------|------------------------------------------|
| `WORKSHEETS`    | `tier: 'bronze' \| 'silver' \| 'gold'`   |
| Sidebar HTML    | `<div class="nav-tier-label tier-...">`  |
| Manifest XML    | `<item identifier="ITEM-BRONZE">` etc.   |
| Dashboard stats | `<div class="welcome-stats">` totals     |

If you move a worksheet between tiers (e.g. promote from Bronze to Silver),
all four places must change in one commit.

### 7. Assets live inside course folders, not a shared media pool

The SCORM manifest's `<resource>` entries declare every file that's part of
the package. Because every image path now lives under
`Assets/<course folder>/`, the manifest resource URLs must match. The old
`Assets/Media/` folder no longer exists and must never come back.

### 8. Per-course SCORM sessions

The SCORM runtime API is keyed by `student-<id>_<ws id>` in localStorage.
When a user switches courses, `switchCourse()` calls `scormEndSession()` on
the current worksheet first. This must stay in place — don't rip it out or
a mid-worksheet course switch will leave the SCO initialised forever.

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
- **Never rename or renumber a worksheet ID or a challenge `data-idx`** in
  place — it silently corrupts historical SCORM tracking data. If a
  restructure is needed, version the ID.
- **Never add content to `cmi.suspend_data`** beyond the challenge progress
  array. That field is not a general-purpose KV store.
- **Never diverge `imsmanifest.xml` from `WORKSHEETS[]`.** Adding, removing
  or retiering a worksheet means changing both in the same commit.
