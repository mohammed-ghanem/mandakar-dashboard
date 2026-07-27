import {
  FolderTree,
  Home,
  Mic,
  MessageCircleMore,
  TvMinimalPlay,
  FileText,
  ShieldCheck,
  Users,
} from "lucide-react";

export const mainLinks = (lang: string) => [
  {
    href: `/${lang}`,
    icon: Home,
    key: "dashboard",
  },
  {
    href: `/${lang}/about-sheikh`,
    icon: MessageCircleMore,
    key: "aboutUS",
  },
  {
    href: `/${lang}/categories`,
    icon: FolderTree,
    key: "categories",
  },
  {
    href: `/${lang}/lectures`,
    icon: TvMinimalPlay,
    key: "lectures",
  },
  {
    href: `/${lang}/speeches`,
    icon: Mic,
    key: "speeches",
  },
  {
    href: `/${lang}/articles`,
    icon: FileText,
    key: "articles",
  },
  {
    href: `/${lang}/admins`,
    icon: Users,
    key: "admins",
  },
  {
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
  // {
  //   href: `/${lang}/contact-us`,
  //   key: "contactUs",
  // },
];
