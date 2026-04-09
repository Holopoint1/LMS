# SCORM Skills Document

## Building a Custom LMS: The Complete SCORM Reference

---

## 1. What is SCORM?

**SCORM (Sharable Content Object Reference Model)** is a set of technical standards for e-learning software products. Developed by the **Advanced Distributed Learning (ADL) Initiative** (a US Department of Defense programme), SCORM governs how online learning content and Learning Management Systems (LMS) communicate with each other.

SCORM is not a single specification but a **collection of standards and specifications** adapted from multiple sources, bundled into a "reference model" that tells developers:

1. **How to package content** so any SCORM-compliant LMS can import it
2. **How to launch content** within an LMS environment
3. **How content and the LMS talk to each other** at runtime (tracking, scoring, progress)

### Why SCORM Matters for Our LMS

Since we are building our own LMS to deliver courses like **CP4807 - Introduction to Microcontrollers**, SCORM compliance means:

- Courses authored in external tools can be imported directly
- Our courses can be exported and used on other platforms
- We get a standardised approach to tracking learner progress, scores, and completion
- We can integrate third-party content libraries
- Educational institutions expect SCORM support as a baseline

---

## 2. SCORM Versions

### SCORM 1.2 (October 2001)

- The most widely adopted version
- Simpler to implement
- Supported by virtually all LMS platforms and authoring tools
- **This is the minimum we should support**

### SCORM 2004 (Editions 1-4, 2004-2009)

- Adds **sequencing and navigation** rules
- Supports complex branching and adaptive learning paths
- Richer data model (more trackable data points)
- Edition 4 (2009) is the most current
- More complex to implement but more powerful

### Recommendation for Our LMS

**Implement SCORM 1.2 first**, then layer on SCORM 2004 4th Edition support. Most authoring tools still output SCORM 1.2 packages, and it covers 90%+ of real-world use cases.

---

## 3. SCORM Architecture: The Three Core Components

### 3.1 Content Aggregation Model (CAM)

Defines how content is structured, packaged, and described with metadata.

#### Content Package

A SCORM content package is a **ZIP file** (with a `.zip` extension) containing:

```
my-course.zip
├── imsmanifest.xml          # The manifest (required)
├── metadata.xml             # Optional external metadata
├── content/
│   ├── index.html           # The launchable SCO or Asset
│   ├── page1.html
│   ├── page2.html
│   ├── styles/
│   │   └── course.css
│   ├── scripts/
│   │   └── scorm-api.js
│   └── media/
│       ├── video.mp4
│       ├── diagram.png
│       └── simulation.swf
└── adlcp_rootv1p2/          # XSD schema files (optional)
```

#### imsmanifest.xml

The heart of every SCORM package. This XML file describes:

- **Metadata**: Title, description, version, author
- **Organizations**: The course structure (table of contents / learning tree)
- **Resources**: The actual files and their types
- **Dependencies**: Which resources depend on others

Example for a course like CP4807:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="CP4807-IntroMicrocontrollers"
          version="1.0"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>

  <organizations default="CP4807-org">
    <organization identifier="CP4807-org">
      <title>Introduction to Microcontrollers</title>

      <!-- Bronze Tier -->
      <item identifier="bronze" isvisible="true">
        <title>Bronze - Fundamentals</title>

        <item identifier="ws1" identifierref="ws1-resource">
          <title>Worksheet 1: First Program</title>
          <adlcp:prerequisites type="aicc_script"></adlcp:prerequisites>
        </item>

        <item identifier="ws2" identifierref="ws2-resource">
          <title>Worksheet 2: Performing Calculations</title>
          <adlcp:prerequisites type="aicc_script">ws1</adlcp:prerequisites>
        </item>

        <item identifier="ws3" identifierref="ws3-resource">
          <title>Worksheet 3: Connection Points</title>
        </item>

        <item identifier="ws4" identifierref="ws4-resource">
          <title>Worksheet 4: Digital Inputs</title>
        </item>

        <item identifier="ws5" identifierref="ws5-resource">
          <title>Worksheet 5: Making Decisions</title>
        </item>

        <item identifier="ws6" identifierref="ws6-resource">
          <title>Worksheet 6: Macros / Subroutines</title>
        </item>

        <item identifier="ws7" identifierref="ws7-resource">
          <title>Worksheet 7: Using Prototype Boards</title>
        </item>
      </item>

      <!-- Silver Tier -->
      <item identifier="silver" isvisible="true">
        <title>Silver - Intermediate</title>

        <item identifier="ws8" identifierref="ws8-resource">
          <title>Worksheet 8: Colour Graphical Displays</title>
        </item>

        <item identifier="ws9" identifierref="ws9-resource">
          <title>Worksheet 9: Pin Interrupts</title>
        </item>

        <item identifier="ws10" identifierref="ws10-resource">
          <title>Worksheet 10: Timer Interrupts</title>
        </item>
      </item>

      <!-- Gold Tier -->
      <item identifier="gold" isvisible="true">
        <title>Gold - Advanced</title>

        <item identifier="ws11" identifierref="ws11-resource">
          <title>Worksheet 11: Touch Control Systems</title>
        </item>

        <item identifier="ws12" identifierref="ws12-resource">
          <title>Worksheet 12: Web Mirror</title>
        </item>
      </item>

      <!-- Assessments -->
      <item identifier="assessments" isvisible="true">
        <title>Assessments</title>

        <item identifier="a1" identifierref="a1-resource">
          <title>Assessment 1: Light Sensor Display</title>
        </item>

        <item identifier="a2" identifierref="a2-resource">
          <title>Assessment 2: Temperature Controller</title>
        </item>

        <item identifier="a3" identifierref="a3-resource">
          <title>Assessment 3: Touch Temperature Controller</title>
        </item>
      </item>

    </organization>
  </organizations>

  <resources>
    <resource identifier="ws1-resource" type="webcontent"
              adlcp:scormtype="sco" href="content/ws1/index.html">
      <file href="content/ws1/index.html"/>
      <file href="content/ws1/styles.css"/>
      <file href="content/ws1/scorm.js"/>
      <file href="media/First program.jpg"/>
      <file href="media/Flashing light.jpg"/>
    </resource>
    <!-- ... more resources ... -->
  </resources>

