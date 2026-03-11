// ===== AI PREACHER WEB APP - MAIN APPLICATION =====

// Retell AI Configuration
const RETELL_AGENT_ID = 'agent_d74915985c82a93925e6c05cbe';
const RETELL_API_KEY = 'key_3e75b1ed36a3d8c511671c5e715c';

let retellClient = null;
let isCoachCallActive = false;
let currentPage = 'home';
let currentSermonData = null;
let currentDevotionalData = null;
let preachTimerInterval = null;
let preachTimerSeconds = 0;
let preachTimerRunning = false;

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  const settings = loadSettings();
  applyTextSize(settings.textSize);
  navigateTo('home');
});

// ===== NAVIGATION =====
function navigateTo(page) {
  currentPage = page;
  const main = document.getElementById('main-content');
  
  // Update nav (both sidebar and bottom nav)
  document.querySelectorAll('.nav-item, .bnav-item').forEach(n => n.classList.remove('active'));
  document.querySelectorAll(`[data-page="${page}"]`).forEach(n => n.classList.add('active'));

  // Render page
  switch (page) {
    case 'home': main.innerHTML = renderHomePage(); break;
    case 'sermon-builder': main.innerHTML = renderSermonBuilderPage(); break;
    case 'preach-mode': main.innerHTML = renderPreachModePage(); break;
    case 'confidence-coach': main.innerHTML = renderConfidenceCoachPage(); break;
    case 'devotional': main.innerHTML = renderDevotionalPage(); break;
    case 'settings': main.innerHTML = renderSettingsPage(); break;
    default: main.innerHTML = renderHomePage();
  }

  // Scroll to top
  main.scrollTop = 0;
  window.scrollTo(0, 0);
}

// ===== SERMON BUILDER HANDLERS =====
function handleTopicChange() {
  const select = document.getElementById('sb-topic');
  const customGroup = document.getElementById('sb-custom-topic-group');
  if (select.value === '__custom__') {
    customGroup.style.display = 'block';
    document.getElementById('sb-custom-topic').focus();
  } else {
    customGroup.style.display = 'none';
  }
}

async function generateSermon() {
  const topicSelect = document.getElementById('sb-topic');
  let topic = topicSelect.value;
  if (topic === '__custom__') {
    topic = document.getElementById('sb-custom-topic').value.trim();
  }
  if (!topic) {
    alert('Please select or enter a sermon topic.');
    return;
  }

  const eventType = document.getElementById('sb-event').value;
  const duration = parseInt(document.getElementById('sb-duration').value);
  const btn = document.getElementById('sb-generate-btn');
  const output = document.getElementById('sb-output');

  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Generating...';
  output.innerHTML = '<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div><p style="color:var(--text-muted);margin-top:16px;">Building your sermon with AI... This may take a moment.</p></div>';

  try {
    const data = await apiGenerateSermon({ topic, eventType, duration });
    currentSermonData = data;
    output.innerHTML = renderSermonOutput(data);
  } catch (err) {
    output.innerHTML = '<div class="card" style="border-color:var(--error);"><p style="color:var(--error);">Something went wrong. Please try again.</p></div>';
  }

  btn.disabled = false;
  btn.innerHTML = '<span class="material-icons-round">auto_awesome</span> Generate Sermon';
}

function speakSermon() {
  if (!currentSermonData) return;
  let text = `Sermon: ${currentSermonData.title}. `;
  text += `Introduction: ${currentSermonData.outline.introduction} `;
  currentSermonData.outline.points.forEach(pt => {
    text += `${pt.title}. ${pt.content} `;
    if (pt.verse) text += `${pt.verse.ref}: ${pt.verse.text} `;
  });
  text += `Closing: ${currentSermonData.outline.closing}`;
  speakText(text);
}

function saveCurrentSermon() {
  if (!currentSermonData) return;
  saveSermon(currentSermonData);
  alert('Sermon saved! You can find it in Settings or load it in Preach Mode.');
}

function saveCurrentDevotional() {
  if (!currentDevotionalData) return;
  saveDevotional(currentDevotionalData);
  alert('Devotional saved!');
}

// ===== DEVOTIONAL HANDLER =====
async function generateDevotional() {
  const verse = document.getElementById('devo-verse').value.trim();
  if (!verse) {
    alert('Please enter a Bible verse.');
    return;
  }

  const btn = document.getElementById('devo-generate-btn');
  const output = document.getElementById('devo-output');

  btn.disabled = true;
  btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Generating...';
  output.innerHTML = '<div style="text-align:center;padding:40px;"><div class="loading-spinner"></div><p style="color:var(--text-muted);margin-top:16px;">Creating your devotional...</p></div>';

  try {
    const data = await apiGenerateDevotional({ verse });
    currentDevotionalData = data;
    output.innerHTML = renderDevotionalOutput(data);
  } catch (err) {
    output.innerHTML = '<div class="card" style="border-color:var(--error);"><p style="color:var(--error);">Something went wrong. Please try again.</p></div>';
  }

  btn.disabled = false;
  btn.innerHTML = '<span class="material-icons-round">favorite</span> Generate Devotional';
}

