/**
 * SCORM 1.2 Runtime API Provider
 * Implements the full LMS-RTE3 conformance level
 *
 * This is the API object that SCOs discover and call.
 * Persistence is via localStorage (client-side LMS).
 * A server-backed LMS would replace persistToStorage/loadFromStorage.
 */

(function () {
  'use strict';

  // ===== ERROR CODES (SCORM 1.2) =====
  const ERROR = {
    NONE: 0,
    GENERAL: 101,
    INVALID_ARGUMENT: 201,
    ELEMENT_CANNOT_HAVE_CHILDREN: 202,
    ELEMENT_NOT_ARRAY: 203,
    NOT_INITIALIZED: 301,
    NOT_IMPLEMENTED: 401,
    INVALID_SET_KEYWORD: 402,
    READ_ONLY: 403,
    WRITE_ONLY: 404,
    INCORRECT_TYPE: 405
  };

  const ERROR_STRINGS = {
    0: 'No error',
    101: 'General exception',
    201: 'Invalid argument error',
    202: 'Element cannot have children',
    203: 'Element not an array – cannot have count',
    301: 'Not initialized',
    401: 'Not implemented error',
    402: 'Invalid set value, element is a keyword',
    403: 'Element is read only',
    404: 'Element is write only',
    405: 'Incorrect data type'
  };

  // ===== DATA MODEL DEFINITION =====
  // Defines every valid cmi element, its access mode, and type
  const DATA_MODEL = {
    // Core
    'cmi.core._children':        { access: 'read',  type: 'keyword', defaultValue: 'student_id,student_name,lesson_location,credit,lesson_status,entry,score,total_time,lesson_mode,exit,session_time' },
    'cmi.core.student_id':       { access: 'read',  type: 'string' },
    'cmi.core.student_name':     { access: 'read',  type: 'string' },
    'cmi.core.lesson_location':  { access: 'rw',    type: 'string',  maxLength: 255 },
    'cmi.core.credit':           { access: 'read',  type: 'vocab',   vocab: ['credit', 'no-credit'] },
    'cmi.core.lesson_status':    { access: 'rw',    type: 'vocab',   vocab: ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'] },
    'cmi.core.entry':            { access: 'read',  type: 'vocab',   vocab: ['ab-initio', 'resume', ''] },
    'cmi.core.score._children':  { access: 'read',  type: 'keyword', defaultValue: 'raw,min,max' },
    'cmi.core.score.raw':        { access: 'rw',    type: 'decimal' },
    'cmi.core.score.max':        { access: 'rw',    type: 'decimal' },
    'cmi.core.score.min':        { access: 'rw',    type: 'decimal' },
    'cmi.core.total_time':       { access: 'read',  type: 'timespan' },
    'cmi.core.lesson_mode':      { access: 'read',  type: 'vocab',   vocab: ['browse', 'normal', 'review'] },
    'cmi.core.exit':             { access: 'write', type: 'vocab',   vocab: ['time-out', 'suspend', 'logout', ''] },
    'cmi.core.session_time':     { access: 'write', type: 'timespan' },

    // Suspend & Launch
    'cmi.suspend_data':          { access: 'rw',    type: 'string',  maxLength: 4096 },
    'cmi.launch_data':           { access: 'read',  type: 'string',  maxLength: 4096 },

    // Comments
    'cmi.comments':              { access: 'rw',    type: 'string',  maxLength: 4096 },
    'cmi.comments_from_lms':     { access: 'read',  type: 'string',  maxLength: 4096 },

    // Student Data
    'cmi.student_data._children':       { access: 'read', type: 'keyword', defaultValue: 'mastery_score,max_time_allowed,time_limit_action' },
    'cmi.student_data.mastery_score':   { access: 'read', type: 'decimal' },
    'cmi.student_data.max_time_allowed':{ access: 'read', type: 'timespan' },
    'cmi.student_data.time_limit_action':{ access: 'read', type: 'vocab', vocab: ['exit,message', 'exit,no message', 'continue,message', 'continue,no message'] },

    // Student Preference
    'cmi.student_preference._children': { access: 'read', type: 'keyword', defaultValue: 'audio,language,speed,text' },
    'cmi.student_preference.audio':     { access: 'rw',   type: 'integer', range: [-1, 100] },
    'cmi.student_preference.language':  { access: 'rw',   type: 'string',  maxLength: 255 },
    'cmi.student_preference.speed':     { access: 'rw',   type: 'integer', range: [-100, 100] },
    'cmi.student_preference.text':      { access: 'rw',   type: 'integer', range: [-1, 1] },

    // Interactions (array-based, handled specially)
    'cmi.interactions._children':  { access: 'read', type: 'keyword', defaultValue: 'id,objectives,time,type,correct_responses,weighting,student_response,result,latency' },
    'cmi.interactions._count':     { access: 'read', type: 'integer' },

    // Objectives (array-based)
    'cmi.objectives._children':    { access: 'read', type: 'keyword', defaultValue: 'id,score,status' },
    'cmi.objectives._count':       { access: 'read', type: 'integer' }
  };

  // Interaction sub-elements definition
  const INTERACTION_CHILDREN = {
    'id':                         { access: 'write', type: 'string' },
    'objectives._count':          { access: 'read',  type: 'integer' },
    'objectives.n.id':            { access: 'write', type: 'string' },
    'time':                       { access: 'write', type: 'time' },
    'type':                       { access: 'write', type: 'vocab', vocab: ['true-false', 'choice', 'fill-in', 'matching', 'performance', 'sequencing', 'likert', 'numeric'] },
    'correct_responses._count':   { access: 'read',  type: 'integer' },
    'correct_responses.n.pattern':{ access: 'write', type: 'string' },
    'weighting':                  { access: 'write', type: 'decimal' },
    'student_response':           { access: 'write', type: 'string' },
    'result':                     { access: 'write', type: 'string' },
    'latency':                    { access: 'write', type: 'timespan' }
  };

  // Objective sub-elements
  const OBJECTIVE_CHILDREN = {
    'id':            { access: 'rw',   type: 'string' },
    'score._children':{ access: 'read', type: 'keyword', defaultValue: 'raw,min,max' },
    'score.raw':     { access: 'rw',   type: 'decimal' },
    'score.max':     { access: 'rw',   type: 'decimal' },
    'score.min':     { access: 'rw',   type: 'decimal' },
    'status':        { access: 'rw',   type: 'vocab', vocab: ['passed', 'completed', 'failed', 'incomplete', 'browsed', 'not attempted'] }
  };


  // ===== TIMESPAN UTILITIES =====
  function formatTimespan(totalMs) {
    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const hundredths = Math.floor((totalMs % 1000) / 10);
    return String(hours).padStart(4, '0') + ':' +
           String(minutes).padStart(2, '0') + ':' +
           String(seconds).padStart(2, '0') + '.' +
           String(hundredths).padStart(2, '0');
  }

  function parseTimespan(str) {
    if (!str || str === '') return 0;
    const match = str.match(/^(\d+):(\d{2}):(\d{2})(?:\.(\d{1,2}))?$/);
    if (!match) return 0;
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseInt(match[3], 10);
    const hundredths = match[4] ? parseInt(match[4].padEnd(2, '0'), 10) : 0;
    return ((hours * 3600) + (minutes * 60) + seconds) * 1000 + (hundredths * 10);
  }

  function addTimespans(t1, t2) {
    return formatTimespan(parseTimespan(t1) + parseTimespan(t2));
  }


  // ===== SCORM API CLASS =====
  class ScormAPI {
    constructor() {
      this._initialized = false;
      this._terminated = false;
      this._lastError = ERROR.NONE;
      this._data = {};
      this._dirty = {};
      this._sessionStart = null;
      this._interactionCount = 0;
      this._objectiveCount = 0;
      this._currentSCO = null;

      // Event callbacks the LMS UI can hook into
      this.onInitialize = null;
      this.onFinish = null;
      this.onCommit = null;
      this.onSetValue = null;
    }

    // ----- Session Management -----

    LMSInitialize(param) {
      if (param !== '') {
        this._lastError = ERROR.INVALID_ARGUMENT;
        return 'false';
      }
      if (this._initialized && !this._terminated) {
        // Already initialized - SCORM 1.2 doesn't define 103,
        // some LMSes allow re-init, we'll allow it gracefully
        this._lastError = ERROR.NONE;
        return 'true';
      }

      this._initialized = true;
      this._terminated = false;
      this._lastError = ERROR.NONE;
      this._sessionStart = new Date();
      this._dirty = {};

      // Load persisted data for current SCO
      this._loadSCOData();

      // Fire callback
      if (this.onInitialize) this.onInitialize(this._currentSCO);

      return 'true';
    }

    LMSFinish(param) {
      if (param !== '') {
        this._lastError = ERROR.INVALID_ARGUMENT;
        return 'false';
      }
      if (!this._initialized) {
        this._lastError = ERROR.NOT_INITIALIZED;
        return 'false';
      }

      // Calculate session time if not already set
      if (!this._dirty['cmi.core.session_time'] && this._sessionStart) {
        const elapsed = new Date() - this._sessionStart;
        this._data['cmi.core.session_time'] = formatTimespan(elapsed);
      }

      // Add session_time to total_time
      const sessionTime = this._data['cmi.core.session_time'] || '0000:00:00.00';
      const totalTime = this._data['cmi.core.total_time'] || '0000:00:00.00';
      this._data['cmi.core.total_time'] = addTimespans(totalTime, sessionTime);

      // Handle exit mode
      const exitMode = this._data['cmi.core.exit'] || '';
      if (exitMode === 'suspend') {
        this._data['cmi.core.entry'] = 'resume';
      } else {
        this._data['cmi.core.entry'] = '';
      }

      // Persist
      this._commitToStorage();

      this._initialized = false;
      this._terminated = true;
      this._lastError = ERROR.NONE;

      if (this.onFinish) this.onFinish(this._currentSCO);

      return 'true';
    }

    // ----- Data Transfer -----

    LMSGetValue(element) {
      if (!this._initialized) {
        this._lastError = ERROR.NOT_INITIALIZED;
        return '';
      }

      if (!element || typeof element !== 'string') {
        this._lastError = ERROR.INVALID_ARGUMENT;
        return '';
      }

      // Handle _count for interactions
      if (element === 'cmi.interactions._count') {
        this._lastError = ERROR.NONE;
        return String(this._interactionCount);
      }

      if (element === 'cmi.objectives._count') {
        this._lastError = ERROR.NONE;
        return String(this._objectiveCount);
      }

      // Handle array sub-element counts
      const interactionMatch = element.match(/^cmi\.interactions\.(\d+)\.objectives\._count$/);
      if (interactionMatch) {
        this._lastError = ERROR.NONE;
        const key = element;
        return String(this._data[key] || 0);
      }

      const correctResponseMatch = element.match(/^cmi\.interactions\.(\d+)\.correct_responses\._count$/);
      if (correctResponseMatch) {
        this._lastError = ERROR.NONE;
        return String(this._data[element] || 0);
      }

      // Check static data model
      const def = this._getElementDef(element);
      if (!def) {
        this._lastError = ERROR.NOT_IMPLEMENTED;
        return '';
      }

      // Check write-only
      if (def.access === 'write') {
        this._lastError = ERROR.WRITE_ONLY;
        return '';
      }

      // Return default for keywords
      if (def.type === 'keyword' && def.defaultValue !== undefined) {
        this._lastError = ERROR.NONE;
        return def.defaultValue;
      }

      this._lastError = ERROR.NONE;
      const val = this._data[element];
      return val !== undefined ? String(val) : '';
    }

    LMSSetValue(element, value) {
      if (!this._initialized) {
        this._lastError = ERROR.NOT_INITIALIZED;
        return 'false';
      }

      if (!element || typeof element !== 'string') {
        this._lastError = ERROR.INVALID_ARGUMENT;
        return 'false';
      }

      if (value === undefined || value === null) {
        this._lastError = ERROR.INVALID_ARGUMENT;
        return 'false';
      }

      value = String(value);

      // Handle interaction array elements
      const interactionMatch = element.match(/^cmi\.interactions\.(\d+)\.(.+)$/);
      if (interactionMatch) {
        const idx = parseInt(interactionMatch[1], 10);
        const subElement = interactionMatch[2];

        // Auto-expand count
        if (idx >= this._interactionCount) {
          this._interactionCount = idx + 1;
        }

        // Handle nested objectives and correct_responses
        const objMatch = subElement.match(/^objectives\.(\d+)\.(.+)$/);
        if (objMatch) {
          const countKey = `cmi.interactions.${idx}.objectives._count`;
          const objIdx = parseInt(objMatch[1], 10);
          if (objIdx >= (this._data[countKey] || 0)) {
            this._data[countKey] = objIdx + 1;
          }
        }

        const crMatch = subElement.match(/^correct_responses\.(\d+)\.(.+)$/);
        if (crMatch) {
          const countKey = `cmi.interactions.${idx}.correct_responses._count`;
          const crIdx = parseInt(crMatch[1], 10);
          if (crIdx >= (this._data[countKey] || 0)) {
            this._data[countKey] = crIdx + 1;
          }
        }

        this._data[element] = value;
        this._dirty[element] = value;
        this._lastError = ERROR.NONE;
        if (this.onSetValue) this.onSetValue(element, value);
        return 'true';
      }

      // Handle objective array elements
      const objectiveMatch = element.match(/^cmi\.objectives\.(\d+)\.(.+)$/);
      if (objectiveMatch) {
        const idx = parseInt(objectiveMatch[1], 10);
        if (idx >= this._objectiveCount) {
          this._objectiveCount = idx + 1;
        }
        this._data[element] = value;
        this._dirty[element] = value;
        this._lastError = ERROR.NONE;
        if (this.onSetValue) this.onSetValue(element, value);
        return 'true';
      }

      // Check static data model
      const def = this._getElementDef(element);
      if (!def) {
        this._lastError = ERROR.NOT_IMPLEMENTED;
        return 'false';
      }

      // Check read-only
      if (def.access === 'read') {
        this._lastError = ERROR.READ_ONLY;
        return 'false';
      }

      // Check keyword
      if (def.type === 'keyword') {
        this._lastError = ERROR.INVALID_SET_KEYWORD;
        return 'false';
      }

      // Validate value
      if (!this._validateValue(def, value)) {
        this._lastError = ERROR.INCORRECT_TYPE;
        return 'false';
      }

      this._data[element] = value;
      this._dirty[element] = value;
      this._lastError = ERROR.NONE;

      if (this.onSetValue) this.onSetValue(element, value);
      return 'true';
    }

    LMSCommit(param) {
      if (param !== '') {
        this._lastError = ERROR.INVALID_ARGUMENT;
        return 'false';
      }
      if (!this._initialized) {
        this._lastError = ERROR.NOT_INITIALIZED;
        return 'false';
      }

      this._commitToStorage();
      this._dirty = {};
      this._lastError = ERROR.NONE;

      if (this.onCommit) this.onCommit(this._currentSCO, this._data);
      return 'true';
    }

    // ----- Error Handling -----

    LMSGetLastError() {
      return String(this._lastError);
    }

    LMSGetErrorString(errorCode) {
      const code = parseInt(errorCode, 10);
      return ERROR_STRINGS[code] || 'Unknown error code';
    }

    LMSGetDiagnostic(errorCode) {
      if (errorCode === '' || errorCode === undefined) {
        return ERROR_STRINGS[this._lastError] || '';
      }
      const code = parseInt(errorCode, 10);
      return ERROR_STRINGS[code] || 'No diagnostic available';
    }

    // ----- SCO Management (called by LMS, not by SCOs) -----

    /**
     * Configure the API for a specific SCO before launch.
     * Called by the LMS framework, not by SCOs.
     */
    configureSCO(scoId, learnerData, launchData) {
      this._currentSCO = scoId;
      this._data = {};
      this._dirty = {};
      this._interactionCount = 0;
      this._objectiveCount = 0;
      this._initialized = false;
      this._terminated = false;
      this._lastError = ERROR.NONE;

      // Set read-only learner data
      this._data['cmi.core.student_id'] = learnerData.id || 'student-001';
      this._data['cmi.core.student_name'] = learnerData.name || 'Student, Default';
      this._data['cmi.core.credit'] = learnerData.credit || 'credit';
      this._data['cmi.core.lesson_mode'] = learnerData.mode || 'normal';
      this._data['cmi.launch_data'] = launchData || '';
      this._data['cmi.comments_from_lms'] = '';
      this._data['cmi.student_data.mastery_score'] = '';
      this._data['cmi.student_data.max_time_allowed'] = '';
      this._data['cmi.student_data.time_limit_action'] = '';

      // Defaults
      this._data['cmi.core.total_time'] = '0000:00:00.00';
      this._data['cmi.core.lesson_status'] = 'not attempted';
      this._data['cmi.core.entry'] = 'ab-initio';
      this._data['cmi.core.score.raw'] = '';
      this._data['cmi.core.score.max'] = '';
      this._data['cmi.core.score.min'] = '';
      this._data['cmi.suspend_data'] = '';
      this._data['cmi.core.lesson_location'] = '';
      this._data['cmi.comments'] = '';

      // Student preferences
      this._data['cmi.student_preference.audio'] = '0';
      this._data['cmi.student_preference.language'] = '';
      this._data['cmi.student_preference.speed'] = '0';
      this._data['cmi.student_preference.text'] = '0';
    }

    // ----- Internal Methods -----

    _getElementDef(element) {
      // Direct match
      if (DATA_MODEL[element]) return DATA_MODEL[element];

      // Check interaction sub-elements: cmi.interactions.n.xxx
      const iMatch = element.match(/^cmi\.interactions\.\d+\.(.+)$/);
      if (iMatch) {
        const sub = iMatch[1];
        // Normalise: objectives.0.id -> objectives.n.id
        const normSub = sub.replace(/\.\d+\./g, '.n.');
        if (INTERACTION_CHILDREN[normSub]) return INTERACTION_CHILDREN[normSub];
        if (INTERACTION_CHILDREN[sub]) return INTERACTION_CHILDREN[sub];
      }

      // Check objective sub-elements: cmi.objectives.n.xxx
      const oMatch = element.match(/^cmi\.objectives\.\d+\.(.+)$/);
      if (oMatch) {
        const sub = oMatch[1];
        if (OBJECTIVE_CHILDREN[sub]) return OBJECTIVE_CHILDREN[sub];
      }

      return null;
    }

    _validateValue(def, value) {
      switch (def.type) {
        case 'string':
          if (def.maxLength && value.length > def.maxLength) return false;
          return true;

        case 'vocab':
          return def.vocab.includes(value);

        case 'decimal':
          return value === '' || !isNaN(parseFloat(value));

        case 'integer':
          if (value === '') return true;
          const num = parseInt(value, 10);
          if (isNaN(num)) return false;
          if (def.range && (num < def.range[0] || num > def.range[1])) return false;
          return true;

        case 'timespan':
          return value === '' || /^\d{2,4}:\d{2}:\d{2}(\.\d{1,2})?$/.test(value);

        case 'time':
          return value === '' || /^\d{2}:\d{2}:\d{2}(\.\d{1,2})?$/.test(value);

        default:
          return true;
      }
    }

    _getStorageKey() {
      const learnerId = this._data['cmi.core.student_id'] || 'default';
      return `scorm_${learnerId}_${this._currentSCO}`;
    }

    _loadSCOData() {
      try {
        const key = this._getStorageKey();
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Merge stored data, preserving read-only values already set
          const readOnlyKeys = [
            'cmi.core.student_id', 'cmi.core.student_name',
            'cmi.core.credit', 'cmi.core.lesson_mode',
            'cmi.launch_data', 'cmi.comments_from_lms'
          ];

          for (const [k, v] of Object.entries(parsed)) {
            if (!readOnlyKeys.includes(k)) {
              this._data[k] = v;
            }
          }

          // Restore interaction count
          if (parsed._interactionCount) this._interactionCount = parsed._interactionCount;
          if (parsed._objectiveCount) this._objectiveCount = parsed._objectiveCount;

          // Set entry to resume if there's suspend data or previous session
          if (this._data['cmi.suspend_data'] || this._data['cmi.core.lesson_location']) {
            this._data['cmi.core.entry'] = 'resume';
          }
        }
      } catch (e) {
        console.warn('SCORM: Failed to load stored data', e);
      }
    }

    _commitToStorage() {
      try {
        const key = this._getStorageKey();
        const toStore = { ...this._data };
        toStore._interactionCount = this._interactionCount;
        toStore._objectiveCount = this._objectiveCount;
        toStore._lastCommit = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(toStore));
      } catch (e) {
        console.warn('SCORM: Failed to persist data', e);
      }
    }

    /**
     * Utility: get all tracking data for reporting
     */
    getAllData() {
      return { ...this._data };
    }

    /**
     * Utility: check if currently in a session
     */
    isInitialized() {
      return this._initialized;
    }
  }

  // ===== EXPOSE GLOBALLY =====
  // SCORM 1.2 requires window.API
  window.ScormAPI = ScormAPI;

})();
