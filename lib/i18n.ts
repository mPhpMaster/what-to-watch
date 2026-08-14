import type { Company, Mood, TimeBucket, Title } from "./types";

/**
 * The whole two-language system, with no dependencies and no i18n library.
 *
 * Every user-facing string in the app lives in `messages`. `ar` is the source
 * of truth: it defines `MessageKey`, so `en` is a `Record<MessageKey, string>`
 * and a forgotten (or misspelled) translation is a TypeScript error, not a
 * blank spot in the UI.
 */

export type Locale = "ar" | "en";

export const LOCALES: Locale[] = ["ar", "en"];
export const DEFAULT_LOCALE: Locale = "ar";

export function isLocale(v: string): v is Locale {
  return (LOCALES as string[]).includes(v);
}

/** Route params arrive as `string`; unknown values fall back to the default. */
export function resolveLocale(v: string | undefined): Locale {
  return v && isLocale(v) ? v : DEFAULT_LOCALE;
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** The other locale — used by the header toggle. */
export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}

/** OpenGraph wants a full locale tag, not the bare language. */
export const OG_LOCALE: Record<Locale, string> = {
  ar: "ar_SA",
  en: "en_US",
};

const ar = {
  // --- Brand and navigation ---
  "brand.name": "وش أشاهد؟",
  "nav.takeQuiz": "خذ الاختبار",
  "nav.language": "اللغة",
  "lang.ar.short": "AR",
  "lang.en.short": "EN",
  "lang.ar.name": "العربية",
  "lang.en.name": "الإنجليزية",

  // --- Metadata ---
  "meta.title": "وش أشاهد؟ | اكتشف فيلمك الجاي",
  "meta.titleTemplate": "%s | وش أشاهد؟",
  "meta.description":
    "ما تدري وش تشاهد الليلة؟ جاوب على أربع أسئلة سريعة ونعطيك فيلم أو مسلسل يناسب مزاجك، مع روابط مباشرة لشاهد ونتفليكس.",
  "meta.og.title": "وش أشاهد؟",
  "meta.og.description":
    "جاوب على أربع أسئلة سريعة ونختار لك فيلمك الجاي — متوفر على شاهد ونتفليكس.",
  "meta.quiz.title": "جد فيلمك",
  "meta.result.title": "اقتراحك",
  "meta.admin.title": "لوحة التحكم",

  // --- Homepage ---
  "home.title": "وش أشاهد الليلة؟",
  "home.subtitle":
    "لا تضيع نص ساعة تقلب في القوائم. جاوب على خمس أسئلة سريعة ونختار لك شي يناسب مزاجك ووقتك.",
  "home.cta": "جد فيلمك الآن",
  "home.ctaNote": "٥ أسئلة · أقل من دقيقة",
  "rail.popular": "الأكثر مشاهدة هذا الأسبوع",
  "rail.family": "مناسب للعائلة",
  "rail.binge": "مسلسلات تستاهل السهر",
  "rail.laugh": "ضحك مضمون",
  "rail.short": "لو عندك أقل من ساعة",

  // --- Weather / time-of-day line ---
  "vibe.night": "الليل طويل والسهرة ما بدت",
  "vibe.morning": "صباحك أحلى مع شي خفيف",
  "vibe.afternoon": "استراحة الظهر تبي فرجة هادية",
  "vibe.evening": "المغرب طل، وقت الفيلم",
  "vibe.hot": "الجو حر برا ({temp}°) — وقت مثالي للمشاهدة",
  "vibe.cold": "الجو بارد ({temp}°) — جهز البطانية والشاشة",

  // --- Cards and watch buttons ---
  "card.movie": "فيلم",
  "card.series": "مسلسل",
  "watch.shahid": "شاهد",
  "watch.shahid.long": "شاهد على شاهد",
  "watch.netflix": "نتفليكس",
  "watch.netflix.long": "شاهد على نتفليكس",

  // --- Quiz chrome ---
  "quiz.back": "رجوع",
  "quiz.backArrow": "→",
  "quiz.progressOf": "من",
  "quiz.matching.title": "نختار لك الحين…",
  "quiz.matching.sub": "نقلب القائمة على مزاجك ووقتك",

  // --- Quiz questions ---
  "q.mood.title": "المزاج الحين؟",
  "q.mood.laugh": "ضحك",
  "q.mood.thrill": "إثارة وتشويق",
  "q.mood.horror": "رعب",
  "q.mood.drama": "دراما وعاطفة",
  "q.mood.chill": "استرخاء",

  "q.who.title": "وحدك ولا مع ناس؟",
  "q.who.alone": "لحالي",
  "q.who.family": "مع العائلة",
  "q.who.friends": "مع الأصدقاء",

  "q.time.title": "عندك وقت قد ايش؟",
  "q.time.short": "أقل من ساعة",
  "q.time.short.hint": "حلقة وحدة تكفي",
  "q.time.movie": "فيلم كامل",
  "q.time.movie.hint": "ساعة ونص لثلاث",
  "q.time.binge": "أوقات طويلة",
  "q.time.binge.hint": "مسلسل نغرق فيه",

  "q.fam.title": "تبي شيء جديد ولا تعيد شيء تعرفه؟",
  "q.fam.new": "جديد علي",
  "q.fam.known": "أعرفه وأحبه",

  "q.kids.title": "تبي محتوى مناسب للعائلة؟",
  "q.kids.yes": "نعم",
  "q.kids.yes.hint": "نستبعد المحتوى غير المناسب",
  "q.kids.no": "ما يهمني",

  // --- Short answer labels (chips, admin toggles) ---
  "mood.laugh": "ضحك",
  "mood.thrill": "إثارة",
  "mood.horror": "رعب",
  "mood.drama": "دراما",
  "mood.chill": "استرخاء",
  "company.alone": "لحالي",
  "company.family": "مع العائلة",
  "company.friends": "مع الأصدقاء",
  "time.short": "أقل من ساعة",
  "time.movie": "فيلم كامل",
  "time.binge": "وقت طويل",

  // --- Result page ---
  "result.youPicked": "اخترت:",
  "result.familyChip": "مناسب للعائلة",
  "result.relaxed":
    "ما لقينا عدد كافي يطابق كل اختياراتك بالضبط، فوسّعنا شوي. هذي أقرب الاقتراحات لك.",
  "result.ourPick": "اختيارنا لك",
  "result.seasons": "مواسم",
  "result.minutes": "دقيقة",
  "result.another": "عطني اقتراح ثاني",
  "result.backups": "اقتراحات احتياطية",
  "result.tryAgain": "جرب مرة ثانية",
  "result.empty.title": "ما لقينا شي نقترحه",
  "result.empty.body": "القائمة فاضية حالياً. جرب مرة ثانية بعد شوي، أو غيّر إجاباتك.",

  // --- Share ---
  "share.action": "شارك الاقتراح",
  "share.copied": "تم نسخ الرابط",
  "share.textPrefix": "اقتراحي لك:",

  // --- Footer ---
  "footer.note":
    "روابط المشاهدة تفتح صفحة البحث في شاهد أو نتفليكس. التوفر يتغير من وقت لوقت ومن دولة لدولة.",
  "footer.admin": "لوحة التحكم",

  // --- Admin: setup notice ---
  "admin.setup.title": "لوحة التحكم غير مفعّلة",
  "admin.setup.bodyBefore": "أضف المتغيرين التاليين في ملف",
  "admin.setup.bodyAfter": "ثم أعد تشغيل الخادم:",

  // --- Admin: login ---
  "admin.title": "لوحة التحكم",
  "admin.login.hint": "أدخل كلمة المرور لتعديل قائمة الأعمال.",
  "admin.login.password": "كلمة المرور",
  "admin.login.submit": "دخول",
  "admin.login.busy": "جاري الدخول…",

  // --- Admin: panel ---
  "admin.titlesCount": "عمل",
  "admin.storage": "التخزين:",
  "admin.storage.blob": "Vercel Blob",
  "admin.storage.fs": "ملف محلي",
  "admin.logout": "خروج",
  "admin.readOnly":
    "التخزين للقراءة فقط في هذه البيئة. أضف BLOB_READ_WRITE_TOKEN عشان تقدر تحفظ التعديلات.",
  "admin.search": "ابحث بالاسم أو المعرّف",
  "admin.new": "+ عمل جديد",
  "admin.form.editing": "تعديل:",
  "admin.form.adding": "إضافة عمل",
  "admin.field.id": "المعرّف (إنجليزي)",
  "admin.field.year": "السنة",
  "admin.field.titleAr": "العنوان بالعربي",
  "admin.field.titleEn": "العنوان بالإنجليزي",
  "admin.field.kind": "النوع",
  "admin.field.timeBucket": "المدة المناسبة",
  "admin.field.runtime": "مدة الفيلم بالدقائق",
  "admin.field.seasons": "عدد المواسم",
  "admin.field.genres": "التصنيفات (افصلها بفاصلة)",
  "admin.field.popularity": "الشعبية (0-100)",
  "admin.field.overviewAr": "الوصف بالعربي",
  "admin.field.overviewEn": "الوصف بالإنجليزي (اختياري)",
  "admin.field.shahidUrl": "رابط شاهد المباشر (اختياري)",
  "admin.field.netflixUrl": "رابط نتفليكس المباشر (اختياري)",
  "admin.field.posterPath": "مسار البوستر من TMDB (اختياري)",
  "admin.legend.moods": "المزاج",
  "admin.legend.audience": "مناسب للمشاهدة",
  "admin.legend.traits": "خصائص",
  "admin.legend.platforms": "المنصات — لازم وحدة على الأقل",
  "admin.trait.familyFriendly": "مناسب للعائلة",
  "admin.trait.iconic": "معروف ومحبوب",
  "admin.save": "حفظ",
  "admin.saving": "جاري الحفظ…",
  "admin.cancel": "إلغاء",
  "admin.edit": "تعديل",
  "admin.delete": "حذف",
  "admin.noResults": "ما فيه نتائج",
  "admin.confirmDelete": "تحذف هذا العمل نهائياً؟",

  // --- Errors (server → client; the wire carries these keys, not text) ---
  "err.unauthorized": "غير مصرح",
  "err.readOnly": "التخزين للقراءة فقط. فعّل Vercel Blob للتعديل من هنا.",
  "err.badRequest": "طلب غير صالح",
  "err.server": "صار خطأ غير متوقع",
  "err.adminNotConfigured":
    "لوحة التحكم غير مفعّلة. حدد ADMIN_PASSWORD و ADMIN_SECRET في .env.local",
  "err.wrongPassword": "كلمة المرور غير صحيحة",
  "err.loginFailed": "تعذر تسجيل الدخول",
  "err.saveFailed": "تعذر الحفظ",
  "err.deleteFailed": "تعذر الحذف",
  "err.duplicateId": "فيه عنوان بنفس المعرّف",
  "err.idTaken": "المعرّف الجديد مستخدم من عنوان ثاني",
  "err.notFound": "ما لقينا هذا العنوان",
  "err.id": "المعرّف لازم يكون حروف إنجليزية صغيرة وأرقام وشرطات",
  "err.titleAr": "العنوان بالعربي مطلوب",
  "err.titleEn": "العنوان بالإنجليزي مطلوب (نستخدمه في بحث نتفليكس)",
  "err.year": "سنة غير صحيحة",
  "err.kind": "النوع لازم يكون فيلم أو مسلسل",
  "err.moods": "اختر مزاج واحد على الأقل",
  "err.audience": "اختر مع من تنشاهد",
  "err.timeBucket": "مدة غير صحيحة",
  "err.popularity": "الشعبية بين 0 و 100",
  "err.platforms": "لازم يكون متوفر على منصة وحدة على الأقل، وإلا ما نقدر نقترحه",
  "err.shahidUrl": "رابط شاهد لازم يبدأ بـ https://",
  "err.netflixUrl": "رابط نتفليكس لازم يبدأ بـ https://",
} as const;

