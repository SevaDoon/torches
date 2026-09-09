/*
 * Every word the interface says, in one place.
 *
 * Rule of the project: Arabic talks to the student, English is the thing she is
 * learning. So questions, options, examples and reading passages stay in
 * English; everything around them is Arabic.
 */

/** Arabic counts the first ten differently from everything above them. */
function days(n: number): string {
  if (n === 0) return 'لم تبدئي بعد';
  if (n === 1) return 'يوم متتالٍ';
  if (n === 2) return 'يومان متتاليان';
  if (n <= 10) return `${n} أيام متتالية`;
  return `${n} يوماً متتالياً`;
}

export const ar = {
  appName: 'تورشز',
  appNameEn: 'TORCHES',
  tagline: 'تعلّمي · العبي · نافسي',
  courseLine: 'مبني على منهج',

  levelShort: 'المستوى',
  xp: 'نقطة',
  xpShort: 'نقطة',
  question: 'سؤال',
  questions: 'سؤال',
  unit: 'الوحدة',
  units: 'وحدة',

  tiers: {
    spark: 'شرارة',
    ember: 'جمرة',
    flame: 'لهب',
    torch: 'شعلة',
    beacon: 'منارة',
    lighthouse: 'فنار',
  } as Record<string, string>,

  nav: {
    home: 'الرئيسية',
    journey: 'الرحلة',
    leaderboard: 'الترتيب',
    progress: 'تقدّمي',
    profile: 'حسابي',
  },

  skills: {
    grammar: 'القواعد',
    vocabulary: 'المفردات',
    reading: 'القراءة',
    form: 'التركيب والمعنى',
  } as Record<string, string>,

  games: {
    mcq: 'اختاري الإجابة',
    truefalse: 'صح أم خطأ',
    order: 'ركّبي الجملة',
    match: 'وصّلي',
    memory: 'اقلبي وتذكّري',
    blank: 'اكتبي الكلمة',
    error: 'اصطادي الخطأ',
  } as Record<string, string>,

  missions: {
    mixed: 'التحدي المختلط',
    mixedSub: 'جولة من كل مهارة — النقاط مضاعفة',
    boss: 'تحدّي الوحدة',
    bossSub: 'اجتازيه لتُفتح لك الوحدة التالية',
    review: 'المراجعة الذكية',
    reviewSub: 'تدرّبي على ما أخطأتِ فيه',
    skillSub: (unitNo: number, skill: string) => `الوحدة ${unitNo} · تحدي ${skill}`,
  },

  welcome: {
    intro: 'حوّلي منهج MegaGoal 1 إلى لعبة: تحديات، نقاط، مستويات، ومنافسة مع زميلاتك.',
    placeholder: 'اكتبي اسمك للبدء',
    start: 'أشعلي شعلتك',
    continueAs: 'أو تابعي باسم',
    unitsChip: (n: number) => `${n} وحدة`,
    questionsChip: (n: number) => `${n} تحدٍّ`,
    gamesChip: (n: number) => `${n} أنواع ألعاب`,
    privacy:
      'بدون بريد إلكتروني وبدون كلمة مرور. يمنحك تورشز رقماً خاصاً بك ويحفظ تقدّمك على هذا الجهاز.',
    loading: 'نُشعل الشعلة…',
  },

  home: {
    /* The name is rendered separately inside <bdi> — a Latin name inside an
       Arabic sentence otherwise drags the punctuation to the wrong side. */
    welcome: 'أهلاً بك،',
    streak: days,
    toNextLevel: (into: number, needed: number, next: number) =>
      `${into} من ${needed} نقطة للمستوى ${next}`,
    continue: 'أكملي التحدي',
    play: 'العبي',
    unitProgress: (n: number, pct: number) => `أنجزتِ ${pct}٪ من الوحدة ${n}`,
    skillsTitle: 'مهاراتك',
    seeAll: 'عرض الكل',
    rank: 'ترتيبك',
    ofPlayers: (n: number) => `من ${n} لاعبة`,
    recommended: 'مقترح لك',
    improve: (skill: string) => `لنحسّن ${skill}`,
    weakest: 'أضعف مهارة لديك الآن',
    reviewTitle: 'المراجعة الذكية',
    reviewCount: (n: number) => `${n} ${n === 1 ? 'سؤال يحتاج' : 'أسئلة تحتاج'} إلى تصحيح`,
    reviewStart: 'ابدئي',
  },

  journey: {
    title: 'رحلتك',
    unitsDone: (done: number, total: number) => `${done} من ${total} وحدة`,
    locked: 'أنهي الوحدة السابقة لفتح هذه الوحدة',
    lockedMission: 'أكملي تحديات المهارات أولاً',
    pages: (pages: string, n: number) => `صفحات الكتاب ${pages} · ${n} تحدٍّ`,
  },

  play: {
    quit: 'خروج',
    /* The count is rendered separately in an LTR span, or bidi flips the ×. */
    comboLabel: 'متتالية',
    hintAsk: 'محتاجة تلميح؟',
    hintNext: (label: string) => `التلميح التالي: ${label}`,
    hintCost: '−10 نقاط',
    hintLabels: {
      think: 'فكّري',
      remember: 'تذكّري',
      example: 'مثال',
      eliminate: 'استبعدي',
      explain: 'الشرح',
    } as Record<string, string>,
    eliminateText: 'تم تعتيم إجابات لا يمكن أن تكون صحيحة.',
    /* For the games whose prompt is an instruction rather than the question itself. */
    instructions: {
      order: 'رتّبي الكلمات لتكوّني الجملة الصحيحة',
      match: 'وصّلي كل كلمة بما يناسبها',
      memory: 'اقلبي البطاقات وابحثي عن الأزواج',
      error: 'في الجملة كلمة واحدة خاطئة — اضغطي عليها',
      blank: 'أكملي الفراغ بالكلمة المناسبة',
    } as Record<string, string | undefined>,
    correct: ['أحسنتِ!', 'ممتاز!', 'بالضبط!', 'إجابة صحيحة!'],
    tryAgain: 'ليست صحيحة — حاولي مرة أخرى',
    learnThis: 'لنتعلم هذه معاً',
    why: 'السبب:',
    remember: 'تذكّري:',
    continue: 'متابعة',
    retry: 'حاولي مرة أخرى',
    rescueTag: 'إنقاذ تعليمي',
    rescueIntro: 'يبدو أن هذه النقطة صعبة عليك. لنراجعها قبل أن تكملي.',
    rescueBack: 'فهمت — عودة للّعب',
    checkSentence: 'تحققي من الجملة',
    checkAnswer: 'تحققي من الإجابة',
    typeHere: 'اكتبي الكلمة الناقصة',
    matched: (done: number, total: number) => `${done} من ${total} تم توصيلها`,
    mismatches: (n: number) => `· ${n} محاولة خاطئة`,
    pairs: (done: number, total: number, tries: number) =>
      `${done} من ${total} زوج · ${tries} محاولة`,
    trayHint: 'اضغطي الكلمات بالترتيب الصحيح…',
    shouldBe: 'الصواب:',
    tapWrong: 'اضغطي الكلمة الخاطئة في الجملة',
    expand: 'توسيع',
    collapse: 'طي',
    difficulty: ['سهل', 'متوسط', 'صعب'],
  },

  results: {
    doneUnit: 'أُنجزت الوحدة!',
    done: 'أُنجز التحدي!',
    goodTry: 'محاولة جيدة!',
    accuracy: 'الدقة',
    ofRight: (correct: number, total: number) => `${correct} من ${total} صحيحة`,
    earned: 'النقاط المكتسبة',
    bestComboLabel: 'أطول متتالية',
    savedForReview: 'كل سؤال أخطأتِ فيه محفوظ في المراجعة الذكية لتصحّحيه لاحقاً.',
    backToJourney: 'العودة إلى الرحلة',
    playAgain: 'إعادة هذا التحدي',
    unitUnlocked: 'أُنجزت الوحدة! فُتحت لك الوحدة التالية.',
  },

  auth: {
    loginTab: 'تسجيل الدخول',
    registerTab: 'حساب جديد',
    nameLabel: 'اسمك',
    namePlaceholder: 'اكتبي اسمك',
    pinLabel: 'الرمز السري (٤ أرقام أو أكثر)',
    loginAction: 'ادخلي',
    registerAction: 'أنشئي حسابك',
    working: 'لحظة…',
    loginHint: 'ادخلي بنفس الاسم والرمز من أي جهاز ويرجع لك تقدّمك كاملاً.',
    registerHint: 'احفظي اسمك ورمزك — فيهما تدخلين كل مرة، ولا يضيع مجهودك.',
    nameTaken: 'هذا الاسم مسجّل من قبل. إن كان حسابك فاختاري «تسجيل الدخول»، وإلا غيّري الاسم.',
    wrongPin: 'الرمز السري غير صحيح. تأكّدي منه وحاولي مرة أخرى.',
    noAccount: 'ما فيه حساب بهذا الاسم. اختاري «حساب جديد» لإنشائه.',
    pinTooShort: 'الرمز قصير — استخدمي ٤ أرقام على الأقل.',
    tooMany: 'محاولات كثيرة. انتظري دقيقة ثم حاولي مرة أخرى.',
    loginFailed: 'تعذّر تسجيل الدخول. تأكّدي من اتصالك بالإنترنت.',
    registerFailed: 'تعذّر إنشاء الحساب. تأكّدي من اتصالك بالإنترنت.',
  },

  leaderboard: {
    title: 'لوحة المتصدرات',
    eyebrow: 'المنافسة',
    allTime: 'الإجمالي',
    week: 'هذا الأسبوع',
    you: 'أنتِ',
    allTimeNote: 'من بداية اللعب',
    weekNote: 'خلال آخر ٧ أيام',
    me: '· أنتِ',
    note: 'الترتيب يعتمد على رقمك الخاص لا على اسمك، فتغيير الاسم لا يغيّر مركزك.',
    loading: 'جارٍ تحميل اللوحة…',
  },

  progress: {
    eyebrow: 'سجلّك',
    title: 'تقدّمي',
    level: 'المستوى',
    accuracy: 'الدقة',
    ofAnswers: (correct: number, total: number) => `${correct} من ${total} إجابة`,
    bestCombo: 'أطول متتالية',
    inOneChallenge: 'في تحدٍّ واحد',
    streak: 'أيام متتالية',
    keepAlive: 'حافظي عليها غداً',
    skills: 'المهارات',
    units: 'الوحدات',
  },

  profile: {
    eyebrow: 'حسابك',
    title: 'حسابي',
    editName: 'تعديل الاسم',
    save: 'حفظ',
    cancel: 'إلغاء',
    renamed: 'تم تحديث الاسم — تقدّمك وترتيبك كما هما.',
    playerId: 'رقمك الخاص',
    copy: 'نسخ',
    copied: 'تم نسخ الرقم.',
    idNote:
      'هذا الرقم لا يتغيّر أبداً حتى لو غيّرتِ اسمك، وهو ما يرتبط به تقدّمك وترتيبك في اللوحة.',
    icon: 'أيقونتك',
    sound: 'المؤثرات الصوتية',
    soundNote: 'أصوات قصيرة عند الإجابة الصحيحة وارتفاع المستوى',
    on: 'مفعّلة',
    off: 'متوقفة',
    switch: 'تبديل اللاعبة',
    switchNote:
      'تقدّمك يبقى محفوظاً على هذا الجهاز — يمكنك العودة إليه من شاشة البداية.',
  },

  achievements: {
    eyebrow: (done: number, total: number) => `${done} من ${total} وسام`,
    title: 'الأوسمة',
    intro: 'هناك أكثر من طريقة للفوز هنا: السرعة، والدقة، والمواظبة، والتحسّن — لكل واحدة وسامها.',
    unlocked: 'مفتوح',
  },

  review: {
    eyebrow: 'صحّحي ما فاتك',
    title: 'المراجعة الذكية',
    empty: 'لا يوجد شيء للمراجعة',
    emptyNote: 'صحّحتِ كل سؤال أخطأتِ فيه. العبي تحدياً جديداً لتكملي رحلتك.',
    goJourney: 'إلى الرحلة',
    toFix: (n: number) => `${n} بحاجة إلى تصحيح`,
    leavesNote: 'يخرج السؤال من هذه القائمة بمجرد أن تجيبي عليه إجابة صحيحة.',
    start: 'ابدئي',
    gaps: 'أين الفجوات',
    theQuestions: 'الأسئلة',
  },

  skillsPage: {
    eyebrow: 'أربع مهارات، منهج واحد',
    title: 'المهارات',
    answered: (n: number, correct: number) => `${n} إجابة · ${correct} صحيحة`,
    focus: 'ركّزي هنا',
    notStarted: 'لم تبدئي بعد',
    accuracy: (pct: number) => `${pct}٪ دقة`,
    practise: (skill: string) => `تدرّبي على ${skill} في هذه الوحدة`,
  },

  toasts: {
    welcome: (name: string) => `أهلاً ${name}! أُشعلت شعلتك.`,
    welcomeBack: (name: string) => `أهلاً بعودتك يا ${name}.`,
    levelUp: (n: number) => `مستوى جديد! وصلتِ إلى المستوى ${n}.`,
    achievement: (title: string) => `وسام جديد — ${title}`,
  },

  notFound: 'هذا التحدي غير موجود.',
} as const;

