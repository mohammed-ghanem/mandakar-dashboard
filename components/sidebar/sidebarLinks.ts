import {
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
  type LucideIcon,
} from "lucide-react";

export type SidebarLinkItem = {
  kind: "link";
  href: string;
  icon: LucideIcon;
  key: string;
};

export type SidebarChildItem = {
  href: string;
  icon: LucideIcon;
  key: string;
};

export type SidebarGroupItem = {
  kind: "group";
  key: string;
  icon: LucideIcon;
  children: SidebarChildItem[];
};

export type SidebarNavItem = SidebarLinkItem | SidebarGroupItem;

function contentGroup(
  lang: string,
  key: string,
  icon: LucideIcon,
  itemsKey: string,
) {
  return {
    kind: "group" as const,
    key,
    icon,
    children: [
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
    ],
  };
}

export const mainLinks = (lang: string): SidebarNavItem[] => [
  {
    kind: "link",
    href: `/${lang}`,
    icon: Home,
    key: "dashboard",
  },
  {
    kind: "link",
    href: `/${lang}/about-sheikh`,
    icon: MessageCircleMore,
    key: "aboutUS",
  },
  contentGroup(lang, "lectures", TvMinimalPlay, "lecturesItems"),
  contentGroup(lang, "speeches", Mic, "speechesItems"),
  contentGroup(lang, "articles", FileText, "articlesItems"),
  contentGroup(lang, "explanations", BookOpen, "explanationsItems"),
  contentGroup(lang, "fatwas", Scale, "fatwasItems"),
  contentGroup(lang, "books", BookMarked, "booksItems"),
  {
    kind: "link",
    href: `/${lang}/admins`,
    icon: Users,
    key: "admins",
  },
  {
    kind: "link",
    href: `/${lang}/roles`,
    icon: ShieldCheck,
    key: "roles",
  },
];

export const settingsLinks = (lang: string) => [
  {
    href: `/${lang}/privacy-policy`,
    key: "privacyPolicy",
  },
  {
    href: `/${lang}/terms-conditions`,
    key: "termsAndConditions",
  },
  {
    href: `/${lang}/profile`,
    key: "profile",
  },
  {
    href: `/${lang}/app-contacts`,
    key: "appContacts",
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
 * - `/lectures` matches create/edit/view under lectures, but not `/lectures/categories`
 * - `/lectures/categories` matches its create/edit routes
 */
export function isNavHrefActive(pathname: string, href: string, lang: string) {
  const path = pathWithoutLang(pathname, lang);
  const target = pathWithoutLang(href, lang);

  if (target === "/") return path === "/";
  if (path === target) return true;

  if (!path.startsWith(`${target}/`)) return false;

  if (target.endsWith("/categories")) return true;

  return !path.startsWith(`${target}/categories`);
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
