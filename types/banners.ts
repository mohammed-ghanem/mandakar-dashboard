import type { BannerCategory } from "@/constants/bannerCategories";

export interface ILocalizedText {
  ar: string;
  en: string;
}

export interface IBanner {
  id: number;
  title: ILocalizedText;
  _title?: string;
  description: ILocalizedText;
  category: string;
  url?: string | null;
  image?: string | null;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IBannerListItem {
  id: number;
  title_ar: string;
  title_en: string;
  category: string;
  url: string;
  image: string;
  is_active: boolean;
}

export interface ICreateBannerPayload {
  title_ar: string;
  title_en: string;
  description_ar?: string;
  description_en?: string;
  category: BannerCategory | string;
  url?: string;
  is_active: boolean;
  image?: File | null;
}

export type IUpdateBannerPayload = ICreateBannerPayload;

export interface IApiMessageResponse {
  message: string;
}
