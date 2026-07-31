/**
 * Static placeholder stats for dashboard UI only.
 * Replace with API data when wiring later.
 */
export const dashboardMock = {
  totals: {
    content: 248,
    visits: 18420,
    categories: 64,
    admins: 12,
    roles: 6,
  },
  modules: [
    { key: "lectures", count: 72, active: 61, inactive: 11, color: "emerald" },
    { key: "speeches", count: 41, active: 36, inactive: 5, color: "teal" },
    { key: "articles", count: 58, active: 50, inactive: 8, color: "cyan" },
    { key: "explanations", count: 33, active: 28, inactive: 5, color: "sky" },
    { key: "fatwas", count: 27, active: 24, inactive: 3, color: "amber" },
    { key: "books", count: 17, active: 15, inactive: 2, color: "lime" },
  ],
  publishing: {
    active: 214,
    inactive: 34,
    publishedThisWeek: 18,
  },
  /** Latest addition only — one item per content type. */
  recent: [
    { key: "lectures", title: "محاضرة في الصلاة", when: "منذ ساعتين" },
    { key: "speeches", title: "خطبة الجمعة", when: "منذ يومين" },
    { key: "articles", title: "مقال في العقيدة", when: "أمس" },
    { key: "explanations", title: "شرح كتاب التوحيد", when: "منذ 3 أيام" },
    { key: "fatwas", title: "فتوى في الطهارة", when: "منذ 4 ساعات" },
    { key: "books", title: "كتاب التوحيد", when: "منذ أسبوع" },
  ],
} as const;

export type ModuleColor = (typeof dashboardMock.modules)[number]["color"];
