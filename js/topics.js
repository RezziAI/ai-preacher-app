// 60+ Sermon Topics organized by category
const SERMON_TOPICS = {
  "Biblical Themes": [
    "The Love of God", "Faith and Trust in God", "The Power of Prayer",
    "Salvation Through Christ", "The Holy Spirit", "Grace and Mercy",
    "Forgiveness", "The Blood of Jesus", "Spiritual Warfare",
    "The Armor of God", "Walking by Faith", "The Promises of God",
    "Holiness and Righteousness", "The Second Coming of Christ",
    "The Kingdom of God", "Repentance", "The Cross of Calvary",
    "The Resurrection Power", "Living Water", "The Bread of Life"
  ],
  "Life Events": [
    "Funeral / Homegoing Service", "Wedding Ceremony", "Baby Dedication",
    "Baptism Service", "Birthday Celebration", "Anniversary Celebration",
    "Graduation Ceremony", "New Year Service", "Thanksgiving Service",
    "Memorial Service", "Ordination Service", "Church Dedication",
    "Retirement Celebration", "Quinceañera / Coming of Age"
  ],
  "Christian Living": [
    "Overcoming Fear and Anxiety", "Trusting God in Hard Times",
    "Family and Marriage", "Raising Godly Children", "Financial Stewardship",
    "Serving Others", "Unity in the Church", "Dealing with Loss and Grief",
    "Finding Purpose in Christ", "Breaking Generational Curses",
    "Patience and Endurance", "Joy in the Lord", "Humility",
    "The Fruit of the Spirit", "Being a Light in Darkness"
  ],
  "Holidays & Seasons": [
    "Christmas / Birth of Christ", "Easter / Resurrection Sunday",
    "Good Friday / The Crucifixion", "Palm Sunday", "Pentecost Sunday",
    "Mother's Day", "Father's Day", "Revival Service",
    "Watch Night Service", "Communion / Lord's Supper"
  ],
  "The Trinity": [
    "God the Father", "Jesus Christ the Son", "The Holy Spirit",
    "The Trinity in Scripture", "The Names of God",
    "Jesus: The Way, Truth, and Life"
  ]
};

const DAILY_VERSES = [
  { ref: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the LORD your God is with you wherever you go." },
  { ref: "Philippians 4:13", text: "I can do all things through him who strengthens me." },
  { ref: "Proverbs 3:5-6", text: "Trust in the LORD with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths." },
  { ref: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand." },
  { ref: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose." },
  { ref: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want." },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope." },
  { ref: "2 Timothy 1:7", text: "For God gave us a spirit not of fear but of power and love and self-control." },
  { ref: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble." },
  { ref: "Matthew 28:20", text: "And behold, I am with you always, to the end of the age." },
  { ref: "Isaiah 40:31", text: "But they who wait for the LORD shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint." },
  { ref: "Psalm 119:105", text: "Your word is a lamp to my feet and a light to my path." },
  { ref: "Romans 8:31", text: "What then shall we say to these things? If God is for us, who can be against us?" },
  { ref: "Hebrews 11:1", text: "Now faith is the assurance of things hoped for, the conviction of things not seen." }
];

function getDailyVerse() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}