</manifest>
```

#### Content Hierarchy

```
Content Package
  └── Organization (course structure / table of contents)
       └── Item (a node in the learning tree - can be nested)
            └── SCO or Asset (the actual launchable content)
```

- **SCO (Sharable Content Object)**: A learning object that communicates with the LMS via the SCORM Runtime API. Tracks progress, scores, time, etc.
- **Asset**: A static resource (image, PDF, video) that does NOT communicate with the LMS. No tracking.

For CP4807, each worksheet would be a **SCO** (so we can track completion/scores), while supporting media (images, videos) would be **Assets**.

### 3.2 Runtime Environment (RTE)

Defines how content communicates with the LMS during a learning session.

#### The Launch Mechanism

When a learner clicks on a SCO in the LMS:

1. LMS opens a **new browser window/frame** (or iframe)
2. LMS loads the SCO's HTML entry point (the `href` from the manifest)
3. LMS makes the **SCORM API** available in the browser's JavaScript scope
4. SCO finds the API and begins communication

#### The SCORM API (JavaScript)

The LMS must expose a JavaScript API object that SCOs can find and call. This is the core of runtime communication.

**SCORM 1.2 API** - object name: `API`

```javascript
// LMS must provide this object in the window hierarchy
window.API = {
  // Session methods
  LMSInitialize: function(param) { },    // Start session - param is always ""
  LMSFinish: function(param) { },        // End session - param is always ""

  // Data transfer
  LMSGetValue: function(element) { },    // Read a data model element
  LMSSetValue: function(element, value) { },  // Write a data model element
  LMSCommit: function(param) { },        // Persist data to server - param is always ""

  // Error handling
  LMSGetLastError: function() { },       // Returns error code number
  LMSGetErrorString: function(errorCode) { },   // Human-readable error
  LMSGetDiagnostic: function(errorCode) { }     // Detailed diagnostic info
};
```

**SCORM 2004 API** - object name: `API_1484_11`

```javascript
window.API_1484_11 = {
  Initialize: function(param) { },
  Terminate: function(param) { },
  GetValue: function(element) { },
  SetValue: function(element, value) { },
  Commit: function(param) { },
  GetLastError: function() { },
  GetErrorString: function(errorCode) { },
  GetDiagnostic: function(errorCode) { }
};
```

#### API Discovery (How SCOs Find the API)

SCOs must search up the window hierarchy to find the API object. This is critical because the SCO might be nested in iframes.

```javascript
// Standard SCORM API discovery algorithm
function findAPI(win) {
  let attempts = 0;
  const maxAttempts = 500; // Prevent infinite loops

  // Search up through parent windows
  while (
    win.API == null &&
    win.parent != null &&
    win.parent != win
  ) {
    attempts++;
    if (attempts > maxAttempts) return null;
    win = win.parent;
  }

  // Check opener window chain if not found
  if (win.API == null && win.opener != null) {
    return findAPI(win.opener);
  }

  return win.API || null;
}

// Usage
const api = findAPI(window);
if (api) {
  api.LMSInitialize("");
}
```

**Our LMS must place the API object where SCOs can find it** - typically on the window that launches the SCO, or on a parent frame.

#### API Call Sequence

```
SCO Loaded
    │
    ├── LMSInitialize("") ──────── Must be called first
    │
    ├── LMSGetValue("cmi.core.student_name")
    │     └── Returns: "Smith, John"
    │
    ├── LMSGetValue("cmi.core.lesson_status")
    │     └── Returns: "incomplete"
    │
    ├── [Learner interacts with content...]
    │
    ├── LMSSetValue("cmi.core.score.raw", "85")
    ├── LMSSetValue("cmi.core.lesson_status", "completed")
    ├── LMSSetValue("cmi.core.lesson_location", "page-7")
    │
    ├── LMSCommit("") ──────────── Persist to server
    │
    └── LMSFinish("") ──────────── Session complete
```

### 3.3 Sequencing and Navigation (SCORM 2004 only)

Defines rules for how learners move between SCOs. SCORM 1.2 has only basic prerequisites; 2004 adds a full sequencing engine.

#### Sequencing Concepts

- **Activity Tree**: The hierarchical structure of learning activities
- **Tracking Model**: Status tracking for each activity (attempted, completed, satisfied, etc.)
- **Sequencing Rules**: Conditions that control flow (pre-conditions, post-conditions, exit conditions)
- **Rollup Rules**: How child activity status rolls up to parent status
- **Navigation Model**: How learner navigation requests are processed

#### Sequencing for CP4807 Example

```xml
<!-- SCORM 2004 sequencing: Bronze must be completed before Silver -->
<item identifier="silver">
  <title>Silver - Intermediate</title>
  <imsss:sequencing>
    <imsss:controlMode choice="true" flow="true"/>
    <imsss:sequencingRules>
      <imsss:preConditionRule>
        <imsss:ruleConditions>
          <imsss:ruleCondition
            referencedObjective="bronze-objective"
            condition="satisfied"/>
        </imsss:ruleConditions>
        <imsss:ruleAction action="disabled"/>
      </imsss:preConditionRule>
    </imsss:sequencingRules>
  </imsss:sequencing>
