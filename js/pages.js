// ===== PAGE RENDERERS =====

function renderHomePage() {
  const verse = getDailyVerse();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return `
    <div class="page active" id="page-home">
      <h1 class="home-greeting">${greeting}, Pastor Rick!</h1>
      <p class="home-blessing">The Lord bless you and keep you today.</p>

      <div class="daily-verse-card">
        <div class="dv-speak" onclick="speakText('${verse.ref}. ${verse.text.replace(/'/g, "\\'")}')">
          <span class="material-icons-round">volume_up</span>
        </div>
        <div class="dv-label"><span class="material-icons-round" style="font-size:16px;">auto_awesome</span> Daily Verse</div>
        <div class="dv-ref">${verse.ref}</div>
        <div class="dv-text">"${verse.text}"</div>
      </div>

      <h2 style="font-size:20px;font-weight:800;margin-bottom:16px;">What would you like to do?</h2>
      <div class="feature-grid">
        <button class="feature-btn" onclick="navigateTo('sermon-builder')">
          <div class="feature-btn-icon" style="background:rgba(109,40,217,0.1);">
            <span class="material-icons-round" style="color:#6D28D9;font-size:28px;">menu_book</span>
          </div>
          <div class="feature-btn-title">Sermon Builder</div>
          <div class="feature-btn-desc">Build powerful sermons with AI help</div>
        </button>
        <button class="feature-btn" onclick="navigateTo('preach-mode')">
          <div class="feature-btn-icon" style="background:rgba(239,68,68,0.1);">
            <span class="material-icons-round" style="color:#EF4444;font-size:28px;">mic</span>
          </div>
          <div class="feature-btn-title">Preach Mode</div>
          <div class="feature-btn-desc">Preach with AI assistant by your side</div>
        </button>
        <button class="feature-btn" onclick="navigateTo('confidence-coach')">
          <div class="feature-btn-icon" style="background:rgba(212,175,55,0.1);">
            <span class="material-icons-round" style="color:#D4AF37;font-size:28px;">person</span>
          </div>
          <div class="feature-btn-title">Confidence Coach</div>
          <div class="feature-btn-desc">Practice with your AI coach</div>
        </button>
        <button class="feature-btn" onclick="navigateTo('devotional')">
          <div class="feature-btn-icon" style="background:rgba(34,197,94,0.1);">
            <span class="material-icons-round" style="color:#22C55E;font-size:28px;">favorite</span>
          </div>
          <div class="feature-btn-title">Devotional</div>
          <div class="feature-btn-desc">Generate devotionals from any verse</div>
        </button>
      </div>

      <div class="card" style="background:linear-gradient(135deg,#FEFBF4,#F5EFE0);border:1px dashed #D4AF37;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span class="material-icons-round" style="color:#D4AF37;">lightbulb</span>
          <span style="font-weight:800;font-size:16px;">Quick Tip</span>
        </div>
        <p class="card-desc">Start with the Sermon Builder to prepare your message, then use Preach Mode to deliver it with confidence. Your Confidence Coach is always here to help you practice!</p>
      </div>
    </div>
  `;
}

