/*
 * Every word the interface says, in one place.
 *
 * This is an English course, so the app speaks English: navigation, buttons,
 * headings, stats and results. Arabic is reserved for the places where not
 * understanding actually costs the student something:
 *
 *   - the hint ladder and the explanation after a wrong answer (data/i18n)
 *   - the grammar rule screens
 *   - sign-in errors, so nobody gets locked out by a sentence she can't read
 *   - the read-aloud tip, because the student who cannot read it is exactly the
 *     one the feature is for
 *   - the visitor banner, read by a guest who is not learning English
 *   - delete / reset confirmations, where a misread is destructive
 *   - the whole teacher panel — the teacher is not the one learning English
 *
 * The export is still called `ar` because it is the localisation file; most of
 * its values are simply English now.
 */

function days(n: number): string {
  if (n === 0) return 'not started yet';
  return `${n}-day streak`;
}

export const ar = {
  appName: 'Torches',
  appNameEn: 'TORCHES',
  tagline: 'Learn · Play · Compete',
  courseLine: 'Built on',

  levelShort: 'Level',
  xp: 'XP',
  xpShort: 'XP',
  question: 'question',
  questions: 'questions',
  unit: 'Unit',
  units: 'units',

  tiers: {
    spark: 'Spark',
    ember: 'Ember',
    flame: 'Flame',
    torch: 'Torch',
    beacon: 'Beacon',
    lighthouse: 'Lighthouse',
  } as Record<string, string>,

  nav: {
    home: 'Home',
    journey: 'Journey',
    leaderboard: 'Ranks',
    progress: 'Progress',
    profile: 'You',
  },

  skills: {
    grammar: 'Grammar',
    vocabulary: 'Vocabulary',
    reading: 'Reading',
    form: 'Form & Meaning',
  } as Record<string, string>,

  games: {
    mcq: 'Choose the answer',
    truefalse: 'True or false',
    order: 'Sentence Builder',
    match: 'Match Up',
    memory: 'Memory Flip',
    blank: 'Word Hunt',
    error: 'Error Detective',
    picture: 'Name the Picture',
    picmatch: 'Picture Match',
  } as Record<string, string>,

  missions: {
    mixed: 'Mixed Challenge',
    mixedSub: 'One round of every skill — double XP',
    boss: 'Boss Challenge',
    bossSub: 'Beat it to unlock the next unit',
    review: 'Smart Review',
    reviewSub: 'Practise what you missed',
    skillSub: (unitNo: number, skill: string) => `Unit ${unitNo} · ${skill} challenge`,
  },

  welcome: {
    intro: 'Turn MegaGoal 1 into a game: challenges, XP, levels, and a class leaderboard.',
    placeholder: 'Your name',
    start: 'Light my torch',
    continueAs: 'Or continue as',
    unitsChip: (n: number) => `${n} units`,
    questionsChip: (n: number) => `${n} challenges`,
    gamesChip: (n: number) => `${n} game types`,
    privacy: 'No email, no password — just a name and a PIN.',
    loading: 'Lighting the torch…',
  },

  home: {
    welcome: 'Welcome back,',
    streak: days,
    toNextLevel: (into: number, needed: number, next: number) =>
      `${into} / ${needed} XP to level ${next}`,
    continue: 'Continue',
    play: 'PLAY',
    unitLine: (n: number, total: number, title: string) => `Unit ${n} of ${total} · ${title}`,
    stageLine: (stage: number, total: number, pct: number) =>
      `Stage ${stage} of ${total} · ${pct}% of this unit`,
    skillsTitle: 'Your skills',
    seeAll: 'See all',
    rank: 'Your rank',
    ofPlayers: (n: number) => `of ${n} players`,
    recommended: 'Recommended',
    improve: (skill: string) => `Practise ${skill}`,
    weakest: 'Your weakest skill right now',
    reviewTitle: 'Smart Review',
    reviewCount: (n: number) => `${n} ${n === 1 ? 'question' : 'questions'} to fix`,
    reviewStart: 'Start',
  },

  journey: {
    title: 'Your journey',
    unitsDone: (done: number, total: number) => `${done} / ${total} units`,
    locked: 'Finish the previous unit to unlock this one',
    lockedMission: 'Finish more skill challenges first',
    pages: (pages: string, n: number) => `Book pages ${pages} · ${n} challenges`,
    stage: (n: number) => `Stage ${n}`,
    stagesDone: (done: number, total: number) => `${done}/${total} stages`,
    questionCount: (n: number) => `${n} questions`,
    start: 'Start',
    passed: 'Passed',
  },

  play: {
    quit: 'Quit',
    comboLabel: 'Combo',
    hintAsk: 'Need a hint?',
    hintNext: (label: string) => `Next hint: ${label}`,
    hintCost: '−10 XP',
    /* The hint ladder stays Arabic — this is the teaching, not the chrome. */
    hintLabels: {
      think: 'فكّري',
      remember: 'تذكّري',
      example: 'مثال',
      eliminate: 'استبعدي',
      explain: 'الشرح',
    } as Record<string, string>,
    eliminateText: 'تم تعتيم إجابات لا يمكن أن تكون صحيحة.',
    /* For the games whose prompt is an instruction rather than the question. */
    instructions: {
      order: 'Put the words in the right order',
      match: 'Match each item with its pair',
      memory: 'Flip the cards and find the pairs',
      error: 'One word is wrong — tap it',
      blank: 'Fill in the missing word',
      picture: 'What is this?',
      picmatch: 'Tap a picture, then its word',
    } as Record<string, string | undefined>,
    correct: ['Correct!', 'Nice one!', 'Exactly!', 'Well done!'],
    tryAgain: 'Not quite — try again',
    learnThis: "Let's learn this one",
    why: 'Why:',
    remember: 'Remember:',
    continue: 'Continue',
    retry: 'Try again',
    rescueTag: 'Learning Rescue',
    rescueIntro: 'يبدو أن هذه النقطة صعبة عليك. لنراجعها قبل أن تكملي.',
    rescueBack: 'Got it — back to the game',
    checkSentence: 'Check sentence',
    checkAnswer: 'Check answer',
    typeHere: 'Type the missing word',
    matched: (done: number, total: number) => `${done} / ${total} matched`,
    mismatches: (n: number) => `· ${n} wrong ${n === 1 ? 'try' : 'tries'}`,
    pairs: (done: number, total: number, tries: number) =>
      `${done} / ${total} pairs · ${tries} tries`,
    trayHint: 'Tap the words below in the right order…',
    shouldBe: 'It should be:',
    theAnswer: 'الإجابة الصحيحة',
    tapWrong: 'Tap the wrong word',
    listen: 'اضغطي على السمّاعة لتسمعي السؤال كاملاً.',
    listenWords: 'واضغطي على أي كلمة لتسمعي نطقها وحدها.',
    expand: 'Expand',
    collapse: 'Collapse',
    difficulty: ['Easy', 'Medium', 'Hard'],
  },

  results: {
    doneUnit: 'Unit complete!',
    done: 'Challenge complete!',
    goodTry: 'Good try!',
    accuracy: 'Accuracy',
    ofRight: (correct: number, total: number) => `${correct} of ${total} right`,
    earned: 'XP earned',
    bestComboLabel: 'Best combo',
    savedForReview: 'Every question you missed is saved in Smart Review.',
    backToJourney: 'Back to the journey',
    playAgain: 'Play again',
    unitUnlocked: 'Unit complete! The next unit is unlocked.',
  },

  /* The teacher is not the one learning English — this panel stays Arabic. */
  teacher: {
    eyebrow: 'لوحة المعلّمة',
    title: 'إدارة الصف',
    students: 'عدد الطالبات',
    activeOf: (n: number) => `${n} منهنّ بدأن اللعب`,
    classAccuracy: 'دقة الصف',
    skillsTitle: 'مستوى الصف في المهارات',
    weakest: 'الأضعف:',
    refresh: 'تحديث',
    exportCsv: 'تصدير ملف Excel',
    exported: 'نُزّل ملف الصف.',
    search: 'ابحثي باسم الطالبة أو رقمها…',
    noMatch: 'ما فيه نتيجة مطابقة للبحث.',
    sort: {
      xp: 'الأعلى نقاطاً',
      accuracy: 'الأعلى دقة',
      recent: 'الأحدث نشاطاً',
      name: 'أبجدياً',
    } as Record<string, string>,
    loading: 'جارٍ تحميل الصف…',
    loadFailed: 'تعذّر تحميل الصف.',
    retry: 'إعادة المحاولة',
    empty: 'لا توجد طالبات مسجّلات بعد.',
    answers: 'إجابات',
    accuracy: 'دقة',
    week: 'هذا الأسبوع',
    lastSeen: 'آخر لعب',
    showDetail: 'تفاصيل المهارات',
    hideDetail: 'إخفاء التفاصيل',
    streakLine: (n: number) => `أيام متتالية: ${n}`,
    badge: 'معلّمة',
    rename: 'تعديل الاسم',
    renamed: 'تم تحديث الاسم.',
    promote: 'ترقية لمعلّمة',
    demote: 'إلغاء صلاحية المعلّمة',
    promoted: (name: string) => `أصبحت «${name}» معلّمة.`,
    demoted: (name: string) => `أُلغيت صلاحية «${name}».`,
    reset: 'تصفير التقدّم',
    confirmReset: (name: string) => `تصفير تقدّم «${name}»؟`,
    resetNote: 'تبقى الطالبة وحسابها واسمها، لكن تعود نقاطها وإجاباتها إلى الصفر.',
    confirmResetYes: 'نعم، صفّري',
    wasReset: (name: string) => `صُفّر تقدّم «${name}».`,
    deleteAction: 'حذف بيانات الطالبة',
    confirm: (name: string) => `تأكيد حذف بيانات «${name}»؟`,
    confirmNote:
      'يُحذف تقدّمها ونقاطها وتختفي من لوحة الترتيب. تستطيع الدخول مرة أخرى بنفس الاسم والرمز وتبدأ من الصفر.',
    confirmYes: 'نعم، احذفي',
    deleted: (name: string) => `حُذفت بيانات «${name}».`,
    actionFailed: 'تعذّر تنفيذ العملية. تأكّدي من الاتصال وصلاحيتك.',
    denied: 'هذه الصفحة للمعلّمة فقط',
    deniedNote: 'حسابك لا يملك صلاحية إدارة الصف.',
    backHome: 'العودة للرئيسية',
  },

  lesson: {
    tag: 'The rule first',
    examples: 'Examples',
    note: 'اقرئي القاعدة والأمثلة — ستتكرر في التلميحات أثناء اللعب.',
    start: 'Got it — start',
    button: 'Rule',
  },

  /* Sign-in problems stay Arabic: nobody should be locked out by a sentence
     she cannot read. */
  auth: {
    loginTab: 'Sign in',
    registerTab: 'New account',
    nameLabel: 'Your name',
    namePlaceholder: 'Your name',
    pinLabel: 'PIN (4 digits or more)',
    loginAction: 'Sign in',
    registerAction: 'Create account',
    working: 'One moment…',
    visitAction: 'Visit as a guest',
    visitNote: 'للاطّلاع على الموقع ولوحة الترتيب دون حساب — لا يُحفظ تقدّم ولا يظهر الزائر في المنافسة.',
    loginHint: 'ادخلي بنفس الاسم والرمز من أي جهاز ويرجع لك تقدّمك كاملاً.',
    registerHint: 'احفظي اسمك ورمزك — فيهما تدخلين كل مرة، ولا يضيع مجهودك.',
    nameTaken: 'هذا الاسم مسجّل من قبل. إن كان حسابك فاختاري «Sign in»، وإلا غيّري الاسم.',
    wrongPin: 'الرمز السري غير صحيح. تأكّدي منه وحاولي مرة أخرى.',
    noAccount: 'ما فيه حساب بهذا الاسم. اختاري «New account» لإنشائه.',
    pinTooShort: 'الرمز قصير — استخدمي ٤ أرقام على الأقل.',
    tooMany: 'محاولات كثيرة. انتظري دقيقة ثم حاولي مرة أخرى.',
    loginFailed: 'تعذّر تسجيل الدخول. تأكّدي من اتصالك بالإنترنت.',
    registerFailed: 'تعذّر إنشاء الحساب. تأكّدي من اتصالك بالإنترنت.',
  },

  leaderboard: {
    title: 'Leaderboard',
    eyebrow: 'Compete',
    allTime: 'All time',
    week: 'This week',
    you: 'You',
    allTimeNote: 'since you started',
    weekNote: 'in the last 7 days',
    me: '· you',
    note: 'Ranking follows your player ID, not your name — renaming never moves you.',
    guestNote: 'هذا ترتيب الطالبات الفعلي. حساب الزائر لا يُحتسب ولا يظهر في القائمة.',
    loading: 'Loading the board…',
  },

  progress: {
    eyebrow: 'Your record',
    title: 'Progress',
    level: 'Level',
    accuracy: 'Accuracy',
    ofAnswers: (correct: number, total: number) => `${correct} of ${total} answers`,
    bestCombo: 'Best combo',
    inOneChallenge: 'in one challenge',
    streak: 'Day streak',
    keepAlive: 'keep it alive tomorrow',
    skills: 'Skills',
    units: 'Units',
  },

  profile: {
    eyebrow: 'Your account',
    title: 'Profile',
    editName: 'Edit name',
    save: 'Save',
    cancel: 'Cancel',
    renamed: 'Name updated — your progress and rank are unchanged.',
    playerId: 'Player ID',
    copy: 'Copy',
    copied: 'Player ID copied.',
    idNote: 'This never changes, even when you change your name.',
    icon: 'Your icon',
    sound: 'Sound effects',
    soundNote: 'Short blips for correct answers and level-ups',
    on: 'On',
    off: 'Off',
    photoCredits: 'Photo credits',
    photoCreditsNote: 'صور الألعاب من ويكيميديا كومنز، وهذه مصادرها ورخصها.',
    switch: 'Sign out',
    switchNote: 'Sign back in any time with the same name and PIN.',
  },

  achievements: {
    eyebrow: (done: number, total: number) => `${done} of ${total} unlocked`,
    title: 'Achievements',
    intro: 'Speed, accuracy, consistency and improvement each earn their own badge.',
    unlocked: 'Unlocked',
  },

  review: {
    eyebrow: 'Fix what you missed',
    title: 'Smart Review',
    empty: 'Nothing to review',
    emptyNote: 'You have fixed every question you got wrong. Play a challenge to keep going.',
    goJourney: 'Go to the journey',
    toFix: (n: number) => `${n} to fix`,
    leavesNote: 'A question leaves this list as soon as you get it right.',
    start: 'Start',
    gaps: 'Where the gaps are',
    theQuestions: 'The questions',
  },

  skillsPage: {
    eyebrow: 'Four skills, one course',
    title: 'Skills',
    answered: (n: number, correct: number) => `${n} answered · ${correct} right`,
    focus: 'Focus here',
    notStarted: 'Not started yet',
    accuracy: (pct: number) => `${pct}% accuracy`,
    practise: (skill: string) => `Practise ${skill} in this unit`,
  },

  toasts: {
    welcome: (name: string) => `Welcome, ${name}! Your torch is lit.`,
    welcomeBack: (name: string) => `Welcome back, ${name}.`,
    levelUp: (n: number) => `Level up! You reached level ${n}.`,
    achievement: (title: string) => `Achievement unlocked — ${title}`,
  },

  /* The visitor is a guest of the school, not a learner of English. */
  guest: {
    bar: 'وضع الزائر — تصفّح فقط، لا يُحفظ تقدّم ولا يظهر الزائر في الترتيب',
    title: 'وضع الزائر',
    note: 'أنتِ تتصفّحين الموقع كزائرة: تستطيعين الاطّلاع على الوحدات وتجربة أي تحدٍّ ورؤية ترتيب الطالبات. لا يُحفظ أي تقدّم، ولا يُنشأ حساب، ولا تظهرين في المنافسة.',
    exit: 'إنهاء وضع الزائر',
  },

  /* Whose app this is — a school and a teacher, named in their own language. */
  credits: {
    school: 'ثانوية زينب بنت معاوية',
    by: 'إعداد وتصميم: المعلّمة مشاعل العنزي',
    rights: 'جميع الحقوق محفوظة © 2026',
  },

  notFound: "That challenge doesn't exist.",
} as const;

