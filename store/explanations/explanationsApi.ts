import { createContentApi } from "@/store/content/createContentApi";

export const explanationsApi = createContentApi({
  reducerPath: "explanationsApi",
  basePath: "explanations",
  listTag: "Explanations",
  itemTag: "Explanation",
  pluralResponseKey: "explanations",
  singularResponseKey: "explanation",
});

export const {
  useGetListQuery: useGetExplanationsQuery,
  useGetByIdQuery: useGetExplanationByIdQuery,
  useCreateMutation: useCreateExplanationMutation,
  useUpdateMutation: useUpdateExplanationMutation,
  useDeleteMutation: useDeleteExplanationMutation,
  useToggleStatusMutation: useToggleExplanationStatusMutation,
} = explanationsApi;
