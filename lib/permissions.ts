/* eslint-disable @typescript-eslint/no-explicit-any */

import { CATEGORY_TYPES } from "@/constants/categoryTypes";
import { extractProfileUser, type ProfileUser } from "@/lib/profileUser";

export const CONTENT_MODULES = [...CATEGORY_TYPES] as string[];

/** Always reachable for any authenticated user. */
export const ALWAYS_ALLOWED_PATHS = new Set([
  "/",
  "/profile",
  "/update-profile",
  "/change-password",
]);

const MODULE_ROUTE_ALIASES: Record<string, string[]> = {
  "about-sheikh": ["about_sheikh", "about-sheikh", "aboutsheikh"],
  "privacy-policy": [
    "privacy_policy",
    "privacy-policy",
    "privacy",
    "settings",
  ],
  "terms-conditions": [
    "terms_and_conditions",
    "terms-conditions",
    "terms",
    "settings",
  ],
  "app-contacts": ["app_contacts", "app-contacts", "contacts", "settings"],
  "contact-us": ["contact_us", "contact-us", "contacts", "settings"],
  article: ["articles"],
  articel: ["articles"],
  categories: ["lectures"],
};

function addPermissionKey(out: Set<string>, value: string) {
  const key = value.trim().toLowerCase();
  if (key) out.add(key);
}

const MODULE_LABEL_HINTS: Record<string, string[]> = {
  articles: ["articles", "article", "مقال", "المقالات"],
  lectures: ["lectures", "lecture", "محاضر", "المحاضرات"],
  speeches: ["speeches", "speech", "خطب", "خطبة", "الخطب"],
  books: ["books", "book", "كتب", "الكتب", "رسائل"],
  explanations: ["explanations", "explanation", "شروح", "الشروح"],
  fatwas: ["fatwas", "fatwa", "فتوى", "فتاوى", "الفتاوى"],
  banners: ["banners", "banner", "بنر", "البنرات"],
  admins: ["admins", "admin_users", "مستخدم", "المستخدمين"],
  roles: ["roles", "صلاحيات", "الأدوار"],
  about_sheikh: [
    "about_sheikh",
    "about-sheikh",
    "aboutsheikh",
    "ترجمة",
    "الشيخ",
  ],
  privacy_policy: ["privacy_policy", "privacy", "خصوصية", "سياسة"],
  terms_and_conditions: ["terms_and_conditions", "terms", "شروط", "أحكام"],
  app_contacts: ["app_contacts", "contacts", "تواصل"],
};

function inferModuleKeysFromText(value: string, keys: Set<string>) {
  const text = value.trim().toLowerCase();
  if (!text) return;

  for (const [module, hints] of Object.entries(MODULE_LABEL_HINTS)) {
    if (hints.some((hint) => text.includes(hint.toLowerCase()))) {
      addPermissionKey(keys, module);
    }
  }
}

function collectPermissionKeys(value: unknown, out: Set<string>) {
  if (value == null) return;

  if (typeof value === "string") {
    addPermissionKey(out, value);
    inferModuleKeysFromText(value, out);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPermissionKeys(item, out));
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;

  if (typeof record.key === "string") {
    addPermissionKey(out, record.key);
  }

  if (typeof record.slug === "string") {
    addPermissionKey(out, record.slug);
  }

  if (typeof record.name === "string") {
    addPermissionKey(out, record.name);
    inferModuleKeysFromText(record.name, out);
  }

  if (typeof record.name_ar === "string") {
    addPermissionKey(out, record.name_ar);
    inferModuleKeysFromText(record.name_ar, out);
  }

  if (typeof record.name_en === "string") {
    addPermissionKey(out, record.name_en);
    inferModuleKeysFromText(record.name_en, out);
  }

  if (typeof record.control_key === "string") {
    addPermissionKey(out, record.control_key);
  }

  if (typeof record.permission_key === "string") {
    addPermissionKey(out, record.permission_key);
  }

  if (Array.isArray(record.controls)) {
    collectPermissionKeys(record.controls, out);
  }

  if (Array.isArray(record.permissions)) {
    collectPermissionKeys(record.permissions, out);
  }

  if (record.permission_keys != null) {
    collectPermissionKeys(record.permission_keys, out);
  }

  if (record.permissionKeys != null) {
    collectPermissionKeys(record.permissionKeys, out);
  }
}