/** Achievement names, in the app's language. */
export const achievementsAr: Record<string, { title: string; description: string }> = {
  'first-torch': { title: 'First Torch', description: 'Complete your first challenge.' },
  'perfect-round': { title: 'Perfect Round', description: 'Finish a challenge with no mistakes.' },
  'speed-runner': { title: 'Speed Runner', description: 'Get 5 correct answers in a row.' },
  'on-fire': { title: 'On Fire', description: 'Get 10 correct answers in a row.' },
  consistent: { title: 'Consistent', description: 'Play on 3 days in a row.' },
  'week-streak': { title: 'Seven Days of Fire', description: 'Keep a 7-day streak.' },
  accuracy: { title: 'Sharpest', description: 'Reach 85% accuracy over 50 answers.' },
  'knowledge-seeker': { title: 'Knowledge Seeker', description: 'Answer 100 questions.' },
  'grammar-master': { title: 'Grammar Master', description: '25 grammar questions at 80% accuracy.' },
  'vocab-master': { title: 'Vocabulary Master', description: '25 vocabulary questions at 80% accuracy.' },
  'reading-master': { title: 'Reading Master', description: '25 reading questions at 80% accuracy.' },
  'form-master': {
    title: 'Form & Meaning Master',
    description: '25 Form & Meaning questions at 80% accuracy.',
  },
  'boss-slayer': { title: 'Boss Slayer', description: 'Clear your first Boss Challenge.' },
  'unit-complete': { title: 'Unit Complete', description: 'Finish every challenge in a unit.' },
  'half-course': { title: 'Halfway Torch', description: 'Complete six units of the course.' },
  comeback: { title: 'Rising Torch', description: 'Fix 10 questions you once got wrong.' },
};
