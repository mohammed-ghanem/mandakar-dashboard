export interface IAppContactsSocial {
  facebook: string;
  instagram: string;
  snapchat: string;
  tiktok: string;
  x: string;
  telegram: string;
  youtube: string;
}

export interface IAppContactsValue {
  whatsapp: string;
  email: string;
  social: IAppContactsSocial;
}

export const SOCIAL_KEYS = [
  "facebook",
  "instagram",
  "snapchat",
  "tiktok",
  "x",
  "telegram",
  "youtube",
] as const;

export type SocialKey = (typeof SOCIAL_KEYS)[number];

export function emptyAppContacts(): IAppContactsValue {
  return {
    whatsapp: "",
    email: "",
    social: {
      facebook: "",
      instagram: "",
      snapchat: "",
      tiktok: "",
      x: "",
      telegram: "",
      youtube: "",
    },
  };
}
