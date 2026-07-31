import { createContentApi } from "@/store/content/createContentApi";

export const booksApi = createContentApi({
  reducerPath: "booksApi",
  basePath: "books",
  listTag: "Books",
  itemTag: "Book",
  pluralResponseKey: "books",
  singularResponseKey: "book",
});

export const {
  useGetListQuery: useGetBooksQuery,
  useGetByIdQuery: useGetBookByIdQuery,
  useCreateMutation: useCreateBookMutation,
  useUpdateMutation: useUpdateBookMutation,
  useDeleteMutation: useDeleteBookMutation,
  useToggleStatusMutation: useToggleBookStatusMutation,
} = booksApi;