// ===== PREACH MODE HANDLERS =====
function loadSermonForPreach() {
  const select = document.getElementById('pm-sermon-select');
  const id = select.value;
  if (!id) return;

  const sermons = loadSermons();
  const sermon = sermons.find(s => s.id === id);
  if (!sermon) return;

  currentSermonData = sermon;
  const notes = document.getElementById('pm-notes');
  const timerTarget = document.getElementById('pm-timer-target');
  timerTarget.textContent = `Target: ${sermon.duration} min`;

  let html = `<h3 style="font-size:20px;font-weight:900;margin-bottom:16px;">${sermon.title}</h3>`;
  html += `<div class="preach-note-section"><h4>Introduction</h4><p>${sermon.outline.introduction}</p></div>`;
  sermon.outline.points.forEach(pt => {
    html += `<div class="preach-note-section"><h4>${pt.title}</h4><p>${pt.content}</p>`;
    if (pt.verse) html += `<div class="verse-card"><div class="verse-ref">${pt.verse.ref}</div><div class="verse-text">"${pt.verse.text}"</div></div>`;
    html += `</div>`;
  });
  html += `<div class="preach-note-section"><h4>Closing & Altar Call</h4><p>${sermon.outline.closing}</p></div>`;
  notes.innerHTML = html;
}

function startPreachMode() {
  document.getElementById('pm-container').style.display = 'block';
  document.getElementById('pm-start-btn').style.display = 'none';
  document.getElementById('pm-stop-btn').style.display = 'flex';
}

function stopPreachMode() {
  document.getElementById('pm-container').style.display = 'none';
  document.getElementById('pm-start-btn').style.display = 'flex';
  document.getElementById('pm-stop-btn').style.display = 'none';
  stopPreachTimer();
}

function togglePreachTimer() {
  if (preachTimerRunning) {
    stopPreachTimer();
  } else {
    startPreachTimer();
  }
}

function startPreachTimer() {
  preachTimerRunning = true;
  document.getElementById('pm-timer-icon').textContent = 'pause';
  preachTimerInterval = setInterval(() => {
    preachTimerSeconds++;
    const min = Math.floor(preachTimerSeconds / 60).toString().padStart(2, '0');
    const sec = (preachTimerSeconds % 60).toString().padStart(2, '0');
    document.getElementById('pm-timer').textContent = `${min}:${sec}`;
  }, 1000);
}

function stopPreachTimer() {
  preachTimerRunning = false;
  if (preachTimerInterval) clearInterval(preachTimerInterval);
  preachTimerInterval = null;
  const icon = document.getElementById('pm-timer-icon');
  if (icon) icon.textContent = 'play_arrow';
}

async function triggerHolySpirit() {
  const suggestions = document.getElementById('pm-suggestions');
  const topic = currentSermonData ? currentSermonData.title : 'The Gospel';

  suggestions.innerHTML = '<div style="text-align:center;padding:20px;"><div class="loading-spinner"></div><p style="color:var(--text-muted);font-size:13px;">Holy Spirit Mode — finding related scriptures...</p></div>';

  try {
    const data = await apiHolySpirit({ currentTopic: topic, currentPoint: '' });
    let html = '<div class="suggestion-card"><div class="suggestion-label" style="color:var(--gold);"><span class="material-icons-round" style="font-size:14px;">whatshot</span> Holy Spirit Mode</div></div>';
    if (data.verses) {
      data.verses.forEach(v => {
        html += `
          <div class="suggestion-card">
            <div class="verse-ref" style="font-size:13px;font-weight:800;color:var(--purple);">${v.ref} (${v.version || 'ESV'})</div>
            <div class="verse-text" style="font-size:13px;">"${v.text}"</div>
          </div>
        `;
      });
    }
    suggestions.innerHTML = html;
  } catch (err) {
    suggestions.innerHTML = '<div class="suggestion-card"><p style="color:var(--error);">Could not load scriptures. Try again.</p></div>';
  }
}

// ===== CONFIDENCE COACH - RETELL AI =====
async function toggleCoachCall() {
  if (isCoachCallActive) {
    stopCoachCall();
  } else {
    startCoachCall();
  }
}

