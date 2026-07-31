import { createContentApi } from "@/store/content/createContentApi";

export const fatwasApi = createContentApi({
  reducerPath: "fatwasApi",
  basePath: "fatwas",
  listTag: "Fatwas",
  itemTag: "Fatwa",
  pluralResponseKey: "fatwas",
  singularResponseKey: "fatwa",
});

export const {
  useGetListQuery: useGetFatwasQuery,
  useGetByIdQuery: useGetFatwaByIdQuery,
  useCreateMutation: useCreateFatwaMutation,
  useUpdateMutation: useUpdateFatwaMutation,
  useDeleteMutation: useDeleteFatwaMutation,
  useToggleStatusMutation: useToggleFatwaStatusMutation,
} = fatwasApi;
