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

export type IExplanationLink = IContentLink;
export type IExplanationSeo = IContentSeo;
export type IExplanationCategoryRef = IContentCategoryRef;
export type IExplanation = IContentItem;
export type IExplanationListItem = IContentListItem;
export type ICreateExplanationPayload = ICreateContentPayload;
export type IUpdateExplanationPayload = IUpdateContentPayload;
