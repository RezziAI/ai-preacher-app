// API helper - calls the Expo server backend for AI features
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:3000/api/trpc'
  : '/api/trpc'; // Will need to be configured for production

// For the standalone web app, we use the browser's built-in AI simulation
// In production, this would connect to a real backend

async function apiGenerateSermon({ topic, eventType, duration, bibleVersions }) {
  const settings = loadSettings();
  const versions = bibleVersions || Object.keys(settings.bibleVersions).filter(k => settings.bibleVersions[k]);
  
  // Try to call the real API first
  try {
    const res = await fetch(`${API_BASE}/generateSermon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: { topic, eventType, duration, bibleVersions: versions } }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.result?.data?.json || data;
    }
  } catch (e) { /* fallback below */ }

  // Fallback: generate locally with structured content
  return generateSermonLocally(topic, eventType, duration, versions);
}

async function apiGenerateDevotional({ verse, bibleVersions }) {
  const settings = loadSettings();
  const versions = bibleVersions || Object.keys(settings.bibleVersions).filter(k => settings.bibleVersions[k]);
  
  try {
    const res = await fetch(`${API_BASE}/generateDevotional`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: { verse, bibleVersions: versions } }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.result?.data?.json || data;
    }
  } catch (e) { /* fallback */ }

  return generateDevotionalLocally(verse);
}

async function apiWordHelper(word) {
  try {
    const res = await fetch(`${API_BASE}/wordHelper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: { word } }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.result?.data?.json || data;
    }
  } catch (e) { /* fallback */ }

  return generateWordHelperLocally(word);
}

async function apiHolySpirit({ currentTopic, currentPoint, bibleVersions }) {
  const settings = loadSettings();
  const versions = bibleVersions || Object.keys(settings.bibleVersions).filter(k => settings.bibleVersions[k]);
  
  try {
    const res = await fetch(`${API_BASE}/holySpiritMode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ json: { currentTopic, currentPoint, bibleVersions: versions } }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.result?.data?.json || data;
    }
  } catch (e) { /* fallback */ }

  return generateHolySpiritLocally(currentTopic);
}

// ===== LOCAL FALLBACK GENERATORS =====
// These provide structured content when no backend is available

function generateSermonLocally(topic, eventType, duration, versions) {
  const verseDB = {
    "The Love of God": [
      { ref: "John 3:16", text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life." },
      { ref: "Romans 5:8", text: "But God shows his love for us in that while we were still sinners, Christ died for us." },
      { ref: "1 John 4:19", text: "We love because he first loved us." },
      { ref: "Jeremiah 31:3", text: "I have loved you with an everlasting love; therefore I have continued my faithfulness to you." },
    ],
    "Faith and Trust in God": [
      { ref: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen." },
      { ref: "Proverbs 3:5-6", text: "Trust in the LORD with all your heart, and do not lean on your own understanding." },
      { ref: "Romans 10:17", text: "So faith comes from hearing, and hearing through the word of Christ." },
      { ref: "Mark 11:24", text: "Therefore I tell you, whatever you ask in prayer, believe that you have received it, and it will be yours." },
    ],
    "The Power of Prayer": [
      { ref: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God." },
      { ref: "James 5:16", text: "The prayer of a righteous person has great power as it is working." },
      { ref: "Matthew 7:7", text: "Ask, and it will be given to you; seek, and you will find; knock, and it will be opened to you." },
      { ref: "1 Thessalonians 5:17", text: "Pray without ceasing." },
    ],
  };

  const defaultVerses = [
    { ref: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path." },
    { ref: "Isaiah 40:31", text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles." },
    { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good." },
    { ref: "2 Timothy 3:16", text: "All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness." },
  ];

  const verses = verseDB[topic] || defaultVerses;
  const points = Math.max(2, Math.min(5, Math.floor(duration / 8)));
  const displayTopic = eventType && eventType !== 'general' ? `${topic} (${eventType})` : topic;

  return {
    title: displayTopic,
    duration: duration,
    outline: {
      introduction: `Open with a warm greeting and prayer. Introduce the topic of "${topic}" and why it matters to every believer. Share a brief personal story or illustration that connects to the theme.`,
      points: Array.from({ length: points }, (_, i) => ({
        title: `Point ${i + 1}: ${['Understanding', 'Living Out', 'The Promise of', 'Walking In', 'Embracing'][i] || 'Exploring'} ${topic}`,
        content: `Develop this point using scripture and real-life examples. Explain how ${topic.toLowerCase()} applies to daily life and strengthens our walk with Christ. Connect this to the congregation's experiences.`,
        verse: verses[i % verses.length],
      })),
      closing: `Summarize the key points about "${topic}." Give a powerful call to action. Invite the congregation to respond in prayer. Close with a blessing and encouragement.`,
    },
    keyVerses: verses.map(v => ({ ...v, version: 'ESV' })),
    supportingVerses: [
      { ref: "Psalm 27:1", text: "The LORD is my light and my salvation; whom shall I fear?", version: "ESV" },
      { ref: "Deuteronomy 31:6", text: "Be strong and courageous. Do not fear or be in dread of them, for it is the LORD your God who goes with you.", version: "ESV" },
    ],
    examples: [
      "Share a testimony of how God worked in someone's life related to this topic.",
      "Reference a well-known Bible character who demonstrated this principle.",
      "Connect the message to current events or everyday situations the congregation faces.",
    ],
  };
}

