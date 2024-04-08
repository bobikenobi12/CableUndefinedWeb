import { configureStore, combineReducers } from "@reduxjs/toolkit";

import { apiSlice } from "./api/api-slice";

import diagramsSlice from "./features/diagrams/diagrams-slice";
import { wokwiSlice } from "./features/diagrams/wokwi-elements-slice";
import { authHandlerSlice } from "./features/auth/auth-handler-slice";
import indexSlice from "./features/index/index-slice";

const AppReducer = combineReducers({
	[apiSlice.reducerPath]: apiSlice.reducer,
	auth: authHandlerSlice.reducer,
	wokwi: wokwiSlice.reducer,
	diagrams: diagramsSlice,
	index: indexSlice,
});

export const rootReducer = (state: any, action: any) => {
	return AppReducer(state, action);
};

export const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
