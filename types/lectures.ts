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

export type ILectureLink = IContentLink;
export type ILectureSeo = IContentSeo;
export type ILectureCategoryRef = IContentCategoryRef;
export type ILecture = IContentItem;
export type ILectureListItem = IContentListItem;
export type ICreateLecturePayload = ICreateContentPayload;
export type IUpdateLecturePayload = IUpdateContentPayload;
