import { createContentApi } from "@/store/content/createContentApi";

export const speechesApi = createContentApi({
  reducerPath: "speechesApi",
  basePath: "speeches",
  listTag: "Speeches",
  itemTag: "Speech",
  pluralResponseKey: "speeches",
  singularResponseKey: "speech",
});

export const {
  useGetListQuery: useGetSpeechesQuery,
  useGetByIdQuery: useGetSpeechByIdQuery,
  useCreateMutation: useCreateSpeechMutation,
  useUpdateMutation: useUpdateSpeechMutation,
  useDeleteMutation: useDeleteSpeechMutation,
  useToggleStatusMutation: useToggleSpeechStatusMutation,
} = speechesApi;