</item>
```

---

## 4. The SCORM Data Model

The data model defines **what information** can be exchanged between SCO and LMS. These are the "elements" passed to `GetValue` and `SetValue`.

### 4.1 SCORM 1.2 Data Model (cmi.core)

| Element | Type | Access | Description |
|---------|------|--------|-------------|
| `cmi.core.student_id` | String | Read | Unique learner identifier |
| `cmi.core.student_name` | String | Read | Learner's name (Surname, First) |
| `cmi.core.lesson_location` | String(255) | Read/Write | Bookmark - where learner left off |
| `cmi.core.credit` | "credit" / "no-credit" | Read | Whether this attempt counts |
| `cmi.core.lesson_status` | Vocab | Read/Write | See status values below |
| `cmi.core.entry` | "ab-initio" / "resume" / "" | Read | Whether this is a new or resumed attempt |
| `cmi.core.score.raw` | Decimal | Read/Write | Learner's score (0-100 typical) |
| `cmi.core.score.max` | Decimal | Read/Write | Maximum possible score |
| `cmi.core.score.min` | Decimal | Read/Write | Minimum possible score |
| `cmi.core.total_time` | Timespan | Read | Cumulative time across sessions |
| `cmi.core.session_time` | Timespan | Write | Time spent this session (HHHH:MM:SS.SS) |
| `cmi.core.exit` | "time-out" / "suspend" / "logout" / "" | Write | How learner is leaving |
| `cmi.core.lesson_mode` | "browse" / "normal" / "review" | Read | Current mode |
| `cmi.suspend_data` | String(4096) | Read/Write | Free-form data preserved between sessions |
| `cmi.launch_data` | String(4096) | Read | Data from manifest, set at author time |
| `cmi.comments` | String(4096) | Read/Write | Learner comments |
| `cmi.comments_from_lms` | String(4096) | Read | LMS/instructor comments |

#### Lesson Status Values (SCORM 1.2)

| Status | Meaning |
|--------|---------|
| `passed` | Learner has passed (met mastery score) |
| `completed` | Learner has completed the content |
| `failed` | Learner has failed (below mastery score) |
| `incomplete` | Learner has started but not finished |
| `browsed` | Learner viewed in browse mode |
| `not attempted` | Learner has not started |

#### Interactions (for tracking individual questions/activities)

```
cmi.interactions._count                    (Read) Number of interactions
cmi.interactions.n.id                      (Write) Unique interaction ID
cmi.interactions.n.objectives._count       (Read) Objectives for this interaction
cmi.interactions.n.objectives.n.id         (Write) Objective ID
cmi.interactions.n.time                    (Write) Time of interaction (HH:MM:SS.SS)
cmi.interactions.n.type                    (Write) Type: true-false, choice, fill-in,
                                                    matching, performance, sequencing,
                                                    likert, numeric
cmi.interactions.n.correct_responses._count (Read)
cmi.interactions.n.correct_responses.n.pattern (Write) Correct answer pattern
cmi.interactions.n.weighting               (Write) Weight for scoring
cmi.interactions.n.student_response        (Write) What the learner answered
cmi.interactions.n.result                  (Write) correct, wrong, unanticipated, neutral,
                                                    or numeric
cmi.interactions.n.latency                 (Write) Time to respond
```

### 4.2 SCORM 2004 Data Model (cmi)

SCORM 2004 expands the data model significantly. Key additions:

| Element | Description |
|---------|-------------|
| `cmi.completion_status` | Separate from success (completed / incomplete / not attempted / unknown) |
| `cmi.success_status` | Separate from completion (passed / failed / unknown) |
| `cmi.progress_measure` | 0.0 to 1.0, how far through content |
| `cmi.scaled_score` | -1.0 to 1.0, normalised score |
| `cmi.objectives.n.*` | Per-objective tracking (score, status, description) |
| `cmi.learner_preference.*` | Audio level, language, delivery speed, caption preference |
| `adl.nav.request` | Programmatic navigation requests (continue, previous, choice, exit) |

### 4.3 Mapping CP4807 to the Data Model

For each worksheet SCO in our microcontrollers course:

```javascript
// When learner opens Worksheet 4: Digital Inputs
api.LMSInitialize("");

// Check if resuming
const entry = api.LMSGetValue("cmi.core.entry");
if (entry === "resume") {
  const bookmark = api.LMSGetValue("cmi.core.lesson_location");
  // Resume from bookmark position
  navigateTo(bookmark);
}

// Track challenge completion as interactions
api.LMSSetValue("cmi.interactions.0.id", "ws4-challenge1");
api.LMSSetValue("cmi.interactions.0.type", "performance");
api.LMSSetValue("cmi.interactions.0.result", "correct");
api.LMSSetValue("cmi.interactions.0.latency", "00:15:30.00");

// Set score based on challenges completed (Bronze/Silver/Gold)
api.LMSSetValue("cmi.core.score.raw", "75");
api.LMSSetValue("cmi.core.score.max", "100");
api.LMSSetValue("cmi.core.score.min", "0");

// Mark completion
api.LMSSetValue("cmi.core.lesson_status", "completed");
api.LMSSetValue("cmi.core.session_time", "01:30:00.00");
api.LMSSetValue("cmi.core.lesson_location", "challenge-3");

api.LMSCommit("");
api.LMSFinish("");
```

---

## 5. What Our LMS Must Implement

### 5.1 Content Package Import

Our LMS needs to:

1. **Accept ZIP upload** from admin/instructor
2. **Extract the ZIP** to server storage
3. **Parse `imsmanifest.xml`** to build the course structure
4. **Validate** the manifest against SCORM schemas
5. **Store course metadata** in our database (title, description, organization structure)
6. **Map resources** to servable file paths
7. **Build navigation tree** from the organization's item hierarchy

#### Manifest Parser (Pseudocode)

```javascript
async function importScormPackage(zipFile) {
  // 1. Extract ZIP
  const extractPath = await extractZip(zipFile, `/courses/${courseId}/`);

  // 2. Parse manifest
  const manifest = await parseXml(`${extractPath}/imsmanifest.xml`);

  // 3. Determine SCORM version
  const schemaVersion = manifest.metadata.schemaversion;
  // "1.2" or "2004 4th Edition" etc.

  // 4. Build course record
  const course = {
    id: generateId(),
    title: manifest.organizations.default.title,
    scormVersion: schemaVersion,
    structure: [],
    resources: {}
  };

  // 5. Parse organizations into navigation tree
  for (const item of manifest.organizations.items) {
    course.structure.push(parseItem(item, manifest.resources));
  }

  // 6. Index resources
  for (const resource of manifest.resources) {
    course.resources[resource.identifier] = {
      type: resource.scormType, // "sco" or "asset"
      href: resource.href,
      files: resource.files
    };
  }

  // 7. Save to database
  await db.courses.insert(course);
  return course;
}
```

### 5.2 SCORM Runtime API Implementation

This is the most critical part. Our LMS JavaScript must:

```javascript
// scorm-api-provider.js
// This runs in the LMS frame that launches SCOs

