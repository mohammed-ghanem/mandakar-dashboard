import { createContentApi } from "@/store/content/createContentApi";

export const lecturesApi = createContentApi({
  reducerPath: "lecturesApi",
  basePath: "lectures",
  listTag: "Lectures",
  itemTag: "Lecture",
  pluralResponseKey: "lectures",
  singularResponseKey: "lecture",
});

export const {
  useGetListQuery: useGetLecturesQuery,
  useGetByIdQuery: useGetLectureByIdQuery,
  useCreateMutation: useCreateLectureMutation,
  useUpdateMutation: useUpdateLectureMutation,
  useDeleteMutation: useDeleteLectureMutation,
  useToggleStatusMutation: useToggleLectureStatusMutation,
} = lecturesApi;
