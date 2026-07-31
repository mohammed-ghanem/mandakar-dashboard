/**
 * Static placeholder stats for dashboard UI only.
 * Replace with API data when wiring later.
 */
export const dashboardMock = {
  totals: {
    content: 248,
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
  categoriesByType: [
    { key: "lectures", roots: 8, children: 14 },
    { key: "speeches", roots: 5, children: 7 },
    { key: "articles", roots: 6, children: 9 },
    { key: "explanations", roots: 4, children: 5 },
    { key: "fatwas", roots: 3, children: 4 },
    { key: "books", roots: 2, children: 3 },
  ],
  publishing: {
    active: 214,
    inactive: 34,
    publishedThisWeek: 18,
    draftsRatio: 14,
  },
  system: {
    adminsActive: 10,
    adminsInactive: 2,
    rolesActive: 5,
    rolesInactive: 1,
    settingsReady: 4,
    settingsTotal: 4,
  },
  recent: [
    { key: "lectures", action: "create", title: "محاضرة في الصلاة", when: "منذ ساعتين" },
    { key: "fatwas", action: "update", title: "فتوى في الطهارة", when: "منذ 4 ساعات" },
    { key: "articles", action: "create", title: "مقال في العقيدة", when: "أمس" },
    { key: "books", action: "toggle", title: "كتاب التوحيد", when: "أمس" },
    { key: "speeches", action: "create", title: "خطبة الجمعة", when: "منذ يومين" },
  ],
} as const;

export type ModuleColor = (typeof dashboardMock.modules)[number]["color"];
