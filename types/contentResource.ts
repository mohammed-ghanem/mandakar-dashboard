export interface ILocalizedText {
  ar: string;
  en: string;
}

export interface IContentLink {
  title: string;
  url: string;
}

/** Attachment as returned from the API (file URL + display title). */
export interface IContentAttachment {
  title?: string;
  url?: string;
  name?: string;
  file?: string;
}

/** Attachment payload for create/update FormData. */
export interface IContentAttachmentInput {
  title: string;
  file: File;
}

export interface IContentSeo {
  description?: string;
  keywords?: string[];
}

export interface IContentCategoryRef {
  id: number;
  name?: ILocalizedText;
  _name?: string;
}

export interface IContentItem {
  id: number;
  title: ILocalizedText;
  _title?: string;
  content?: ILocalizedText;
  category_id: number | null;
  category?: IContentCategoryRef | null;
  youtube_url?: string | null;
  image?: string | null;
  audio?: string | null;
  attachments?: (string | IContentAttachment)[];
  links?: IContentLink[];
  seo?: IContentSeo | null;
  is_active: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface IContentListItem {
  id: number;
  title_ar: string;
  title_en: string;
  category_name: string;
  youtube_url: string;
  is_active: boolean;
}

export interface ICreateContentPayload {
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
  category_id: number;
  youtube_url?: string;
  is_active: boolean;
  image?: File | null;
  audio?: File | null;
  attachments?: IContentAttachmentInput[];
  links?: IContentLink[];
  seo_description?: string;
  seo_keywords?: string[];
}

export type IUpdateContentPayload = ICreateContentPayload;

export interface IApiMessageResponse {
  message: string;
}