async function startCoachCall() {
  const btn = document.getElementById('coach-call-btn');
  const statusDot = document.getElementById('coach-status-dot');
  const statusText = document.getElementById('coach-status-text');
  const callText = document.getElementById('coach-call-text');
  const transcript = document.getElementById('coach-transcript');

  btn.disabled = true;
  callText.textContent = 'Connecting...';
  statusText.textContent = 'Connecting to your coach...';
  statusDot.className = 'status-dot connecting';

  try {
    // Create web call directly via Retell API (CORS allowed)
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ agent_id: RETELL_AGENT_ID })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Retell API error:', response.status, errText);
      throw new Error(`API returned ${response.status}`);
    }

    const callData = await response.json();

    if (!callData.access_token) {
      throw new Error('No access token received');
    }

    // Initialize Retell Web Client
    if (!retellClient) {
      // Wait for ESM module to load RetellWebClient onto window
      let RWC = window.RetellWebClient;
      if (!RWC) {
        // Give the ESM import a moment to resolve
        await new Promise(resolve => setTimeout(resolve, 1500));
        RWC = window.RetellWebClient;
      }
      if (!RWC) throw new Error('Retell SDK not loaded. Please refresh the page and try again.');
      retellClient = new RWC();
    }

    // Set up event listeners
    retellClient.on('call_started', () => {
      isCoachCallActive = true;
      btn.disabled = false;
      btn.classList.add('active-call');
      callText.textContent = 'End Session';
      statusDot.className = 'status-dot connected';
      statusText.textContent = 'Connected — Talk to your coach!';
      transcript.style.display = 'block';
    });

    retellClient.on('call_ended', () => {
      isCoachCallActive = false;
      btn.disabled = false;
      btn.classList.remove('active-call');
      callText.textContent = 'Start Coaching Session';
      statusDot.className = 'status-dot disconnected';
      statusText.textContent = 'Session ended. Great job, Pastor Rick!';
    });

    retellClient.on('agent_start_talking', () => {
      statusText.textContent = 'Coach is speaking...';
    });

    retellClient.on('agent_stop_talking', () => {
      statusText.textContent = 'Your turn, Pastor Rick...';
    });

    retellClient.on('update', (update) => {
      if (update.transcript) {
        const content = document.getElementById('coach-transcript-content');
        if (content) {
          content.innerHTML = update.transcript.map(t => 
            `<div style="margin-bottom:8px;"><strong style="color:${t.role === 'agent' ? 'var(--purple)' : 'var(--gold)'};">${t.role === 'agent' ? 'Coach' : 'You'}:</strong> ${t.content}</div>`
          ).join('');
          content.scrollTop = content.scrollHeight;
        }
      }
    });

    retellClient.on('error', (error) => {
      console.error('Retell error:', error);
      isCoachCallActive = false;
      btn.disabled = false;
      btn.classList.remove('active-call');
      callText.textContent = 'Start Coaching Session';
      statusDot.className = 'status-dot disconnected';
      statusText.textContent = 'Connection error. Please try again.';
    });

    // Start the call
    await retellClient.startCall({
      accessToken: callData.access_token,
      sampleRate: 24000,
    });

  } catch (err) {
    console.error('Failed to start coach call:', err);
    btn.disabled = false;
    callText.textContent = 'Start Coaching Session';
    statusDot.className = 'status-dot disconnected';
    statusText.textContent = 'Could not connect. Please check your internet and try again.';
  }
}

function stopCoachCall() {
  if (retellClient) {
    retellClient.stopCall();
  }
  isCoachCallActive = false;
}

// ===== SETTINGS HANDLERS =====
function updateBibleVersion(version, enabled) {
  const settings = loadSettings();
  settings.bibleVersions[version] = enabled;
  saveSettings(settings);
}

function setTextSize(size) {
  const settings = loadSettings();
  settings.textSize = size;
  saveSettings(settings);
  // Re-render settings to update active button
  navigateTo('settings');
}

function updateTTS(enabled) {
  const settings = loadSettings();
  settings.ttsEnabled = enabled;
  saveSettings(settings);
}

function updateTTSSpeed(value) {
  const settings = loadSettings();
  settings.ttsSpeed = parseFloat(value);
  saveSettings(settings);
  document.getElementById('set-speed-val').textContent = value + 'x';
}

function deleteSermonById(id) {
  if (confirm('Delete this sermon?')) {
    deleteSermon(id);
    navigateTo('settings');
  }
}

// ===== WORD MODAL =====
function closeWordModal() {
  document.getElementById('word-modal').classList.remove('active');
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.id === 'word-modal') {
    closeWordModal();
  }
});

// Mobile nav toggle
function toggleMobileNav() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('mobile-open');
}

function closeMobileNav() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.remove('mobile-open');
}

// Close mobile nav when navigating
const origNavigateTo = navigateTo;
navigateTo = function(page) {
  closeMobileNav();
  origNavigateTo(page);
};