function isAdminRoleLabel(value: string): boolean {
  const text = value.trim().toLowerCase();
  return (
    text === "admin" ||
    text === "super admin" ||
    text === "super_admin" ||
    text === "super-admin" ||
    text === "superadmin" ||
    text === "administrator" ||
    text === "أدمن" ||
    text === "ادمن" ||
    text.includes("super admin") ||
    text.includes("admin") ||
    text.includes("أدمن") ||
    text.includes("ادمن") ||
    text.includes("مدير") ||
    text.includes("الادارة") ||
    text.includes("الإدارة")
  );
}

function roleGrantsFullAccess(role: unknown): boolean {
  if (role == null) return false;

  if (typeof role === "string") {
    return isAdminRoleLabel(role);
  }

  if (typeof role !== "object") return false;

  const record = role as Record<string, unknown>;
  if (record.is_super_admin === true || record.is_super_admin === 1) return true;

  const labels = [
    record.slug,
    record.key,
    record.name,
    record.name_en,
    record.name_ar,
    record.title,
  ];

  return labels.some(
    (label) => typeof label === "string" && isAdminRoleLabel(label),
  );
}

function collectRoleLabels(value: unknown, keys: Set<string>) {
  if (value == null) return;

  if (typeof value === "string") {
    addPermissionKey(keys, value);
    inferModuleKeysFromText(value, keys);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectRoleLabels(item, keys));
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;
  for (const field of ["name", "name_ar", "name_en", "slug", "key", "title"]) {
    if (typeof record[field] === "string") {
      addPermissionKey(keys, record[field] as string);
      inferModuleKeysFromText(record[field] as string, keys);
    }
  }
}

function collectPermissionsFromRoles(value: unknown, keys: Set<string>) {
  if (value == null) return;

  collectRoleLabels(value, keys);

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item != null && typeof item === "object") {
        const record = item as Record<string, unknown>;
        collectPermissionKeys(record.permissions, keys);
        collectPermissionKeys(record.role_permissions, keys);
      }
    });
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    collectPermissionKeys(record.permissions, keys);
    collectPermissionKeys(record.role_permissions, keys);
  }
}

function collectPermissionIdsFromRoles(value: unknown, out: Set<number>) {
  if (value == null) return;

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item != null && typeof item === "object") {
        const record = item as Record<string, unknown>;
        collectPermissionIds(record.permissions, out);
        collectPermissionIds(record.role_permissions, out);
      }
    });
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    collectPermissionIds(record.permissions, out);
    collectPermissionIds(record.role_permissions, out);
  }
}

export function extractUserPermissionKeys(
  profileData: unknown,
): Set<string> {
  const keys = new Set<string>();
  const user = extractProfileUser(profileData);
  if (!user) return keys;

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectPermissionKeys(root.permissions, keys);
    collectPermissionKeys(root.permission_keys, keys);
    collectPermissionKeys(root.permissionKeys, keys);
    collectPermissionKeys(root.role_permissions, keys);
  }

  collectPermissionKeys(user.permissions, keys);
  collectPermissionKeys(user.permission_keys, keys);
  collectPermissionKeys(user.permissionKeys, keys);
  collectPermissionKeys(user.role_permissions, keys);
  collectPermissionKeys(user.abilities, keys);
  collectPermissionKeys(user.permission_names, keys);
  collectPermissionsFromRoles(user.role, keys);
  collectPermissionsFromRoles(user.roles, keys);
  collectRoleLabels(user.role, keys);
  collectRoleLabels(user.roles, keys);
  collectRoleLabels(user.roles_ids, keys);

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectPermissionsFromRoles(root.role, keys);
    collectPermissionsFromRoles(root.roles, keys);
    collectRoleLabels(root.role, keys);
    collectRoleLabels(root.roles, keys);
    collectRoleLabels(root.roles_ids, keys);
  }

  return keys;
}

