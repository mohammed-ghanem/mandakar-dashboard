// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app/appSlice";
import { privacyPolicyApi } from "./settings/privacyPolicyApi";
import { aboutSheikhApi } from "./settings/aboutSheikhApi";
import { adminsApi } from "./admins/adminsApi";
import { rolesApi } from "./roles/rolesApi";
import { permissionsApi } from "./permissions/permissionsApi";
import { authApi } from "./auth/authApi";
import { contactsApi } from "./settings/contactsApi";
import { termsAndConditionsApi } from "./settings/termsAndConditions";
import { appContactsApi } from "./settings/appContactsApi";
import { categoriesApi } from "./categories/categoriesApi";
import { lecturesApi } from "./lectures/lecturesApi";
import { speechesApi } from "./speeches/speechesApi";
import { articlesApi } from "./articles/articlesApi";
import { booksApi } from "./books/booksApi";
import { explanationsApi } from "./explanations/explanationsApi";
import { fatwasApi } from "./fatwas/fatwasApi";

export const store = configureStore({
  reducer: {
    app: appReducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
    [aboutSheikhApi.reducerPath]: aboutSheikhApi.reducer,
    [appContactsApi.reducerPath]: appContactsApi.reducer,
    [termsAndConditionsApi.reducerPath]: termsAndConditionsApi.reducer,
    [adminsApi.reducerPath]: adminsApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [categoriesApi.reducerPath]: categoriesApi.reducer,
    [lecturesApi.reducerPath]: lecturesApi.reducer,
    [speechesApi.reducerPath]: speechesApi.reducer,
    [articlesApi.reducerPath]: articlesApi.reducer,
    [booksApi.reducerPath]: booksApi.reducer,
    [explanationsApi.reducerPath]: explanationsApi.reducer,
    [fatwasApi.reducerPath]: fatwasApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      privacyPolicyApi.middleware,
      aboutSheikhApi.middleware,
      appContactsApi.middleware,
      termsAndConditionsApi.middleware,
      adminsApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
      authApi.middleware,
      contactsApi.middleware,
      categoriesApi.middleware,
      lecturesApi.middleware,
      speechesApi.middleware,
      articlesApi.middleware,
      booksApi.middleware,
      explanationsApi.middleware,
      fatwasApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