class ScormAPIProvider {
  constructor(learnerData, scoData) {
    this.learner = learnerData;
    this.sco = scoData;
    this.dataModel = {};
    this.initialized = false;
    this.terminated = false;
    this.lastError = 0;
    this.dirtyData = {};

    // Pre-populate read-only values
    this.dataModel["cmi.core.student_id"] = learnerData.id;
    this.dataModel["cmi.core.student_name"] = learnerData.name;
    this.dataModel["cmi.core.credit"] = "credit";
    this.dataModel["cmi.core.lesson_mode"] = "normal";
    this.dataModel["cmi.core.entry"] = scoData.previouslyAccessed
      ? "resume" : "ab-initio";

    // Restore previous session data
    if (scoData.suspendData) {
      this.dataModel["cmi.suspend_data"] = scoData.suspendData;
    }
    if (scoData.lessonLocation) {
      this.dataModel["cmi.core.lesson_location"] = scoData.lessonLocation;
    }
    if (scoData.totalTime) {
      this.dataModel["cmi.core.total_time"] = scoData.totalTime;
    }
  }

  LMSInitialize(param) {
    if (param !== "") {
      this.lastError = 201; // Invalid argument
      return "false";
    }
    if (this.initialized) {
      this.lastError = 101; // Already initialized
      return "false";
    }
    this.initialized = true;
    this.lastError = 0;
    this.sessionStartTime = new Date();
    return "true";
  }

  LMSGetValue(element) {
    if (!this.initialized) {
      this.lastError = 301; // Not initialized
      return "";
    }

    // Validate element exists in data model
    if (!this.isValidElement(element)) {
      this.lastError = 401; // Not implemented
      return "";
    }

    // Check read access
    if (this.isWriteOnly(element)) {
      this.lastError = 404; // Element is write only
      return "";
    }

    this.lastError = 0;
    return this.dataModel[element] || "";
  }

  LMSSetValue(element, value) {
    if (!this.initialized) {
      this.lastError = 301;
      return "false";
    }

    // Validate element and value
    if (!this.isValidElement(element)) {
      this.lastError = 401;
      return "false";
    }
    if (this.isReadOnly(element)) {
      this.lastError = 403; // Element is read only
      return "false";
    }
    if (!this.isValidValue(element, value)) {
      this.lastError = 405; // Incorrect data type
      return "false";
    }

    this.dataModel[element] = value;
    this.dirtyData[element] = value;
    this.lastError = 0;
    return "true";
  }

  LMSCommit(param) {
    if (!this.initialized) {
      this.lastError = 301;
      return "false";
    }

    // Send dirty data to server via AJAX/fetch
    this.persistToServer(this.dirtyData);
    this.dirtyData = {};
    this.lastError = 0;
    return "true";
  }

  LMSFinish(param) {
    if (!this.initialized) {
      this.lastError = 301;
      return "false";
    }

    // Calculate and add session time
    const sessionTime = this.calculateSessionTime();
    this.dataModel["cmi.core.session_time"] = sessionTime;

    // Commit any remaining data
    this.LMSCommit("");

    // Update total_time on server
    this.updateTotalTime(sessionTime);

    this.initialized = false;
    this.terminated = true;
    this.lastError = 0;
    return "true";
  }

  LMSGetLastError() {
    return String(this.lastError);
  }

  LMSGetErrorString(errorCode) {
    const errors = {
      0: "No error",
      101: "General exception",
      201: "Invalid argument error",
      202: "Element cannot have children",
      203: "Element not an array, cannot have count",
      301: "Not initialized",
      401: "Not implemented error",
      402: "Invalid set value, element is a keyword",
      403: "Element is read only",
      404: "Element is write only",
      405: "Incorrect data type"
    };
    return errors[errorCode] || "Unknown error";
  }

  LMSGetDiagnostic(errorCode) {
    return this.LMSGetErrorString(errorCode);
  }

  async persistToServer(data) {
    await fetch("/api/scorm/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        learnerId: this.learner.id,
        scoId: this.sco.id,
        courseId: this.sco.courseId,
        data: data
      })
    });
  }
}
```

### 5.3 Content Launch System

How our LMS launches SCOs:

```javascript
// launch-sco.js

async function launchSCO(courseId, scoId, learnerId) {
  // 1. Fetch learner data and SCO tracking data
  const [learner, scoData] = await Promise.all([
    fetch(`/api/learners/${learnerId}`).then(r => r.json()),
    fetch(`/api/tracking/${learnerId}/${courseId}/${scoId}`).then(r => r.json())
  ]);

  // 2. Create the SCORM API instance
  const scormAPI = new ScormAPIProvider(learner, scoData);

  // 3. Expose API on the window (where SCOs will find it)
  // For SCORM 1.2:
  window.API = scormAPI;
  // For SCORM 2004:
  // window.API_1484_11 = scormAPI;

  // 4. Launch SCO in iframe or new window
  const scoFrame = document.getElementById("sco-frame");
  const scoUrl = `/courses/${courseId}/content/${scoData.href}`;
  scoFrame.src = scoUrl;
}
```

#### Launch Window Architecture

```
┌──────────────────────────────────────────────────┐
│  LMS Window (window.API lives here)              │
│                                                  │
│  ┌─────────────────────────────────────────────┐ │
│  │ Navigation Frame                             │ │
│  │ - Course title                               │ │
│  │ - TOC sidebar (from organizations)           │ │
│  │ - Progress indicators                        │ │
│  │                                              │ │
│  │  ┌────────────────────────────────────────┐  │ │
│  │  │ SCO Frame (iframe)                     │  │ │
│  │  │                                        │  │ │
│  │  │ The SCO content loads here.            │  │ │
│  │  │ It searches up via window.parent       │  │ │
│  │  │ to find window.API                     │  │ │
│  │  │                                        │  │ │
│  │  └────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 5.4 Server-Side Tracking & Storage

