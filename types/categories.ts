import type { CategoryType } from "@/constants/categoryTypes";

export interface ILocalizedName {
  ar: string;
  en: string;
}

export interface ICategoryParent {
  id: number;
  name: ILocalizedName;
  _name?: string;
}

export interface ICategory {
  id: number;
  name: ILocalizedName;
  _name?: string;
  slug?: string;
  type?: CategoryType | string;
  parent_id: number | null;
  depth: number;
  is_active: boolean;
  sort_order: number;
  parent?: ICategoryParent | null;
  children?: ICategory[];
  created_at?: string;
  updated_at?: string;
}

export interface ICategoryFlat extends ICategory {
  name_ar: string;
  name_en: string;
  parent_name?: string;
}

export interface ICreateCategoryPayload {
  name_ar: string;
  name_en: string;
  type: CategoryType;
  parent_id?: number | null;
  is_active: boolean;
  sort_order?: number;
}

export interface IUpdateCategoryPayload {
  name_ar: string;
  name_en: string;
  type: CategoryType;
  parent_id?: number | null;
  is_active: boolean;
  sort_order?: number;
}

export interface IApiMessageResponse {
  message: string;
}
