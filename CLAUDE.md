# Course Builder — Project Context

## What this project does
Reads source Word documents and generates course outputs from them. Each
output type has its own AI instruction block in the doc.

## Courses currently in the site
- **CP4807** — Introduction to Microcontrollers (12 worksheets, Bronze/Silver/Gold)
- **CO0003** — Digital Techniques for Aviation (EASA Unit 5, reuses the CP4807 worksheets)

Each course has its own folder under `Assets/` holding its source `.docx`
and image files. Progress and achievements are tracked separately per
course in localStorage (`lms-progress-<courseid>` / `lms-achievements-<courseid>`).

## Folder convention
```
Assets/
  CP4807 - Introduction to microcontrollers 05 04 26/
    CP4807 - Introduction to microcontrollers 05 04 26.docx
    <all course images>
  Digital Techniques for Aviation –/
    Microcontroller based courses 10 04 26.docx
    CO0003 - opening.png
    CO002 - opening.png
```
Image src attributes in `index.html` point directly into these folders.
**Never revert to a flat `Assets/Media/` path** — the Media folder no longer exists.

## Screen types
When building the browser course or SCORM course, each row in the
screen list maps to a specific component:

| Screen type    | Render as                          |
|----------------|------------------------------------|
| Opening screen | Full-width hero image + title       |
| HTML           | Embed the .htm file content inline  |
| YouTube        | Embedded iframe player              |
| PDF            | Scrollable PDF viewer (iframe)      |
| Powerpoint     | Convert to PDF first, then display  |
| Document       | Extract and render worksheet layout |

## Worksheet layout order (John's spec)
1. Context text + photograph
2. Video (YouTube embed)
3. Challenges
4. Hints

## File naming convention
All output files follow the pattern: `CP4807-[n].docx`
Source document for the full course: `CP4807_master.docx`

## Do not
- Reword or paraphrase content from source documents
- Merge Challenge/Hint blocks — each is a separate card
- Invent content not present in the source

## Instructions inside the Word doc
Replace John's current red-font AI tag blocks with clearly headed sections like this:

```
---
AI TASK: Build browser course
Output file: CP4807-browser-course/index.html
Read CLAUDE.md before starting.

Screen list — process each row in order:
Opening screen  | Introduction to microcontrollers | CP4807--opening.png
YouTube         | Introducing E-blocks 3           | https://youtu.be/KmpyVmv6J_Y
PDF             | E-blocks datasheet               | https://www.matrixtsl.com/.../CP9645.pdf
Document        | First program                    | CP4807-1.docx
...
---
```

Then in VS Code terminal, John (or you) just runs:

```
claude "Read CLAUDE.md and the AI TASK block in CP4807_master.docx
and build the browser course"
```

## Key differences from John's current approach

| John's current syntax     | Claude Code equivalent                       |
|---------------------------|----------------------------------------------|
| `<AI instruction>` tags   | `AI TASK:` headed section in the doc         |
| Red font instructions     | Doesn't matter — Claude reads text not colour|
| `<Command>` tags          | Plain imperative sentence                    |
| Made-up XML tags          | Markdown table or plain list                 |
| No persistent context     | CLAUDE.md handles this                       |
