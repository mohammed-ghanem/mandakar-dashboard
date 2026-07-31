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

export type IBookLink = IContentLink;
export type IBookSeo = IContentSeo;
export type IBookCategoryRef = IContentCategoryRef;
export type IBook = IContentItem;
export type IBookListItem = IContentListItem;
export type ICreateBookPayload = ICreateContentPayload;
export type IUpdateBookPayload = IUpdateContentPayload;