export type MessageKey = keyof typeof ar;

const en: Record<MessageKey, string> = {
  // --- Brand and navigation ---
  "brand.name": "What2Watch",
  "nav.takeQuiz": "Take the quiz",
  "nav.language": "Language",
  "lang.ar.short": "AR",
  "lang.en.short": "EN",
  "lang.ar.name": "Arabic",
  "lang.en.name": "English",

  // --- Metadata ---
  "meta.title": "What2Watch | Find tonight's pick",
  "meta.titleTemplate": "%s | What2Watch",
  "meta.description":
    "Not sure what to watch tonight? Answer five quick questions and we'll pick a movie or series that fits your mood, with direct links to Shahid and Netflix.",
  "meta.og.title": "What2Watch",
  "meta.og.description":
    "Answer a few quick questions and we'll pick your next watch — streaming on Shahid and Netflix.",
  "meta.quiz.title": "Find your pick",
  "meta.result.title": "Your pick",
  "meta.admin.title": "Admin panel",

  // --- Homepage ---
  "home.title": "What should I watch tonight?",
  "home.subtitle":
    "Don't lose half an hour scrolling. Answer five quick questions and we'll pick something that fits your mood and the time you have.",
  "home.cta": "Find your pick now",
  "home.ctaNote": "5 questions · under a minute",
  "rail.popular": "Most watched this week",
  "rail.family": "Good for the family",
  "rail.binge": "Series worth staying up for",
  "rail.laugh": "Guaranteed laughs",
  "rail.short": "If you have under an hour",

  // --- Weather / time-of-day line ---
  "vibe.night": "The night is long and it's only getting started",
  "vibe.morning": "Mornings go better with something light",
  "vibe.afternoon": "An afternoon break calls for an easy watch",
  "vibe.evening": "Sun's down — movie time",
  "vibe.hot": "It's hot out there ({temp}°) — perfect time to stay in and watch",
  "vibe.cold": "It's cold out ({temp}°) — grab a blanket and press play",

  // --- Cards and watch buttons ---
  "card.movie": "Movie",
  "card.series": "Series",
  "watch.shahid": "Shahid",
  "watch.shahid.long": "Watch on Shahid",
  "watch.netflix": "Netflix",
  "watch.netflix.long": "Watch on Netflix",

  // --- Quiz chrome ---
  "quiz.back": "Back",
  "quiz.backArrow": "←",
  "quiz.progressOf": "of",
  "quiz.matching.title": "Picking for you…",
  "quiz.matching.sub": "Going through the catalog for your mood and time",

  // --- Quiz questions ---
  "q.mood.title": "What's the mood right now?",
  "q.mood.laugh": "Laughs",
  "q.mood.thrill": "Thrills and suspense",
  "q.mood.horror": "Horror",
  "q.mood.drama": "Drama and feelings",
  "q.mood.chill": "Chill",

  "q.who.title": "Watching alone or with people?",
  "q.who.alone": "On my own",
  "q.who.family": "With family",
  "q.who.friends": "With friends",

  "q.time.title": "How much time do you have?",
  "q.time.short": "Under an hour",
  "q.time.short.hint": "One episode is enough",
  "q.time.movie": "A full movie",
  "q.time.movie.hint": "An hour and a half to three",
  "q.time.binge": "All evening",
  "q.time.binge.hint": "A series to sink into",

  "q.fam.title": "Something new, or something you already know?",
  "q.fam.new": "New to me",
  "q.fam.known": "Something I know and love",

  "q.kids.title": "Do you want family-friendly content?",
  "q.kids.yes": "Yes",
  "q.kids.yes.hint": "We'll leave out anything unsuitable",
  "q.kids.no": "Doesn't matter",

  // --- Short answer labels (chips, admin toggles) ---
  "mood.laugh": "Laughs",
  "mood.thrill": "Thrills",
  "mood.horror": "Horror",
  "mood.drama": "Drama",
  "mood.chill": "Chill",
  "company.alone": "On my own",
  "company.family": "With family",
  "company.friends": "With friends",
  "time.short": "Under an hour",
  "time.movie": "A full movie",
  "time.binge": "All evening",

  // --- Result page ---
  "result.youPicked": "You picked:",
  "result.familyChip": "Family friendly",
  "result.relaxed":
    "We couldn't find enough titles matching every choice exactly, so we widened the search. These are the closest picks.",
  "result.ourPick": "Our pick for you",
  "result.seasons": "seasons",
  "result.minutes": "min",
  "result.another": "Give me another pick",
  "result.backups": "Backup picks",
  "result.tryAgain": "Try again",
  "result.empty.title": "Nothing to suggest yet",
  "result.empty.body":
    "The catalog is empty right now. Try again in a bit, or change your answers.",

  // --- Share ---
  "share.action": "Share this pick",
  "share.copied": "Link copied",
  "share.textPrefix": "My pick for you:",

  // --- Footer ---
  "footer.note":
    "Watch links open a search page on Shahid or Netflix. Availability changes over time and from country to country.",
  "footer.admin": "Admin panel",

  // --- Admin: setup notice ---
  "admin.setup.title": "The admin panel is not enabled",
  "admin.setup.bodyBefore": "Add these two variables to",
  "admin.setup.bodyAfter": "then restart the server:",

  // --- Admin: login ---
  "admin.title": "Admin panel",
  "admin.login.hint": "Enter the password to edit the catalog.",
  "admin.login.password": "Password",
  "admin.login.submit": "Log in",
  "admin.login.busy": "Logging in…",

  // --- Admin: panel ---
  "admin.titlesCount": "titles",
  "admin.storage": "Storage:",
  "admin.storage.blob": "Vercel Blob",
  "admin.storage.fs": "Local file",
  "admin.logout": "Log out",
  "admin.readOnly":
    "Storage is read-only in this environment. Add BLOB_READ_WRITE_TOKEN to save changes.",
  "admin.search": "Search by name or id",
  "admin.new": "+ New title",
  "admin.form.editing": "Editing:",
  "admin.form.adding": "Add a title",
  "admin.field.id": "Id (latin)",
  "admin.field.year": "Year",
  "admin.field.titleAr": "Arabic title",
  "admin.field.titleEn": "English title",
  "admin.field.kind": "Kind",
  "admin.field.timeBucket": "Time bucket",
  "admin.field.runtime": "Runtime in minutes",
  "admin.field.seasons": "Number of seasons",
  "admin.field.genres": "Genres (comma separated)",
  "admin.field.popularity": "Popularity (0-100)",
  "admin.field.overviewAr": "Arabic overview",
  "admin.field.overviewEn": "English overview (optional)",
  "admin.field.shahidUrl": "Direct Shahid link (optional)",
  "admin.field.netflixUrl": "Direct Netflix link (optional)",
  "admin.field.posterPath": "TMDB poster path (optional)",
  "admin.legend.moods": "Moods",
  "admin.legend.audience": "Good to watch",
  "admin.legend.platforms": "Platforms — at least one is required",
  "admin.legend.traits": "Traits",
  "admin.trait.familyFriendly": "Family friendly",
  "admin.trait.iconic": "Well known and loved",
  "admin.save": "Save",
  "admin.saving": "Saving…",
  "admin.cancel": "Cancel",
  "admin.edit": "Edit",
  "admin.delete": "Delete",
  "admin.noResults": "No results",
  "admin.confirmDelete": "Delete this title permanently?",

  // --- Errors (server → client; the wire carries these keys, not text) ---
  "err.unauthorized": "Not authorized",
  "err.readOnly": "Storage is read-only. Enable Vercel Blob to edit from here.",
  "err.badRequest": "Invalid request",
  "err.server": "Something went wrong",
  "err.adminNotConfigured":
    "The admin panel is not enabled. Set ADMIN_PASSWORD and ADMIN_SECRET in .env.local",
  "err.wrongPassword": "Wrong password",
  "err.loginFailed": "Could not log in",
  "err.saveFailed": "Could not save",
  "err.deleteFailed": "Could not delete",
  "err.duplicateId": "A title with this id already exists",
  "err.idTaken": "That new id is already used by another title",
  "err.notFound": "We couldn't find that title",
  "err.id": "The id must be lowercase latin letters, digits and dashes",
  "err.titleAr": "The Arabic title is required",
  "err.titleEn": "The English title is required (we use it for Netflix search)",
  "err.year": "Invalid year",
  "err.kind": "Kind must be movie or series",
  "err.moods": "Pick at least one mood",
  "err.audience": "Pick who this is good to watch with",
  "err.timeBucket": "Invalid time bucket",
  "err.popularity": "Popularity must be between 0 and 100",
  "err.platforms":
    "It must be available on at least one platform, otherwise we can't recommend it",
  "err.shahidUrl": "The Shahid link must start with https://",
  "err.netflixUrl": "The Netflix link must start with https://",
};

