import { Home, ShieldCheck, Users } from "lucide-react";

export const mainLinks = (lang: string) => [
  {
    href: `/${lang}`,
    icon: Home,
    key: "dashboard",
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
    href: `/${lang}/app-contacts`,
    key: "appContacts",
  },
  {
    href: `/${lang}/terms-conditions`,
    key: "termsAndConditions",
  },
  {
    href: `/${lang}/contact-us`,
    key: "contactUs",
  },
  {
    href: `/${lang}/profile`,
    key: "profile",
  },
];