/** Arabic names for the achievements, keyed by the ids in achievements.ts. */
export const achievementsAr: Record<string, { title: string; description: string }> = {
  'first-torch': { title: 'الشعلة الأولى', description: 'أكملي أول تحدٍّ لك.' },
  'perfect-round': { title: 'جولة كاملة', description: 'أنهي تحدياً بدون أي خطأ.' },
  'speed-runner': { title: 'انطلاقة', description: 'حققي متتالية من ٥ إجابات صحيحة.' },
  'on-fire': { title: 'مشتعلة', description: 'حققي متتالية من ١٠ إجابات صحيحة.' },
  consistent: { title: 'مواظبة', description: 'العبي ٣ أيام متتالية.' },
  'week-streak': { title: 'سبعة أيام من اللهب', description: 'حافظي على ٧ أيام متتالية.' },
  accuracy: { title: 'الأدقّ', description: 'حققي دقة ٨٥٪ خلال ٥٠ إجابة على الأقل.' },
  'knowledge-seeker': { title: 'باحثة عن المعرفة', description: 'أجيبي على ١٠٠ سؤال.' },
  'grammar-master': { title: 'أستاذة القواعد', description: 'أجيبي على ٢٥ سؤال قواعد بدقة ٨٠٪.' },
  'vocab-master': { title: 'أستاذة المفردات', description: 'أجيبي على ٢٥ سؤال مفردات بدقة ٨٠٪.' },
  'reading-master': { title: 'أستاذة القراءة', description: 'أجيبي على ٢٥ سؤال قراءة بدقة ٨٠٪.' },
  'form-master': {
    title: 'أستاذة التركيب والمعنى',
    description: 'أجيبي على ٢٥ سؤالاً في التركيب والمعنى بدقة ٨٠٪.',
  },
  'boss-slayer': { title: 'قاهرة التحديات', description: 'اجتازي أول تحدّي وحدة.' },
  'unit-complete': { title: 'وحدة مكتملة', description: 'أنهي كل تحديات وحدة كاملة مع تحدّيها.' },
  'half-course': { title: 'منتصف الطريق', description: 'أكملي ست وحدات من المنهج.' },
  comeback: { title: 'عودة قوية', description: 'صحّحي ١٠ أسئلة سبق أن أخطأتِ فيها.' },
};

/** Arabic names for the twelve units, shown beside the English title. */
export const unitTitlesAr: Record<string, string> = {
  'unit-1': 'تغيّرات كبيرة',
  'unit-2': 'المهن',
  'unit-3': 'ما سيكون سيكون',
  'unit-4': 'فنّ الإعلان',
  'unit-5': 'هل آذيتِ نفسك؟',
  'unit-6': 'خذي بنصيحتي',
  'unit-7': 'وصلتك رسالة!',
  'unit-8': 'أمنيات',
  'unit-9': 'شكاوى وشكاوى',
  'unit-10': 'تُرى ماذا حدث؟',
  'unit-11': 'لو لم يحدث ذلك',
  'unit-12': 'ماذا قالوا',
};
