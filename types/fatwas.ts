import type {
  ILocalizedText,
  IContentLink,
  IContentSeo,
  IContentCategoryRef,
  IContentItem,
  IContentListItem,
  ICreateContentPayload,
  IUpdateContentPayload,
  IApiMessageResponse,
} from "./contentResource";

export type { ILocalizedText, IApiMessageResponse };

export type IFatwaLink = IContentLink;
export type IFatwaSeo = IContentSeo;
export type IFatwaCategoryRef = IContentCategoryRef;
export type IFatwa = IContentItem;
export type IFatwaListItem = IContentListItem;
export type ICreateFatwaPayload = ICreateContentPayload;
export type IUpdateFatwaPayload = IUpdateContentPayload;
