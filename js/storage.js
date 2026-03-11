// LocalStorage-based persistence
const STORAGE_KEYS = {
  SERMONS: 'aipreacher_sermons',
  DEVOTIONALS: 'aipreacher_devotionals',
  SETTINGS: 'aipreacher_settings',
};

const DEFAULT_SETTINGS = {
  bibleVersions: { ESV: true, NIV: true, AMP: false, KJV: true },
  textSize: 'normal',
  ttsEnabled: true,
  ttsSpeed: 1.0,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS };
  } catch { return { ...DEFAULT_SETTINGS }; }
}

function saveSettings(settings) {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  applyTextSize(settings.textSize);
}

function applyTextSize(size) {
  document.body.classList.remove('text-large', 'text-xlarge');
  if (size === 'large') document.body.classList.add('text-large');
  else if (size === 'xlarge') document.body.classList.add('text-xlarge');
}

function loadSermons() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SERMONS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveSermon(sermon) {
  const sermons = loadSermons();
  sermon.id = Date.now().toString();
  sermon.createdAt = new Date().toISOString();
  sermons.unshift(sermon);
  localStorage.setItem(STORAGE_KEYS.SERMONS, JSON.stringify(sermons));
  return sermon;
}

function deleteSermon(id) {
  const sermons = loadSermons().filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEYS.SERMONS, JSON.stringify(sermons));
}

function loadDevotionals() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEVOTIONALS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveDevotional(devotional) {
  const devos = loadDevotionals();
  devotional.id = Date.now().toString();
  devotional.createdAt = new Date().toISOString();
  devos.unshift(devotional);
  localStorage.setItem(STORAGE_KEYS.DEVOTIONALS, JSON.stringify(devos));
  return devotional;
}

// Text-to-Speech
function speakText(text) {
  const settings = loadSettings();
  if (!settings.ttsEnabled) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.ttsSpeed || 1.0;
  utterance.lang = 'en-US';
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
}