export const messages: Record<Locale, Record<MessageKey, string>> = { ar, en };

/** Look up a message. An unknown key is a compile error, never a blank UI. */
export function t(locale: Locale, key: MessageKey): string {
  return messages[locale][key];
}

/** Keys that crossed the network arrive as `string` and need a runtime check. */
export function isMessageKey(v: string): v is MessageKey {
  return Object.prototype.hasOwnProperty.call(ar, v);
}

/** Translate a key received from the API, falling back when it isn't one. */
export function tKey(locale: Locale, key: unknown, fallback: MessageKey): string {
  return typeof key === "string" && isMessageKey(key)
    ? t(locale, key)
    : t(locale, fallback);
}

// --- Answer label maps -------------------------------------------------------

export const MOOD_LABELS: Record<Locale, Record<Mood, string>> = {
  ar: {
    laugh: ar["mood.laugh"],
    thrill: ar["mood.thrill"],
    horror: ar["mood.horror"],
    drama: ar["mood.drama"],
    chill: ar["mood.chill"],
  },
  en: {
    laugh: en["mood.laugh"],
    thrill: en["mood.thrill"],
    horror: en["mood.horror"],
    drama: en["mood.drama"],
    chill: en["mood.chill"],
  },
};

export const COMPANY_LABELS: Record<Locale, Record<Company, string>> = {
  ar: {
    alone: ar["company.alone"],
    family: ar["company.family"],
    friends: ar["company.friends"],
  },
  en: {
    alone: en["company.alone"],
    family: en["company.family"],
    friends: en["company.friends"],
  },
};