function renderSermonBuilderPage() {
  const categories = Object.keys(SERMON_TOPICS);
  let topicOptionsHTML = '<option value="">-- Select a Topic --</option>';
  categories.forEach(cat => {
    topicOptionsHTML += `<optgroup label="${cat}">`;
    SERMON_TOPICS[cat].forEach(t => {
      topicOptionsHTML += `<option value="${t}">${t}</option>`;
    });
    topicOptionsHTML += '</optgroup>';
  });
  topicOptionsHTML += '<option value="__custom__">✏️ Other (Type Your Own)</option>';

  return `
    <div class="page active" id="page-sermon-builder">
      <h1 class="page-title">Sermon Builder</h1>
      <p class="page-subtitle">Choose a topic, set your time, and let AI help you build a powerful sermon.</p>

      <div class="card" style="margin-bottom:20px;">
        <div class="input-group">
          <label class="input-label">Sermon Topic (60+ to choose from)</label>
          <select class="input-field" id="sb-topic" onchange="handleTopicChange()">
            ${topicOptionsHTML}
          </select>
        </div>
        <div class="input-group" id="sb-custom-topic-group" style="display:none;">
          <label class="input-label">Your Custom Topic</label>
          <input type="text" class="input-field" id="sb-custom-topic" placeholder="e.g., God's Faithfulness in Trials" />
        </div>
        <div class="input-group">
          <label class="input-label">Event Type</label>
          <select class="input-field" id="sb-event">
            <option value="general">General Sermon / Preaching</option>
            <option value="funeral">Funeral / Homegoing Service</option>
            <option value="wedding">Wedding Ceremony</option>
            <option value="baptism">Baptism Service</option>
            <option value="baby-dedication">Baby Dedication</option>
            <option value="birthday">Birthday Celebration</option>
            <option value="anniversary">Anniversary Celebration</option>
            <option value="graduation">Graduation Ceremony</option>
            <option value="new-year">New Year Service</option>
            <option value="revival">Revival Service</option>
            <option value="communion">Communion / Lord's Supper</option>
            <option value="ordination">Ordination Service</option>
          </select>
        </div>
        <div class="input-group">
          <label class="input-label">How long will you speak? <strong id="sb-duration-val">15 minutes</strong></label>
          <input type="range" class="duration-slider" id="sb-duration" min="5" max="60" value="15" step="5" oninput="document.getElementById('sb-duration-val').textContent=this.value+' minutes'" />
          <div class="duration-labels"><span>5 min</span><span>30 min</span><span>60 min</span></div>
        </div>
        <button class="btn btn-primary" id="sb-generate-btn" onclick="generateSermon()" style="width:100%;">
          <span class="material-icons-round">auto_awesome</span> Generate Sermon
        </button>
      </div>

      <div id="sb-output"></div>
    </div>
  `;
}

