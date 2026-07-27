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

export type ISpeechLink = IContentLink;
export type ISpeechSeo = IContentSeo;
export type ISpeechCategoryRef = IContentCategoryRef;
export type ISpeech = IContentItem;
export type ISpeechListItem = IContentListItem;
export type ICreateSpeechPayload = ICreateContentPayload;
export type IUpdateSpeechPayload = IUpdateContentPayload;
