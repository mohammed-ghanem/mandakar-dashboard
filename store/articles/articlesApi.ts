import { createContentApi } from "@/store/content/createContentApi";

export const articlesApi = createContentApi({
  reducerPath: "articlesApi",
  basePath: "articles",
  listTag: "Articles",
  itemTag: "Article",
  pluralResponseKey: "articles",
  singularResponseKey: "article",
});

export const {
  useGetListQuery: useGetArticlesQuery,
  useGetByIdQuery: useGetArticleByIdQuery,
  useCreateMutation: useCreateArticleMutation,
  useUpdateMutation: useUpdateArticleMutation,
  useDeleteMutation: useDeleteArticleMutation,
  useToggleStatusMutation: useToggleArticleStatusMutation,
} = articlesApi;