#### Database Schema (Core Tables)

```sql
-- Courses imported from SCORM packages
CREATE TABLE scorm_courses (
  id              UUID PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  scorm_version   VARCHAR(20) NOT NULL,  -- "1.2" or "2004"
  manifest_data   JSONB,                 -- Parsed manifest structure
  content_path    VARCHAR(500),          -- Server path to extracted content
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW()
);

-- Individual SCOs within a course
CREATE TABLE scorm_scos (
  id              UUID PRIMARY KEY,
  course_id       UUID REFERENCES scorm_courses(id),
  identifier      VARCHAR(255),          -- From manifest
  title           VARCHAR(255),
  href            VARCHAR(500),          -- Launch URL
  scorm_type      VARCHAR(10),           -- "sco" or "asset"
  sort_order      INTEGER,
  parent_id       UUID REFERENCES scorm_scos(id),  -- For tree structure
  prerequisites   TEXT,                  -- SCORM 1.2 prerequisites
  mastery_score   DECIMAL               -- Score needed to pass
);

-- Per-learner tracking data for each SCO
CREATE TABLE scorm_tracking (
  id              UUID PRIMARY KEY,
  learner_id      UUID NOT NULL,
  course_id       UUID REFERENCES scorm_courses(id),
  sco_id          UUID REFERENCES scorm_scos(id),

  -- Core tracking fields
  lesson_status   VARCHAR(20),           -- passed/completed/failed/incomplete/browsed/not attempted
  lesson_location VARCHAR(255),          -- Bookmark
  score_raw       DECIMAL,
  score_max       DECIMAL,
  score_min       DECIMAL,
  total_time      VARCHAR(20),           -- HHHH:MM:SS.SS
  suspend_data    TEXT,                  -- Up to 4096 chars for SCORM 1.2
  entry           VARCHAR(20),           -- ab-initio / resume
  exit_type       VARCHAR(20),           -- time-out / suspend / logout

  -- SCORM 2004 additions
  completion_status  VARCHAR(20),
  success_status     VARCHAR(20),
  progress_measure   DECIMAL,
  scaled_score       DECIMAL,

  -- Metadata
  attempt_count   INTEGER DEFAULT 0,
  first_accessed  TIMESTAMP,
  last_accessed   TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(learner_id, course_id, sco_id)
);

-- Individual interaction records (quiz responses, activities)
CREATE TABLE scorm_interactions (
  id              UUID PRIMARY KEY,
  tracking_id     UUID REFERENCES scorm_tracking(id),
  interaction_id  VARCHAR(255),          -- From SCO
  interaction_type VARCHAR(20),          -- true-false, choice, fill-in, etc.
  student_response TEXT,
  correct_pattern  TEXT,
  result          VARCHAR(20),           -- correct, wrong, neutral, numeric value
  weighting       DECIMAL,
  latency         VARCHAR(20),
  timestamp       TIMESTAMP,
  description     TEXT
);

-- Course enrolments
CREATE TABLE scorm_enrolments (
  id              UUID PRIMARY KEY,
  learner_id      UUID NOT NULL,
  course_id       UUID REFERENCES scorm_courses(id),
  enrolled_at     TIMESTAMP DEFAULT NOW(),
  completed_at    TIMESTAMP,
  overall_status  VARCHAR(20) DEFAULT 'not attempted',
  overall_score   DECIMAL
);
```

### 5.5 Server API Endpoints

```
POST   /api/scorm/import              Upload and import SCORM package
GET    /api/scorm/courses             List all courses
GET    /api/scorm/courses/:id         Get course details + structure
DELETE /api/scorm/courses/:id         Remove a course

POST   /api/scorm/enrol               Enrol learner in course
GET    /api/scorm/enrolments/:learnerId  Get learner's enrolments

GET    /api/scorm/launch/:courseId/:scoId  Get launch data for a SCO
POST   /api/scorm/tracking            Save runtime tracking data
GET    /api/scorm/tracking/:learnerId/:courseId  Get progress for a course
GET    /api/scorm/tracking/:learnerId/:courseId/:scoId  Get SCO-level data

GET    /api/scorm/reports/course/:courseId          Course completion report
GET    /api/scorm/reports/learner/:learnerId        Learner progress report
```

---

## 6. SCORM Error Codes

Our LMS must handle and return these correctly:

### SCORM 1.2 Error Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | No Error | Operation succeeded |
| 101 | General Exception | Unspecified error |
| 201 | Invalid Argument Error | Argument is not valid |
| 202 | Element Cannot Have Children | |
| 203 | Element Not An Array | Cannot have count |
| 301 | Not Initialized | API not initialized |
| 401 | Not Implemented Error | Element not in data model |
| 402 | Invalid Set Value | Element is a keyword |
| 403 | Element Is Read Only | Cannot write to this element |
| 404 | Element Is Write Only | Cannot read this element |
| 405 | Incorrect Data Type | Value type mismatch |

### SCORM 2004 Error Codes

| Code | Name |
|------|------|
| 0 | No Error |
| 101 | General Exception |
| 102 | General Initialization Failure |
| 103 | Already Initialized |
| 104 | Content Instance Terminated |
| 111 | General Termination Failure |
| 112 | Termination Before Initialization |
| 113 | Termination After Termination |
| 122 | Store Data Before Initialization |
| 123 | Store Data After Termination |
| 132 | Retrieve Data Before Initialization |
| 133 | Retrieve Data After Termination |
| 142 | Commit Before Initialization |
| 143 | Commit After Termination |
| 201 | General Argument Error |
| 301 | General Get Failure |
| 351 | General Set Failure |
| 391 | General Commit Failure |
| 401 | Undefined Data Model Element |
| 402 | Unimplemented Data Model Element |
| 403 | Data Model Element Value Not Initialized |
| 404 | Data Model Element Is Read Only |
| 405 | Data Model Element Is Write Only |
| 406 | Data Model Element Type Mismatch |
| 407 | Data Model Element Value Out Of Range |
| 408 | Data Model Dependency Not Established |

