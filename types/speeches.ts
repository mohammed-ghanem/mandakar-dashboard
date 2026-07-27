export interface ILocalizedText {
  ar: string;
  en: string;
}

export interface ISpeechLink {
  title: string;
  url: string;
}

export interface ISpeechSeo {
  description?: string;
  keywords?: string[];
}

export interface ISpeechCategoryRef {
  id: number;
  name?: ILocalizedText;
  _name?: string;
}

export interface ISpeech {
  id: number;
  title: ILocalizedText;
  _title?: string;
  content?: ILocalizedText;
  category_id: number | null;
  category?: ISpeechCategoryRef | null;
  youtube_url?: string | null;
  image?: string | null;
  audio?: string | null;
  attachments?: string[] | { url?: string; name?: string }[];
  links?: ISpeechLink[];
  seo?: ISpeechSeo | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ISpeechListItem {
  id: number;
  title_ar: string;
  title_en: string;
  category_name: string;
  youtube_url: string;
  is_active: boolean;
}

export interface ICreateSpeechPayload {
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
  links?: ISpeechLink[];
  seo_description?: string;
  seo_keywords?: string[];
}

export type IUpdateSpeechPayload = ICreateSpeechPayload;

export interface IApiMessageResponse {
  message: string;
}