function collectPermissionIds(value: unknown, out: Set<number>) {
  if (value == null) return;

  if (typeof value === "number" && Number.isFinite(value)) {
    out.add(value);
    return;
  }

  if (typeof value === "string" && /^\d+$/.test(value.trim())) {
    out.add(Number(value));
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectPermissionIds(item, out));
    return;
  }

  if (typeof value !== "object") return;

  const record = value as Record<string, unknown>;

  const looksLikePermission =
    typeof record.key === "string" ||
    typeof record.permission_key === "string" ||
    typeof record.control_key === "string" ||
    typeof record.name === "string" ||
    typeof record.name_ar === "string" ||
    typeof record.name_en === "string";

  if (record.id != null && looksLikePermission && !Array.isArray(record.controls)) {
    const id = Number(record.id);
    if (Number.isFinite(id)) out.add(id);
  }

  if (Array.isArray(record.controls)) {
    collectPermissionIds(record.controls, out);
  }

  if (Array.isArray(record.permissions)) {
    collectPermissionIds(record.permissions, out);
  }

  if (Array.isArray(record.role_permissions)) {
    collectPermissionIds(record.role_permissions, out);
  }
}

export function extractPermissionIds(profileData: unknown): Set<number> {
  const ids = new Set<number>();
  const user = extractProfileUser(profileData);
  if (!user) return ids;

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectPermissionIds(root.permissions, ids);
    collectPermissionIds(root.role_permissions, ids);
  }

  collectPermissionIds(user.permissions, ids);
  collectPermissionIds(user.role_permissions, ids);
  collectPermissionIdsFromRoles(user.role, ids);
  collectPermissionIdsFromRoles(user.roles, ids);

  if (Array.isArray(user.roles_ids)) {
    user.roles_ids.forEach((item) => collectPermissionIdsFromRoles(item, ids));
  }

  return ids;
}

export function resolvePermissionKeysFromCatalog(
  ids: Set<number>,
  catalog: Array<{ name: string; controls: Array<{ id: number; key: string }> }>,
): Set<string> {
  const keys = new Set<string>();
  if (!ids.size || !catalog.length) return keys;

  for (const group of catalog) {
    addPermissionKey(keys, group.name);

    for (const control of group.controls ?? []) {
      if (ids.has(Number(control.id))) {
        addPermissionKey(keys, control.key);
        addPermissionKey(keys, group.name);
      }
    }
  }

  return keys;
}

export function isRestrictedUser(profileData: unknown): boolean {
  if (!profileData || isFullAccessUser(profileData)) return false;

  const user = extractProfileUser(profileData);
  if (!user) return false;

  if (user.role != null) return true;
  if (user.roles != null) return true;
  if (user.roles_ids != null) return true;

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    if (root.role != null || root.roles != null || root.roles_ids != null) {
      return true;
    }
  }

  return profileHasPermissionsField(profileData);
}

function addRoleId(value: unknown, ids: Set<number>) {
  if (value == null) return;

  if (typeof value === "number" || typeof value === "string") {
    const id = Number(value);
    if (Number.isFinite(id) && id > 0) ids.add(id);
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.id != null) {
      const id = Number(record.id);
      if (Number.isFinite(id) && id > 0) ids.add(id);
    }
  }
}

function collectRoleIdsFromValue(value: unknown, ids: Set<number>) {
  if (value == null) return;

  if (Array.isArray(value)) {
    value.forEach((item) => addRoleId(item, ids));
    return;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.id != null) {
      addRoleId(record, ids);
      return;
    }
    Object.values(record).forEach((item) => addRoleId(item, ids));
    return;
  }

  addRoleId(value, ids);
}

export function extractRoleIds(profileData: unknown): number[] {
  const user = extractProfileUser(profileData);
  if (!user) return [];

  const ids = new Set<number>();

  collectRoleIdsFromValue(user.roles_ids, ids);
  collectRoleIdsFromValue(user.role_id, ids);
  collectRoleIdsFromValue(user.role, ids);
  collectRoleIdsFromValue(user.roles, ids);

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    collectRoleIdsFromValue(root.roles_ids, ids);
    collectRoleIdsFromValue(root.role_id, ids);
    collectRoleIdsFromValue(root.role, ids);
    collectRoleIdsFromValue(root.roles, ids);

    const nested = root.user;
    if (nested != null && typeof nested === "object") {
      const nestedUser = nested as Record<string, unknown>;
      collectRoleIdsFromValue(nestedUser.roles_ids, ids);
      collectRoleIdsFromValue(nestedUser.role_id, ids);
      collectRoleIdsFromValue(nestedUser.role, ids);
      collectRoleIdsFromValue(nestedUser.roles, ids);
    }
  }

  return [...ids];
}