function generateDevotionalLocally(verse) {
  return {
    verse: verse,
    devotional: `This verse reminds us of God's faithfulness and love. When we meditate on "${verse}", we are drawn closer to the heart of the Father. In our daily walk, this scripture serves as an anchor — reminding us that God's Word is living and active, speaking into every situation we face. Take a moment to read this verse slowly, letting each word settle into your spirit. God is speaking to you today through His Word.`,
    reflectionQuestions: [
      "What does this verse reveal about God's character?",
      "How can you apply this truth to a situation you're facing today?",
      "Who in your life needs to hear this message of hope?",
      "What is the Holy Spirit speaking to your heart through this scripture?",
    ],
    talkingPoints: [
      "The historical context of this passage and what it meant to the original audience.",
      "How this verse connects to the larger story of God's redemption plan.",
      "Practical ways to live out this truth in your daily life.",
      "How to share this verse with someone who is struggling or seeking God.",
    ],
  };
}

function generateWordHelperLocally(word) {
  const commonWords = {
    "righteousness": { simple: "Doing what is right in God's eyes; being in right standing with God.", pronunciation: "RY-chus-ness", hebrew: "tsedaqah (צְדָקָה) — rightness, justice", greek: "dikaiosynē (δικαιοσύνη) — justice, righteousness", explanation: "When the Bible talks about righteousness, it means living the way God wants us to live. Through Jesus, we are made righteous — meaning God sees us as clean and right, not because of what we do, but because of what Jesus did for us on the cross." },
    "sanctification": { simple: "The process of becoming more holy and more like Jesus.", pronunciation: "SANK-tih-fih-KAY-shun", hebrew: "qadash (קָדַשׁ) — to set apart, make holy", greek: "hagiasmos (ἁγιασμός) — holiness, consecration", explanation: "Sanctification is like a journey. When you accept Jesus, you are saved instantly, but becoming more like Him is a daily process. The Holy Spirit helps you grow, change bad habits, and become the person God created you to be." },
    "propitiation": { simple: "Jesus taking the punishment we deserved so God's anger against sin is satisfied.", pronunciation: "pro-PIH-shee-AY-shun", hebrew: "kapporeth (כַּפֹּרֶת) — mercy seat, covering", greek: "hilasmos (ἱλασμός) — atoning sacrifice", explanation: "This big word simply means that Jesus paid the price for our sins. Imagine you owed a debt you could never pay — Jesus stepped in and paid it all. Because of His sacrifice on the cross, we can be forgiven and have peace with God." },
    "redemption": { simple: "Being bought back or rescued from sin by Jesus' sacrifice.", pronunciation: "reh-DEMP-shun", hebrew: "ge'ulah (גְּאֻלָּה) — ransom, deliverance", greek: "apolytrōsis (ἀπολύτρωσις) — release, deliverance", explanation: "Redemption means being rescued. In Bible times, a slave could be 'redeemed' — someone would pay the price to set them free. Jesus redeemed us from sin. He paid with His own blood so we could be free." },
    "covenant": { simple: "A sacred promise or agreement between God and His people.", pronunciation: "KUV-eh-nant", hebrew: "berith (בְּרִית) — agreement, alliance", greek: "diathēkē (διαθήκη) — testament, agreement", explanation: "A covenant is like a very serious promise that cannot be broken. God made covenants with Noah, Abraham, Moses, and David. The New Covenant through Jesus is the greatest one — through His blood, we have eternal life and forgiveness." },
    "grace": { simple: "God's free gift of love and favor that we don't deserve.", pronunciation: "GRAYS", hebrew: "chen (חֵן) — favor, grace", greek: "charis (χάρις) — grace, kindness", explanation: "Grace means getting something wonderful that you didn't earn. We all make mistakes and sin, but God loves us so much that He gives us forgiveness and eternal life as a free gift through Jesus. You can't work for it — you just receive it by faith." },
  };

  const lower = word.toLowerCase().trim();
  if (commonWords[lower]) return commonWords[lower];

  return {
    simple: `A word used in scripture and Christian teaching.`,
    pronunciation: word.toUpperCase(),
    hebrew: "Study the original Hebrew/Greek for deeper meaning.",
    greek: "Check a Bible concordance for the original language.",
    explanation: `"${word}" is a word you may encounter in Bible study. For the full meaning, try looking it up in a Bible dictionary or concordance. Understanding the original Hebrew or Greek can reveal deeper layers of meaning that enrich your preaching and study.`,
  };
}

function generateHolySpiritLocally(topic) {
  const relatedVerses = {
    "The Love of God": [
      { ref: "1 Corinthians 13:4-7", text: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude.", version: "ESV" },
      { ref: "Romans 8:38-39", text: "For I am sure that neither death nor life... will be able to separate us from the love of God in Christ Jesus.", version: "ESV" },
      { ref: "1 John 4:8", text: "Anyone who does not love does not know God, because God is love.", version: "ESV" },
      { ref: "Ephesians 3:18-19", text: "May have strength to comprehend... the breadth and length and height and depth of the love of Christ.", version: "NIV" },
      { ref: "Zephaniah 3:17", text: "The LORD your God is in your midst, a mighty one who will save; he will rejoice over you with gladness.", version: "ESV" },
    ],
  };

  const defaultRelated = [
    { ref: "Psalm 46:10", text: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!", version: "ESV" },
    { ref: "Isaiah 55:11", text: "So shall my word be that goes out from my mouth; it shall not return to me empty.", version: "ESV" },
    { ref: "John 14:26", text: "But the Helper, the Holy Spirit, whom the Father will send in my name, he will teach you all things.", version: "ESV" },
    { ref: "Acts 1:8", text: "But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses.", version: "NIV" },
    { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.", version: "ESV" },
  ];

  return { verses: relatedVerses[topic] || defaultRelated };
}