---

## 7. SCORM Conformance Levels

### For an LMS

To be "SCORM Conformant" our LMS must pass ADL's conformance test suite:

| Level | Requirements |
|-------|-------------|
| **LMS-RTE1** | Launch SCOs, provide API, support minimum data model |
| **LMS-RTE2** | All of RTE1 + interactions tracking |
| **LMS-RTE3** | All of RTE2 + full data model support |
| **LMS-CAM1** | Import content packages, parse manifests |
| **LMS-SN1** | (2004 only) Basic sequencing |

**Our target: LMS-RTE3 + LMS-CAM1** for SCORM 1.2 minimum.

---

## 8. SCORM Content Authoring

### How We Create SCORM Content for CP4807

Each worksheet becomes a SCORM SCO. Options for authoring:

#### Option A: HTML5 + JavaScript (Custom Build)

Build each worksheet as a web page that calls the SCORM API:

```html
<!-- ws1-first-program/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Worksheet 1: First Program</title>
  <script src="../shared/scorm-wrapper.js"></script>
  <link rel="stylesheet" href="../shared/worksheet.css"/>
</head>
<body>
  <div class="worksheet">
    <h1>Worksheet 1 - First Program</h1>

    <section class="intro">
      <p>This first program introduces you to OUTPUT, LOOP and DELAY commands.</p>
      <div class="video-embed">
        <iframe src="https://youtu.be/h8-7BsXBpLc"></iframe>
      </div>
    </section>

    <section class="challenges">
      <h2>Challenges</h2>

      <div class="challenge" data-id="ws1-c1">
        <h3>Challenge 1: Delay</h3>
        <p>Alter the delay period. Make sure you understand how the Delay command works.</p>
        <label>
          <input type="checkbox" onchange="markChallenge('ws1-c1', this.checked)"/>
          I have completed this challenge
        </label>
      </div>

      <div class="challenge" data-id="ws1-c2">
        <h3>Challenge 2: Output</h3>
        <p>Change the output to work with port A and port B.</p>
        <label>
          <input type="checkbox" onchange="markChallenge('ws1-c2', this.checked)"/>
          I have completed this challenge
        </label>
      </div>

      <!-- More challenges... -->
    </section>
  </div>

  <script>
    // Initialize SCORM on page load
    scorm.initialize();

    // Restore state if resuming
    const savedState = scorm.getSuspendData();
    if (savedState) {
      restoreChallengeState(JSON.parse(savedState));
    }

    function markChallenge(id, completed) {
      updateProgress();
      // Save state for resume
      scorm.setSuspendData(JSON.stringify(getChallengeState()));
      scorm.commit();
    }

    function updateProgress() {
      const total = document.querySelectorAll('.challenge').length;
      const done = document.querySelectorAll('.challenge input:checked').length;
      const score = Math.round((done / total) * 100);

      scorm.setScore(score, 100, 0);

      if (done === total) {
        scorm.setStatus("completed");
      } else if (done > 0) {
        scorm.setStatus("incomplete");
      }

      scorm.commit();
    }

    // Save and finish when leaving
    window.addEventListener("beforeunload", () => {
      scorm.finish();
    });
  </script>
</body>
</html>
```

#### SCORM Wrapper Library (for our content)

```javascript
// shared/scorm-wrapper.js
// Simplified wrapper around the raw SCORM API

const scorm = {
  api: null,
  version: null,

  initialize() {
    this.api = this.findAPI(window);
    if (!this.api) {
      console.warn("SCORM API not found - running standalone");
      return false;
    }

    this.version = this.api.LMSInitialize ? "1.2" : "2004";

    if (this.version === "1.2") {
      return this.api.LMSInitialize("") === "true";
    } else {
      return this.api.Initialize("") === "true";
    }
  },

  findAPI(win) {
    let attempts = 0;
    // Search for SCORM 1.2 API
    while (win && !win.API && win.parent && win.parent !== win && attempts < 100) {
      win = win.parent;
      attempts++;
    }
    if (win && win.API) return win.API;

    // Search for SCORM 2004 API
    win = window;
    attempts = 0;
    while (win && !win.API_1484_11 && win.parent && win.parent !== win && attempts < 100) {
      win = win.parent;
      attempts++;
    }
    if (win && win.API_1484_11) return win.API_1484_11;

    return null;
  },

  getValue(element) {
    if (!this.api) return "";
    return this.version === "1.2"
      ? this.api.LMSGetValue(element)
      : this.api.GetValue(element);
  },

  setValue(element, value) {
    if (!this.api) return;
    return this.version === "1.2"
      ? this.api.LMSSetValue(element, value)
      : this.api.SetValue(element, value);
  },

  setScore(raw, max, min) {
    if (this.version === "1.2") {
      this.setValue("cmi.core.score.raw", String(raw));
      this.setValue("cmi.core.score.max", String(max));
      this.setValue("cmi.core.score.min", String(min));
    } else {
      this.setValue("cmi.score.raw", String(raw));
      this.setValue("cmi.score.max", String(max));
      this.setValue("cmi.score.min", String(min));
      this.setValue("cmi.score.scaled", String(raw / max));
    }
  },

  setStatus(status) {
    if (this.version === "1.2") {
      this.setValue("cmi.core.lesson_status", status);
    } else {
      if (status === "completed" || status === "incomplete") {
        this.setValue("cmi.completion_status", status);
      }
      if (status === "passed" || status === "failed") {
        this.setValue("cmi.success_status", status);
      }
    }
  },

  getSuspendData() {
    return this.getValue("cmi.suspend_data");
  },

  setSuspendData(data) {
    this.setValue("cmi.suspend_data", data);
  },

  setLocation(location) {
    if (this.version === "1.2") {
      this.setValue("cmi.core.lesson_location", location);
    } else {
      this.setValue("cmi.location", location);
    }
  },

  commit() {
    if (!this.api) return;
    return this.version === "1.2"
      ? this.api.LMSCommit("")
      : this.api.Commit("");
  },

  finish() {
    if (!this.api) return;
    return this.version === "1.2"
      ? this.api.LMSFinish("")
      : this.api.Terminate("");
  }
};
```