function renderSermonOutput(data) {
  let html = `
    <div class="sermon-output">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h2 style="font-size:22px;font-weight:900;">${data.title}</h2>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-sm btn-secondary" onclick="speakSermon()"><span class="material-icons-round" style="font-size:16px;">volume_up</span> Listen</button>
          <button class="btn btn-sm btn-gold" onclick="saveCurrentSermon()"><span class="material-icons-round" style="font-size:16px;">save</span> Save</button>
        </div>
      </div>
      <div style="display:flex;gap:8px;margin-bottom:16px;">
        <span class="badge badge-purple">${data.duration} minutes</span>
        <span class="badge badge-green">ESV Primary</span>
      </div>

      <div class="sermon-section">
        <div class="sermon-section-header">
          <div class="sermon-section-title"><span class="material-icons-round" style="color:#6D28D9;">play_arrow</span> Introduction</div>
        </div>
        <div class="sermon-section-body">${makeWordsClickable(data.outline.introduction)}</div>
      </div>
  `;

  data.outline.points.forEach((pt, i) => {
    html += `
      <div class="sermon-section">
        <div class="sermon-section-header">
          <div class="sermon-section-title"><span class="material-icons-round" style="color:#D4AF37;">bookmark</span> ${pt.title}</div>
        </div>
        <div class="sermon-section-body">
          ${makeWordsClickable(pt.content)}
          ${pt.verse ? `
            <div class="verse-card">
              <div class="verse-ref">${pt.verse.ref}</div>
              <div class="verse-text">"${pt.verse.text}"</div>
              <div class="verse-version">${pt.verse.version || 'ESV'}</div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  html += `
      <div class="sermon-section">
        <div class="sermon-section-header">
          <div class="sermon-section-title"><span class="material-icons-round" style="color:#22C55E;">flag</span> Closing & Altar Call</div>
        </div>
        <div class="sermon-section-body">${makeWordsClickable(data.outline.closing)}</div>
      </div>

      <div class="sermon-section">
        <div class="sermon-section-header">
          <div class="sermon-section-title"><span class="material-icons-round" style="color:#6D28D9;">collections_bookmark</span> Key Verses</div>
        </div>
        <div class="sermon-section-body">
          ${data.keyVerses.map(v => `
            <div class="verse-card">
              <div class="verse-ref">${v.ref}</div>
              <div class="verse-text">"${v.text}"</div>
              <div class="verse-version">${v.version || 'ESV'}</div>
            </div>
          `).join('')}
        </div>
      </div>

      ${data.examples ? `
        <div class="sermon-section">
          <div class="sermon-section-header">
            <div class="sermon-section-title"><span class="material-icons-round" style="color:#F59E0B;">tips_and_updates</span> Examples & Illustrations</div>
          </div>
          <div class="sermon-section-body">
            <ul style="padding-left:20px;">
              ${data.examples.map(e => `<li style="margin-bottom:8px;">${makeWordsClickable(e)}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  return html;
}

function renderPreachModePage() {
  const sermons = loadSermons();
  let sermonOptions = '<option value="">-- Select a saved sermon --</option>';
  sermons.forEach(s => {
    sermonOptions += `<option value="${s.id}">${s.title} (${s.duration} min)</option>`;
  });

  return `
    <div class="page active" id="page-preach-mode">
      <h1 class="page-title">Preach Mode</h1>
      <p class="page-subtitle">Your sermon notes on the left, AI assistant on the right. Preach with confidence!</p>

      <div class="card" style="margin-bottom:20px;">
        <div class="input-group" style="margin-bottom:12px;">
          <label class="input-label">Load a Saved Sermon</label>
          <select class="input-field" id="pm-sermon-select" onchange="loadSermonForPreach()">
            ${sermonOptions}
          </select>
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" id="pm-start-btn" onclick="startPreachMode()">
            <span class="material-icons-round">play_arrow</span> Start Preaching
          </button>
          <button class="btn btn-danger" id="pm-stop-btn" onclick="stopPreachMode()" style="display:none;">
            <span class="material-icons-round">stop</span> Stop
          </button>
        </div>
      </div>

      <div id="pm-container" style="display:none;">
        <div class="preach-container">
          <div class="preach-notes" id="pm-notes">
            <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;">Sermon Notes</h3>
            <p style="color:var(--text-muted);">Select a sermon above to load your notes here.</p>
          </div>
          <div class="preach-assistant">
            <div class="preach-timer">
              <button class="btn-icon" style="background:var(--cream-dark);" onclick="togglePreachTimer()">
                <span class="material-icons-round" id="pm-timer-icon">play_arrow</span>
              </button>
              <div class="preach-timer-display" id="pm-timer">00:00</div>
              <span class="badge badge-purple" id="pm-timer-target"></span>
            </div>

            <button class="hs-btn" onclick="triggerHolySpirit()">
              <span class="material-icons-round">whatshot</span> Holy Spirit Mode
            </button>

            <h3 style="font-size:16px;font-weight:800;margin:16px 0 10px;">AI Suggestions</h3>
            <div class="preach-suggestions" id="pm-suggestions">
              <div class="suggestion-card">
                <div class="suggestion-label">Getting Started</div>
                <div class="suggestion-text">Start preaching and I'll suggest supporting verses, next points, and structure reminders in real time.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${sermons.length === 0 ? `
        <div class="empty-state">
          <span class="material-icons-round">description</span>
          <h3>No Saved Sermons Yet</h3>
          <p>Build a sermon first using the Sermon Builder, then come back here to preach it!</p>
          <button class="btn btn-primary" style="margin-top:16px;" onclick="navigateTo('sermon-builder')">Go to Sermon Builder</button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderConfidenceCoachPage() {
  return `
    <div class="page active" id="page-confidence-coach">
      <h1 class="page-title">Confidence Coach</h1>
      <p class="page-subtitle">Your personal AI coach — practice sermons, get feedback, and build confidence.</p>

      <div class="coach-hero">
        <span class="material-icons-round" style="font-size:48px;color:var(--purple);margin-bottom:12px;">person</span>
        <h2>Talk to Your Coach</h2>
        <p>Tap the button below to start a live voice conversation with your AI Confidence Coach. Practice sermons, get feedback, study Scripture, or just talk through ideas.</p>
        <button class="coach-call-btn" id="coach-call-btn" onclick="toggleCoachCall()">
          <span class="material-icons-round">call</span>
          <span id="coach-call-text">Start Coaching Session</span>
        </button>
        <div class="coach-status" id="coach-status">
          <div class="status-dot disconnected" id="coach-status-dot"></div>
          <span id="coach-status-text">Ready to connect</span>
        </div>
      </div>

      <div id="coach-transcript" style="display:none;" class="card" style="margin-bottom:20px;">
        <h3 style="font-size:16px;font-weight:800;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:var(--purple);">subtitles</span> Live Transcript
        </h3>
        <div id="coach-transcript-content" style="max-height:200px;overflow-y:auto;font-size:var(--font-base);line-height:1.8;color:var(--text-muted);"></div>
      </div>

      <div class="coach-features">
        <div class="coach-feature-card">
          <span class="material-icons-round">record_voice_over</span>
          <h4>Sermon Practice</h4>
          <p>Practice your sermon out loud and get real-time feedback on pacing, clarity, and confidence.</p>
        </div>
        <div class="coach-feature-card">
          <span class="material-icons-round">school</span>
          <h4>Bible Teaching</h4>
          <p>Ask about any Bible word, verse, or concept. Your coach explains everything in simple terms.</p>
        </div>
        <div class="coach-feature-card">
          <span class="material-icons-round">emoji_events</span>
          <h4>Encouragement</h4>
          <p>Your coach always builds you up. Remember — God doesn't call the qualified, He qualifies the called!</p>
        </div>
        <div class="coach-feature-card">
          <span class="material-icons-round">edit_note</span>
          <h4>Sermon Prep Help</h4>
          <p>Talk through your sermon ideas and get help organizing your thoughts into a clear structure.</p>
        </div>
      </div>

      <div class="card" style="margin-top:24px;background:linear-gradient(135deg,#FEFBF4,#F5EFE0);border:1px dashed #D4AF37;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <span class="material-icons-round" style="color:#D4AF37;">format_quote</span>
          <span style="font-weight:800;">Remember, Pastor Rick</span>
        </div>
        <p style="font-size:var(--font-base);line-height:1.6;font-style:italic;color:var(--text-muted);">
          "For God gave us a spirit not of fear but of power and love and self-control." — 2 Timothy 1:7 (ESV)
        </p>
      </div>
    </div>
  `;
}

function renderDevotionalPage() {
  const shortcuts = [
    "John 3:16", "Psalm 23:1", "Philippians 4:13", "Romans 8:28",
    "Jeremiah 29:11", "Isaiah 41:10", "Proverbs 3:5-6", "2 Timothy 1:7",
    "Psalm 46:1", "Matthew 28:20", "Hebrews 11:1", "Romans 8:31"
  ];

  return `
    <div class="page active" id="page-devotional">
      <h1 class="page-title">Devotional Generator</h1>
      <p class="page-subtitle">Enter any Bible verse and get a complete devotional with reflection questions.</p>

      <div class="card" style="margin-bottom:20px;">
        <div class="input-group">
          <label class="input-label">Bible Verse</label>
          <input type="text" class="input-field" id="devo-verse" placeholder="e.g., John 3:16 or Psalm 23:1-6" />
        </div>
        <div style="margin-bottom:16px;">
          <label class="input-label" style="margin-bottom:8px;">Quick Pick a Verse</label>
          <div class="verse-shortcuts">
            ${shortcuts.map(v => `<button class="verse-shortcut" onclick="document.getElementById('devo-verse').value='${v}'">${v}</button>`).join('')}
          </div>
        </div>
        <button class="btn btn-primary" id="devo-generate-btn" onclick="generateDevotional()" style="width:100%;">
          <span class="material-icons-round">favorite</span> Generate Devotional
        </button>
      </div>

      <div id="devo-output"></div>
    </div>
  `;
}

function renderDevotionalOutput(data) {
  return `
    <div class="devotional-output">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h2 style="font-size:22px;font-weight:900;">Devotional: ${data.verse}</h2>
        <button class="btn btn-sm btn-secondary" onclick="speakText(document.getElementById('devo-text').textContent)">
          <span class="material-icons-round" style="font-size:16px;">volume_up</span> Listen
        </button
>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3 style="font-size:16px;font-weight:800;margin-bottom:8px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:var(--purple);">auto_stories</span> Devotional
        </h3>
        <p id="devo-text" style="font-size:var(--font-base);line-height:1.8;color:var(--text-secondary);">${makeWordsClickable(data.devotional)}</p>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3 style="font-size:16px;font-weight:800;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:#D4AF37;">help_outline</span> Reflection Questions
        </h3>
        <ol style="padding-left:20px;">
          ${data.reflectionQuestions.map(q => `<li style="margin-bottom:10px;font-size:var(--font-base);line-height:1.6;">${q}</li>`).join('')}
        </ol>
      </div>

      <div class="card" style="margin-bottom:16px;">
        <h3 style="font-size:16px;font-weight:800;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:#22C55E;">chat</span> Talking Points for Sharing
        </h3>
        <ul style="padding-left:20px;">
          ${data.talkingPoints.map(t => `<li style="margin-bottom:10px;font-size:var(--font-base);line-height:1.6;">${t}</li>`).join('')}
        </ul>
      </div>

      <button class="btn btn-gold" onclick="saveCurrentDevotional()" style="width:100%;">
        <span class="material-icons-round">save</span> Save Devotional
      </button>
    </div>
  `;
}

function renderSettingsPage() {
  const settings = loadSettings();
  return `
    <div class="page active" id="page-settings">
      <h1 class="page-title">Settings</h1>
      <p class="page-subtitle">Customize your app experience.</p>

      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:var(--purple);">menu_book</span> Bible Versions
        </h3>
        <div class="settings-option">
          <div>
            <div class="settings-label">ESV (Primary)</div>
            <div class="settings-desc">English Standard Version — clear, accurate</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-esv" ${settings.bibleVersions.ESV ? 'checked' : ''} onchange="updateBibleVersion('ESV', this.checked)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-option">
          <div>
            <div class="settings-label">NIV</div>
            <div class="settings-desc">New International Version — easy to read</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-niv" ${settings.bibleVersions.NIV ? 'checked' : ''} onchange="updateBibleVersion('NIV', this.checked)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-option">
          <div>
            <div class="settings-label">Amplified</div>
            <div class="settings-desc">Amplified Bible — expanded meaning</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-amp" ${settings.bibleVersions.AMP ? 'checked' : ''} onchange="updateBibleVersion('AMP', this.checked)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="settings-option">
          <div>
            <div class="settings-label">KJV (Legacy)</div>
            <div class="settings-desc">King James Version — traditional</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-kjv" ${settings.bibleVersions.KJV ? 'checked' : ''} onchange="updateBibleVersion('KJV', this.checked)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:var(--purple);">text_fields</span> Text Size
        </h3>
        <div class="text-size-options">
          <button class="text-size-btn ${settings.textSize === 'normal' ? 'active' : ''}" onclick="setTextSize('normal')">
            <span style="font-size:14px;">A</span> Normal
          </button>
          <button class="text-size-btn ${settings.textSize === 'large' ? 'active' : ''}" onclick="setTextSize('large')">
            <span style="font-size:18px;">A</span> Large
          </button>
          <button class="text-size-btn ${settings.textSize === 'xlarge' ? 'active' : ''}" onclick="setTextSize('xlarge')">
            <span style="font-size:22px;">A</span> Extra Large
          </button>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:var(--purple);">volume_up</span> Voice & Speech
        </h3>
        <div class="settings-option">
          <div>
            <div class="settings-label">Text-to-Speech</div>
            <div class="settings-desc">Read text aloud when you tap the speaker icon</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="set-tts" ${settings.ttsEnabled ? 'checked' : ''} onchange="updateTTS(this.checked)" />
            <span class="toggle-slider"></span>
          </label>
        </div>
        <div class="input-group" style="margin-top:12px;">
          <label class="input-label">Speech Speed: <strong id="set-speed-val">${settings.ttsSpeed || 1.0}x</strong></label>
          <input type="range" class="duration-slider" id="set-speed" min="0.5" max="1.5" value="${settings.ttsSpeed || 1.0}" step="0.1" oninput="updateTTSSpeed(this.value)" />
          <div class="duration-labels"><span>Slow</span><span>Normal</span><span>Fast</span></div>
        </div>
      </div>

      <div class="card" style="margin-bottom:20px;">
        <h3 style="font-size:18px;font-weight:800;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <span class="material-icons-round" style="color:var(--purple);">save</span> My Saved Sermons
        </h3>
        <div id="settings-sermons-list">
          ${renderSavedSermonsList()}
        </div>
      </div>
    </div>
  `;
}

function renderSavedSermonsList() {
  const sermons = loadSermons();
  if (sermons.length === 0) {
    return '<p style="color:var(--text-muted);text-align:center;padding:20px;">No saved sermons yet.</p>';
  }
  return sermons.map(s => `
    <div class="saved-sermon-item">
      <div>
        <div style="font-weight:700;">${s.title}</div>
        <div style="font-size:12px;color:var(--text-muted);">${s.duration} min · ${new Date(s.createdAt).toLocaleDateString()}</div>
      </div>
      <button class="btn-icon" style="background:rgba(239,68,68,0.1);" onclick="deleteSermonById('${s.id}')">
        <span class="material-icons-round" style="color:#EF4444;font-size:18px;">delete</span>
      </button>
    </div>
  `).join('');
}

// ===== WORD HELPER =====
function makeWordsClickable(text) {
  if (!text) return '';
  return text.replace(/\b([a-zA-Z]{5,})\b/g, '<span class="word-helper" onclick="showWordHelper(\'$1\')">$1</span>');
}

function showWordHelper(word) {
  const modal = document.getElementById('word-modal');
  const content = document.getElementById('word-modal-content');
  content.innerHTML = '<div class="loading-spinner"></div><p style="text-align:center;color:var(--text-muted);">Looking up "' + word + '"...</p>';
  modal.classList.add('active');

  apiWordHelper(word).then(data => {
    content.innerHTML = `
      <h3 style="font-size:22px;font-weight:900;margin-bottom:4px;">${word}</h3>
      <div style="margin-bottom:16px;">
        <button class="btn btn-sm btn-secondary" onclick="speakText('${word}')">
          <span class="material-icons-round" style="font-size:14px;">volume_up</span> Hear It
        </button>
      </div>
      <div class="word-section">
        <div class="word-section-label">Simple Meaning</div>
        <p>${data.simple}</p>
      </div>
      <div class="word-section">
        <div class="word-section-label">How to Say It</div>
        <p style="font-family:monospace;font-size:16px;font-weight:700;">${data.pronunciation}</p>
      </div>
      <div class="word-section">
        <div class="word-section-label">Hebrew Meaning</div>
        <p>${data.hebrew}</p>
      </div>
      <div class="word-section">
        <div class="word-section-label">Greek Meaning</div>
        <p>${data.greek}</p>
      </div>
      <div class="word-section">
        <div class="word-section-label">Easy Explanation</div>
        <p>${data.explanation}</p>
      </div>
    `;
  }).catch(err => {
    content.innerHTML = '<p style="color:var(--error);text-align:center;">Could not look up this word. Please try again.</p>';
  });
}
