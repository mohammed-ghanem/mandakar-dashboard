export interface ILocalizedText {
  ar: string;
  en: string;
}

export interface ILectureLink {
  title: string;
  url: string;
}

export interface ILectureSeo {
  description?: string;
  keywords?: string[];
}

export interface ILectureCategoryRef {
  id: number;
  name?: ILocalizedText;
  _name?: string;
}

export interface ILecture {
  id: number;
  title: ILocalizedText;
  _title?: string;
  content?: ILocalizedText;
  category_id: number | null;
  category?: ILectureCategoryRef | null;
  youtube_url?: string | null;
  image?: string | null;
  audio?: string | null;
  attachments?: string[] | { url?: string; name?: string }[];
  links?: ILectureLink[];
  seo?: ILectureSeo | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ILectureListItem {
  id: number;
  title_ar: string;
  title_en: string;
  category_name: string;
  youtube_url: string;
  is_active: boolean;
}

export interface ICreateLecturePayload {
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
  links?: ILectureLink[];
  seo_description?: string;
  seo_keywords?: string[];
}

export type IUpdateLecturePayload = ICreateLecturePayload;

export interface IApiMessageResponse {
  message: string;
}