export function isFullAccessUser(profileData: unknown): boolean {
  const user = extractProfileUser(profileData);
  if (!user) return false;

  if (user.is_super_admin === true || user.is_super_admin === 1) return true;
  if (user.is_admin === true || user.is_admin === 1) return true;
  if (user.all_permissions === true || user.has_all_permissions === true) {
    return true;
  }

  const roleSources = [user.role, user.roles, user.roles_ids];

  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    roleSources.push(root.role, root.roles, root.roles_ids);

    if (root.user != null && typeof root.user === "object") {
      const nested = root.user as Record<string, unknown>;
      roleSources.push(nested.role, nested.roles, nested.roles_ids);
    }
  }

  for (const source of roleSources) {
    if (source == null) continue;

    if (Array.isArray(source)) {
      if (source.some((role) => roleGrantsFullAccess(role))) return true;
      continue;
    }

    if (roleGrantsFullAccess(source)) return true;

    if (typeof source === "object") {
      const record = source as Record<string, unknown>;
      if (record.id == null) {
        const nestedRoles = Object.values(record);
        if (nestedRoles.some((role) => roleGrantsFullAccess(role))) return true;
      }
    }
  }

  return false;
}

export function buildPermissionContext(
  profileData: unknown,
  catalog?: Array<{ name: string; controls: Array<{ id: number; key: string }> }>,
  options?: { ready?: boolean },
) {
  const ready = Boolean(options?.ready);
  const user = extractProfileUser(profileData) as ProfileUser | null;
  let keys = extractUserPermissionKeys(profileData);

  if (catalog?.length) {
    const ids = extractPermissionIds(profileData);
    const resolved = resolvePermissionKeysFromCatalog(ids, catalog);
    if (resolved.size > 0) {
      for (const key of resolved) keys.add(key);
    }
  }

  const fullAccess =
    isFullAccessUser(profileData) || keysGrantFullAccess(keys);
  const restricted = !fullAccess && isRestrictedUser(profileData);

  const shouldEnforce = ready && restricted && !fullAccess;

  const canAccessPathForUser = (path: string) => {
    if (!ready || fullAccess) return true;

    const normalized = path.replace(/\/+$/, "") || "/";
    if (ALWAYS_ALLOWED_PATHS.has(normalized)) return true;

    if (!restricted) return true;

    if (keys.size === 0) return false;

    return canAccessPath(path, keys, { enforce: true });
  };

  const hasModuleAccessForUser = (module: string) => {
    if (!ready || fullAccess) return true;
    if (!restricted) return true;
    if (keys.size === 0) return false;
    return hasModuleAccess(keys, module);
  };

  return {
    user,
    keys,
    enforce: shouldEnforce,
    fullAccess,
    restricted,
    canAccessPath: canAccessPathForUser,
    canAccessHref: (href: string, lang: string) => {
      const prefix = `/${lang}`;
      let normalizedHref = href;
      if (normalizedHref === prefix) normalizedHref = "/";
      else if (normalizedHref.startsWith(`${prefix}/`)) {
        normalizedHref = normalizedHref.slice(prefix.length) || "/";
      }
      return canAccessPathForUser(normalizedHref);
    },
    hasModuleAccess: hasModuleAccessForUser,
  };
}

export function profileHasPermissionsField(profileData: unknown): boolean {
  if (profileData != null && typeof profileData === "object") {
    const root = profileData as Record<string, unknown>;
    if (
      "permissions" in root ||
      "permission_keys" in root ||
      "permissionKeys" in root
    ) {
      return true;
    }
  }

  const user = extractProfileUser(profileData);
  if (!user) return false;

  return (
    "permissions" in user ||
    "permission_keys" in user ||
    "permissionKeys" in user
  );
}

