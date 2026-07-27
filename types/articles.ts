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

export type IArticleLink = IContentLink;
export type IArticleSeo = IContentSeo;
export type IArticleCategoryRef = IContentCategoryRef;
export type IArticle = IContentItem;
export type IArticleListItem = IContentListItem;
export type ICreateArticlePayload = ICreateContentPayload;
export type IUpdateArticlePayload = IUpdateContentPayload;
