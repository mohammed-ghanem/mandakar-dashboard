export interface ILocalizedText {
  ar: string;
  en: string;
}

export interface IArticleLink {
  title: string;
  url: string;
}

export interface IArticleSeo {
  description?: string;
  keywords?: string[];
}

export interface IArticleCategoryRef {
  id: number;
  name?: ILocalizedText;
  _name?: string;
}

export interface IArticle {
  id: number;
  title: ILocalizedText;
  _title?: string;
  content?: ILocalizedText;
  category_id: number | null;
  category?: IArticleCategoryRef | null;
  youtube_url?: string | null;
  image?: string | null;
  audio?: string | null;
  attachments?: string[] | { url?: string; name?: string }[];
  links?: IArticleLink[];
  seo?: IArticleSeo | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IArticleListItem {
  id: number;
  title_ar: string;
  title_en: string;
  category_name: string;
  youtube_url: string;
  is_active: boolean;
}

export interface ICreateArticlePayload {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  category_id: number;
  youtube_url?: string;
  is_active: boolean;
  image?: File | null;
  audio?: File | null;
  attachments?: File[];
  links?: IArticleLink[];
  seo_description?: string;
  seo_keywords?: string[];
}

export type IUpdateArticlePayload = ICreateArticlePayload;

export interface IApiMessageResponse {
  message: string;
}