export const TIME_LABELS: Record<Locale, Record<TimeBucket, string>> = {
  ar: {
    short: ar["time.short"],
    movie: ar["time.movie"],
    binge: ar["time.binge"],
  },
  en: {
    short: en["time.short"],
    movie: en["time.movie"],
    binge: en["time.binge"],
  },
};

export function moodLabel(locale: Locale, mood: Mood): string {
  return MOOD_LABELS[locale][mood];
}

export function companyLabel(locale: Locale, who: Company): string {
  return COMPANY_LABELS[locale][who];
}

export function timeLabel(locale: Locale, bucket: TimeBucket): string {
  return TIME_LABELS[locale][bucket];
}

export function kindLabel(locale: Locale, kind: Title["kind"]): string {
  return t(locale, kind === "series" ? "card.series" : "card.movie");
}

// --- Catalog content ---------------------------------------------------------

/**
 * Every distinct `genresAr` value in data/titles.json, extracted from the file
 * rather than guessed. Anything unmapped falls back to the Arabic string so a
 * tag is never rendered empty.
 */
export const GENRE_EN: Record<string, string> = {
  "أكشن": "Action",
  "أنيميشن": "Animation",
  "إثارة": "Thriller",
  "تاريخي": "Historical",
  "جريمة": "Crime",
  "خيال علمي": "Sci-Fi",
  "دراما": "Drama",
  "رعب": "Horror",
  "روحاني": "Spiritual",
  "رومانسي": "Romance",
  "رياضة": "Sports",
  "ساخر": "Satire",
  "سعودي": "Saudi",
  "طبخ": "Cooking",
  "طبيعة": "Nature",
  "طعام": "Food",
  "عائلي": "Family",
  "غموض": "Mystery",
  "فانتازيا": "Fantasy",
  "كوميديا": "Comedy",
  "كوميديا سوداء": "Dark comedy",
  "مراهقة": "Teen",
  "مغامرة": "Adventure",
  "وثائقي": "Documentary",
};

export function genresFor(title: Title, locale: Locale): string[] {
  if (locale === "ar") return title.genresAr;
  return title.genresAr.map((g) => GENRE_EN[g] ?? g);
}

/** The title shown as the headline. */
export function primaryTitle(title: Title, locale: Locale): string {
  return locale === "ar" ? title.titleAr : title.titleEn || title.titleAr;
}

/** The muted second line: always the other script. */
export function secondaryTitle(title: Title, locale: Locale): string {
  return locale === "ar" ? title.titleEn : title.titleAr;
}

/** The script direction of `secondaryTitle`, for correct bidi rendering. */
export function secondaryDir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "ltr" : "rtl";
}

/** English copy is optional, so an empty one falls back to the Arabic. */
export function overviewFor(title: Title, locale: Locale): string {
  if (locale === "en") return title.overviewEn?.trim() || title.overviewAr;
  return title.overviewAr;
}