export function normalizeModulePrefix(module: string): string[] {
  const base = module.trim().toLowerCase();
  const variants = new Set<string>([
    base,
    base.replace(/-/g, "_"),
    base.replace(/_/g, "-"),
  ]);
  return [...variants];
}

const MODULE_KEY_ALIASES: Record<string, string[]> = {
  articles: ["articles", "article"],
  lectures: ["lectures", "lecture"],
  speeches: ["speeches", "speech"],
  books: ["books", "book"],
  explanations: ["explanations", "explanation"],
  fatwas: ["fatwas", "fatwa"],
  banners: ["banners", "banner"],
  admins: ["admins", "admin_users", "admin"],
  roles: ["roles", "role"],
  about_sheikh: ["about_sheikh", "about-sheikh", "aboutsheikh"],
  privacy_policy: [
    "privacy_policy",
    "privacy-policy",
    "privacy",
    "settings",
  ],
  terms_and_conditions: [
    "terms_and_conditions",
    "terms-conditions",
    "terms",
    "settings",
  ],
  app_contacts: ["app_contacts", "app-contacts", "contacts", "settings"],
};

export function permissionMatchesModule(
  permissionKey: string,
  module: string,
): boolean {
  const key = permissionKey.trim().toLowerCase().replace(/_/g, ".");
  if (!key) return false;

  const moduleVariants = [
    ...(MODULE_KEY_ALIASES[module] ?? [module]),
    ...(MODULE_LABEL_HINTS[module] ?? []),
  ];

  for (const moduleName of moduleVariants) {
    for (const prefix of normalizeModulePrefix(moduleName)) {
      const normalizedPrefix = prefix.replace(/_/g, ".").toLowerCase();
      if (!normalizedPrefix) continue;
      if (
        key === normalizedPrefix ||
        key.startsWith(`${normalizedPrefix}.`) ||
        key.includes(normalizedPrefix)
      ) {
        return true;
      }
    }
  }

  return false;
}

export function hasModuleAccess(
  keys: Set<string>,
  module: string,
): boolean {
  if (!module) return false;
  for (const key of keys) {
    if (permissionMatchesModule(key, module)) return true;
  }
  return false;
}

function keysGrantFullAccess(keys: Set<string>): boolean {
  if (keys.size === 0) return false;

  const modules = [
    "articles",
    "lectures",
    "speeches",
    "books",
    "explanations",
    "fatwas",
    "banners",
    "admins",
    "roles",
    "about_sheikh",
  ];

  const matched = modules.filter((module) => hasModuleAccess(keys, module));
  return matched.length >= modules.length - 1;
}

export function hasAnyModuleAccess(
  keys: Set<string>,
  modules: string[],
): boolean {
  return modules.some((module) => hasModuleAccess(keys, module));
}

export function canAccessPath(
  path: string,
  keys: Set<string>,
  options?: {
    enforce?: boolean;
  },
): boolean {
  const normalized = path.replace(/\/+$/, "") || "/";

  if (ALWAYS_ALLOWED_PATHS.has(normalized)) {
    return true;
  }

  if (!options?.enforce) {
    return true;
  }

  const segments = normalized.split("/").filter(Boolean);
  const first = segments[0] ?? "";

  if (CONTENT_MODULES.includes(first)) {
    return hasModuleAccess(keys, first);
  }

  if (first === "admins" || first === "roles" || first === "banners") {
    return hasModuleAccess(keys, first);
  }

  const aliases = MODULE_ROUTE_ALIASES[first];
  if (aliases) {
    return hasAnyModuleAccess(keys, aliases);
  }

  return false;
}

export function canAccessHref(
  href: string,
  lang: string,
  keys: Set<string>,
  enforce: boolean,
): boolean {
  const prefix = `/${lang}`;
  let path = href;

  if (path === prefix) path = "/";
  else if (path.startsWith(`${prefix}/`)) {
    path = path.slice(prefix.length) || "/";
  }

  return canAccessPath(path, keys, { enforce });
}

export function getPermissionContext(
  profileData: unknown,
  catalog?: Array<{ name: string; controls: Array<{ id: number; key: string }> }>,
) {
  return buildPermissionContext(profileData, catalog);
}
