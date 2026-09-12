/**
 * Soft visual accents for sidebar icons + dashboard stats.
 * Calm pastels anchored on Mandakar gold.
 */

export type AccentTone = {
  /** Soft chip behind icons */
  chip: string;
  /** Icon / number color */
  ink: string;
  /** Soft card wash */
  wash: string;
  /** Accent bar / progress fill */
  bar: string;
  /** Soft ring on cards */
  ring: string;
  /** Soft glow shadow */
  glow: string;
  /** Sidebar active row */
  active: string;
};

export const accents = {
  gold: {
    chip: "bg-[#f7f2e9] text-[#a89268]",
    ink: "text-[#9f8452]",
    wash: "from-[#faf7f1] via-white to-[#f7f2e9]/60",
    bar: "bg-[#c4ae84]",
    ring: "ring-[#eadfcb]/70",
    glow: "shadow-[#9f8452]/8",
    active:
      "sidebarActiveLink",
  },
  olive: {
    chip: "bg-lime-50 text-lime-700/80",
    ink: "text-lime-700/90",
    wash: "from-lime-50/70 via-white to-[#faf7f1]/40",
    bar: "bg-lime-400/80",
    ring: "ring-lime-100/80",
    glow: "shadow-lime-600/5",
    active:
      "bg-lime-50/90 text-slate-700 border-s-[3px] border-lime-300",
  },
  copper: {
    chip: "bg-orange-50 text-orange-700/75",
    ink: "text-orange-700/85",
    wash: "from-orange-50/70 via-white to-[#faf7f1]/40",
    bar: "bg-orange-300/90",
    ring: "ring-orange-100/80",
    glow: "shadow-orange-600/5",
    active:
      "bg-orange-50/90 text-slate-700 border-s-[3px] border-orange-300",
  },
  sapphire: {
    chip: "bg-sky-50 text-sky-700/75",
    ink: "text-sky-700/85",
    wash: "from-sky-50/70 via-white to-[#faf7f1]/40",
    bar: "bg-sky-300/90",
    ring: "ring-sky-100/80",
    glow: "shadow-sky-600/5",
    active:
      "bg-sky-50/90 text-slate-700 border-s-[3px] border-sky-300",
  },
  teal: {
    chip: "bg-teal-50 text-teal-700/75",
    ink: "text-teal-700/85",
    wash: "from-teal-50/70 via-white to-[#faf7f1]/40",
    bar: "bg-teal-300/90",
    ring: "ring-teal-100/80",
    glow: "shadow-teal-600/5",
    active:
      "bg-teal-50/90 text-slate-700 border-s-[3px] border-teal-300",
  },
  ochre: {
    chip: "bg-amber-50 text-amber-800/70",
    ink: "text-amber-800/80",
    wash: "from-amber-50/70 via-white to-[#faf7f1]/40",
    bar: "bg-amber-300/90",
    ring: "ring-amber-100/80",
    glow: "shadow-amber-600/5",
    active:
      "bg-amber-50/90 text-slate-700 border-s-[3px] border-amber-300",
  },
  wine: {
    chip: "bg-rose-50 text-rose-700/70",
    ink: "text-rose-700/80",
    wash: "from-rose-50/60 via-white to-[#faf7f1]/40",
    bar: "bg-rose-300/80",
    ring: "ring-rose-100/80",
    glow: "shadow-rose-600/5",
    active:
      "bg-rose-50/90 text-slate-700 border-s-[3px] border-rose-300",
  },
  coral: {
    chip: "bg-red-50 text-red-600/70",
    ink: "text-red-600/80",
    wash: "from-red-50/60 via-white to-[#faf7f1]/40",
    bar: "bg-red-300/80",
    ring: "ring-red-100/80",
    glow: "shadow-red-600/5",
    active:
      "bg-red-50/90 text-slate-700 border-s-[3px] border-red-300",
  },
  slate: {
    chip: "bg-slate-100/80 text-slate-600",
    ink: "text-slate-600",
    wash: "from-slate-50/80 via-white to-[#faf7f1]/40",
    bar: "bg-slate-300",
    ring: "ring-slate-100/90",
    glow: "shadow-slate-500/5",
    active:
      "bg-slate-100/80 text-slate-700 border-s-[3px] border-slate-300",
  },
  forest: {
    chip: "bg-emerald-50 text-emerald-700/75",
    ink: "text-emerald-700/85",
    wash: "from-emerald-50/70 via-white to-[#faf7f1]/40",
    bar: "bg-emerald-300/90",
    ring: "ring-emerald-100/80",
    glow: "shadow-emerald-600/5",
    active:
      "bg-emerald-50/90 text-slate-700 border-s-[3px] border-emerald-300",
  },
  bronze: {
    chip: "bg-[#f4efe6] text-[#9a8560]",
    ink: "text-[#8a7550]",
    wash: "from-[#f8f4ec] via-white to-white",
    bar: "bg-[#c4ae84]",
    ring: "ring-[#eadfcb]/80",
    glow: "shadow-[#937e55]/6",
    active:
      "bg-[#f4efe6]/95 text-slate-700 border-s-[3px] border-[#c4ae84]",
  },
} as const satisfies Record<string, AccentTone>;

export type AccentKey = keyof typeof accents;

/** Sidebar nav key → accent */
export const sidebarAccents: Record<string, AccentKey> = {
  dashboard: "gold",
  aboutUS: "bronze",
  lectures: "olive",
  lecturesItems: "olive",
  speeches: "copper",
  speechesItems: "copper",
  articles: "sapphire",
  articlesItems: "sapphire",
  explanations: "teal",
  explanationsItems: "teal",
  fatwas: "ochre",
  fatwasItems: "ochre",
  books: "wine",
  booksItems: "wine",
  banners: "coral",
  bannersItems: "coral",
  admins: "slate",
  roles: "forest",
  activityLogs: "slate",
  settings: "bronze",
  privacyPolicy: "slate",
  termsAndConditions: "ochre",
  profile: "gold",
  appContacts: "teal",
  categories: "bronze",
  changeOrder: "slate",
};

/** Content modules on dashboard */
export const moduleAccents: Record<string, AccentKey> = {
  lectures: "olive",
  speeches: "copper",
  articles: "sapphire",
  explanations: "teal",
  fatwas: "ochre",
  books: "wine",
};

/** KPI cards */
export const kpiAccents: Record<string, AccentKey> = {
  content: "gold",
  categories: "teal",
  admins: "slate",
  roles: "forest",
};

export function getAccent(key: AccentKey | string | undefined): AccentTone {
  if (key && key in accents) return accents[key as AccentKey];
  return accents.gold;
}
