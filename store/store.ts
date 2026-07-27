// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app/appSlice";
import { privacyPolicyApi } from "./settings/privacyPolicyApi";
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

export const store = configureStore({
  reducer: {
    app: appReducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
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
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      privacyPolicyApi.middleware,
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
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