#### Option B: Use an Authoring Tool

For faster content creation, author in a tool and export as SCORM:

| Tool | Cost | Output | Best For |
|------|------|--------|----------|
| **Articulate Storyline** | Paid | SCORM 1.2 / 2004 | Interactive simulations, quizzes |
| **Adobe Captivate** | Paid | SCORM 1.2 / 2004 | Software simulations |
| **iSpring Suite** | Paid | SCORM 1.2 / 2004 | PowerPoint to SCORM |
| **H5P** | Free/Open | SCORM via plugin | Interactive content types |
| **Adapt Learning** | Free/Open | SCORM 1.2 / 2004 | Responsive multi-device |
| **Xerte** | Free/Open | SCORM 1.2 | Academic/educational |

---

## 9. Testing SCORM Compliance

### Tools

- **ADL SCORM Test Suite**: Official conformance testing tool from ADL
- **SCORM Cloud** (Rustici Software): Upload packages to test compatibility
- **SCORM Again** (open source JS library): Reference implementation for client-side API

### Test Checklist for Our LMS

```
[ ] Package Import
    [ ] Accepts valid SCORM 1.2 ZIP packages
    [ ] Correctly parses imsmanifest.xml
    [ ] Rejects invalid/malformed packages with clear error
    [ ] Extracts and serves content files correctly
    [ ] Handles nested item structures (sub-chapters)
    [ ] Handles multiple organizations

[ ] API Availability
    [ ] window.API is discoverable from SCO iframe
    [ ] API persists across SCO navigation
    [ ] API handles concurrent sessions (multiple tabs)

[ ] Runtime Communication
    [ ] LMSInitialize/LMSFinish lifecycle works
    [ ] All cmi.core elements readable/writable per spec
    [ ] LMSCommit persists data to server
    [ ] Error codes returned correctly
    [ ] suspend_data preserved between sessions
    [ ] lesson_location bookmark works
    [ ] session_time accumulated into total_time

[ ] Tracking & Reporting
    [ ] lesson_status tracked per SCO
    [ ] Scores recorded and retrievable
    [ ] Interactions logged
    [ ] Course-level completion derived from SCO statuses
    [ ] Reports available for instructors

[ ] Content Delivery
    [ ] SCOs launch in correct frame/window
    [ ] Navigation between SCOs works
    [ ] Prerequisites enforced (if set)
    [ ] Content renders correctly (CSS, JS, media)
```

---

## 10. SCORM Alternatives & Complements

While SCORM is the standard we must support, be aware of these:

| Standard | Relationship to SCORM | Notes |
|----------|----------------------|-------|
| **xAPI (Experience API / Tin Can)** | SCORM successor | Tracks any learning experience, not just web content. Uses statements: "Actor did Verb on Object". More flexible but more complex. Consider as Phase 2. |
| **cmi5** | xAPI profile | Combines xAPI's flexibility with SCORM-like LMS launch. The "best of both worlds". |
| **LTI (Learning Tools Interoperability)** | Complementary | Launches external tools within an LMS. Not content packaging - tool integration. |
| **IMS Common Cartridge** | Alternative packaging | Content packaging standard from IMS Global. Used in higher education. |
| **AICC** | SCORM predecessor | Legacy standard. SCORM borrowed from it. Some old content uses AICC. |

### Recommended Roadmap

1. **Phase 1**: SCORM 1.2 (covers most content)
2. **Phase 2**: SCORM 2004 4th Edition (sequencing, richer data)
3. **Phase 3**: xAPI support (modern tracking beyond browser)
4. **Phase 4**: cmi5 (unified modern standard)
5. **Phase 5**: LTI 1.3 (tool integration)

---

## 11. Key Implementation Gotchas

### Things That Trip Up LMS Developers

1. **Window hierarchy**: SCOs search `window.parent` chain for the API. If you use nested iframes or pop-ups, the API must be findable. Test with different launch configurations.

2. **Cross-origin issues**: If SCO content is served from a different domain/port than the LMS, `window.parent.API` will throw a security error. Serve content from the same origin or use `postMessage` as a bridge.

3. **Session timing**: `cmi.core.session_time` uses format `HHHH:MM:SS.SS` (SCORM 1.2) or `P[yY][mM][dD]T[hH][nM][sS]` ISO 8601 duration (SCORM 2004). Parse and accumulate correctly.

4. **String return values**: All SCORM 1.2 API methods return strings. `LMSInitialize` returns `"true"` or `"false"` (strings, not booleans).

5. **`_count` is read-only**: `cmi.interactions._count` is maintained by the LMS, incremented when you set a new interaction index. Don't let SCOs write to it.

6. **`suspend_data` size limit**: 4096 characters in SCORM 1.2, 64000 in SCORM 2004. Some SCOs store entire state here. Enforce limits but be generous.

7. **Multiple `LMSInitialize` calls**: Some poorly-built SCOs call `Initialize` multiple times. Decide whether to return error or silently succeed.

8. **Browser unload**: SCOs should call `LMSFinish` but many don't. Use `beforeunload` / `unload` events as a fallback to commit data.

9. **SCORM packages with no SCOs**: Some packages contain only Assets. Handle gracefully - display content without expecting API calls.

10. **Character encoding**: Manifests may use different XML encodings. Always parse with encoding detection.

---

## 12. Applying SCORM to CP4807 Course Structure

### Mapping the Existing Course

