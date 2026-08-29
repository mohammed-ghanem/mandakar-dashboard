import {
  ArrowUpDown,
  FolderTree,
  Home,
  Mic,
  MessageCircleMore,
  TvMinimalPlay,
  FileText,
  ShieldCheck,
  Users,
  BookOpen,
  BookMarked,
  Scale,
 
  Film,
  type LucideIcon,
} from "lucide-react";

export type SidebarLinkItem = {
  kind: "link";
  href: string;
  icon: LucideIcon;
  key: string;
  /** Permission module key — omit for always-visible links (dashboard). */
  module?: string;
  always?: boolean;
};

export type SidebarChildItem = {
  href: string;
  icon: LucideIcon;
  key: string;
  module?: string;
};

export type SidebarGroupItem = {
  kind: "group";
  key: string;
  icon: LucideIcon;
  module?: string;
  children: SidebarChildItem[];
};

export type SettingsLinkItem = {
  href: string;
  key: string;
  module?: string;
  always?: boolean;
};

export type SidebarNavItem = SidebarLinkItem | SidebarGroupItem;

function contentGroup(
  lang: string,
  key: string,
  icon: LucideIcon,
  itemsKey: string,
  options?: { withReorder?: boolean },
) {
  const children: SidebarChildItem[] = [
    {
      href: `/${lang}/${key}`,
      icon,
      key: itemsKey,
    },
    {
      href: `/${lang}/${key}/categories`,
      icon: FolderTree,
      key: "categories",
    },
  ];

  if (options?.withReorder) {
    children.push({
      href: `/${lang}/${key}/reorder`,
      icon: ArrowUpDown,
      key: "changeOrder",
    });
  }

  return {
    kind: "group" as const,
    key,
    icon,
    module: key,
    children,
  };
}

export const mainLinks = (lang: string): SidebarNavItem[] => [
  {
    kind: "link",
    href: `/${lang}`,
    icon: Home,
    key: "dashboard",
    always: true,
  },
  {
    kind: "link",
    href: `/${lang}/about-sheikh`,
    icon: MessageCircleMore,
    key: "aboutUS",
    module: "about_sheikh",
  },
  contentGroup(lang, "lectures", TvMinimalPlay, "lecturesItems", {
    withReorder: true,
  }),
  contentGroup(lang, "speeches", Mic, "speechesItems", { withReorder: true }),
  contentGroup(lang, "articles", FileText, "articlesItems", {
    withReorder: true,
  }),
  contentGroup(lang, "explanations", BookOpen, "explanationsItems", {
    withReorder: true,
  }),
  contentGroup(lang, "fatwas", Scale, "fatwasItems", { withReorder: true }),
  contentGroup(lang, "books", BookMarked, "booksItems", { withReorder: true }),
  {
    kind: "group",
    key: "banners",
    icon: Film,
    module: "banners",
    children: [
      {
        href: `/${lang}/banners`,
        icon: Film,
        key: "bannersItems",
      },
      {
        href: `/${lang}/banners/reorder`,
        icon: ArrowUpDown,
        key: "changeOrder",
      },
    ],
  },
  {
    kind: "link",
    href: `/${lang}/admins`,
    icon: Users,
    key: "admins",
    module: "admins",
  },
  {
    kind: "link",
    href: `/${lang}/roles`,
    icon: ShieldCheck,
    key: "roles",
    module: "roles",
  },
];

export const settingsLinks = (lang: string): SettingsLinkItem[] => [
  {
    href: `/${lang}/privacy-policy`,
    key: "privacyPolicy",
    module: "privacy_policy",
  },
  {
    href: `/${lang}/terms-conditions`,
    key: "termsAndConditions",
    module: "terms_and_conditions",
  },
  {
    href: `/${lang}/profile`,
    key: "profile",
    always: true,
  },
  {
    href: `/${lang}/app-contacts`,
    key: "appContacts",
    module: "app_contacts",
  },
];

/** Strip `/{lang}` prefix for path comparisons. */
export function pathWithoutLang(pathname: string, lang: string) {
  const prefix = `/${lang}`;
  if (pathname === prefix) return "/";
  if (pathname.startsWith(`${prefix}/`)) {
    return pathname.slice(prefix.length) || "/";
  }
  return pathname || "/";
}

/**
 * Active state for content module links:
 * - `/lectures` matches create/edit/view under lectures, but not categories/reorder
 * - `/lectures/categories` matches its create/edit routes
 * - `/lectures/reorder` matches only the reorder page
 */
export function isNavHrefActive(pathname: string, href: string, lang: string) {
  const path = pathWithoutLang(pathname, lang);
  const target = pathWithoutLang(href, lang);

  if (target === "/") return path === "/";
  if (path === target) return true;

  if (!path.startsWith(`${target}/`)) return false;

  if (target.endsWith("/categories") || target.endsWith("/reorder")) {
    return true;
  }

  return (
    !path.startsWith(`${target}/categories`) &&
    !path.startsWith(`${target}/reorder`)
  );
}

export function isGroupActive(
  pathname: string,
  group: SidebarGroupItem,
  lang: string,
) {
  return group.children.some((child) =>
    isNavHrefActive(pathname, child.href, lang),
  );
}
