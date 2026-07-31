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
    children,
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