```
CP4807 - Introduction to Microcontrollers (60-hour module)
│
├── Bronze (Fundamentals) ─────────── Organization Item (folder)
│   ├── WS1: First Program ────────── SCO (trackable)
│   ├── WS2: Performing Calculations ─ SCO
│   ├── WS3: Connection Points ─────── SCO
│   ├── WS4: Digital Inputs ────────── SCO
│   ├── WS5: Making Decisions ──────── SCO
│   ├── WS6: Macros / Subroutines ──── SCO
│   └── WS7: Using Prototype Boards ── SCO
│
├── Silver (Intermediate) ──────────── Organization Item (prereq: Bronze)
│   ├── WS8: Colour Graphical Displays ─ SCO
│   ├── WS9: Pin Interrupts ────────── SCO
│   └── WS10: Timer Interrupts ─────── SCO
│
├── Gold (Advanced) ────────────────── Organization Item (prereq: Silver)
│   ├── WS11: Touch Control Systems ── SCO
│   └── WS12: Web Mirror ──────────── SCO
│
├── Homework ──────────────────────── Organization Item
│   ├── HW1: Traffic Lights ────────── SCO
│   ├── HW2: Colour Displays ──────── SCO
│   ├── HW3: Light Sensor ─────────── SCO
│   ├── HW4: Accelerometer ────────── SCO
│   ├── HW5: Assessment Prep ──────── SCO
│   ├── HW6: Motor Control ────────── SCO
│   ├── HW7: Stopwatch ────────────── SCO
│   ├── HW8: Touch Screen ─────────── SCO
│   └── HW9-10: Project Planning ──── SCO
│
├── Assessments ───────────────────── Organization Item
│   ├── A1: Light Sensor Display ──── SCO (scored, mastery: 40%)
│   ├── A2: Temperature Controller ── SCO (scored, mastery: 40%)
│   └── A3: Touch Temp Controller ─── SCO (scored, mastery: 40%)
│
├── Final Project ─────────────────── SCO (scored)
│
└── Supporting Materials ──────────── Assets (not tracked)
    ├── Microcontroller Basics PDF ── Asset
    ├── E-blocks Introduction ─────── Asset
    ├── E-blocks Datasheet ────────── Asset
    ├── Flowcode Getting Started ──── Asset
    └── Media (50 image/diagram files) ─ Assets
```

### Grading Mapping to SCORM

| CP4807 Grade | SCORM Score Range | SCORM Status |
|-------------|-------------------|--------------|
| Bronze (Functional & Basic) | 40-59 | `passed` |
| Silver (Robust & Structured) | 60-79 | `passed` |
| Gold (Polished & Production-Ready) | 80-100 | `passed` |
| Below Bronze | 0-39 | `failed` |

### Per-Worksheet Interaction Tracking

Each worksheet's challenges map to SCORM interactions:

```javascript
// Example: Worksheet 4 - Digital Inputs has 3 challenge groups

// Challenge Group 1: Basic digital input
cmi.interactions.0.id = "ws4-basic-input"
cmi.interactions.0.type = "performance"
cmi.interactions.0.description = "Alter program for least significant input bit"
cmi.interactions.0.result = "correct"

// Challenge Group 2: Boolean logic
cmi.interactions.1.id = "ws4-boolean-logic"
cmi.interactions.1.type = "performance"
cmi.interactions.1.description = "Bit 7 lights when both bit0 AND bit1 are high"
cmi.interactions.1.result = "correct"

// Challenge Group 3: Logic operators
cmi.interactions.2.id = "ws4-logic-operators"
cmi.interactions.2.type = "performance"
cmi.interactions.2.description = "Experiment with OR, XOR, NOT operators"
cmi.interactions.2.result = "correct"
```

---

## 13. Summary: Implementation Checklist

### Must Have (SCORM 1.2 Compliance)

- [ ] ZIP package upload and extraction
- [ ] `imsmanifest.xml` parser (organizations, items, resources)
- [ ] Content file server (serve extracted HTML/CSS/JS/media)
- [ ] `window.API` object with all 8 methods
- [ ] API discovery works from nested iframes
- [ ] Full `cmi.core.*` data model support
- [ ] `cmi.suspend_data` and `cmi.launch_data` support
- [ ] `cmi.interactions` support
- [ ] Server-side persistence (tracking table per learner/SCO)
- [ ] Session time calculation and total time accumulation
- [ ] Course navigation tree from manifest organizations
- [ ] Error handling with correct SCORM error codes
- [ ] Learner enrolment and progress dashboard

### Should Have

- [ ] SCORM 2004 API (`API_1484_11`) support
- [ ] Sequencing rules engine (2004)
- [ ] Completion rollup (child SCOs to parent items)
- [ ] Instructor reporting dashboard
- [ ] Bulk import of multiple packages
- [ ] Content package validation before import
- [ ] Export learner data as CSV/reports

### Nice to Have

- [ ] xAPI support alongside SCORM
- [ ] LTI 1.3 integration
- [ ] SCORM package preview (test without enrolment)
- [ ] Content package editor (modify manifest without re-upload)
- [ ] Multi-language support via manifest metadata
- [ ] Offline/PWA support with sync-back

---

## 14. Reference Links & Resources

- **ADL SCORM Documentation**: adlnet.gov/scorm (official specs)
- **SCORM 1.2 Runtime Spec**: The definitive guide for API implementation
- **SCORM 2004 4th Ed Overview**: Full spec with sequencing
- **Rustici Software SCORM Docs**: scorm.com/scorm-explained (best practical guides)
- **SCORM Again (GitHub)**: Open source JS SCORM API library - good reference implementation
- **ADL SCORM Test Suite**: Official conformance testing tools
- **pipwerks SCORM Wrapper**: Popular open source JS wrapper library (reference for our wrapper)

---

*Document created: April 2026*
*For: Custom LMS Development Project*
*Course Reference: CP4807 - Introduction to Microcontrollers (BTEC Level 3 Engineering)*
