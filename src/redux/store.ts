import { configureStore, combineReducers } from "@reduxjs/toolkit";

import { apiSlice } from "./api/api-slice";

import { diagramsSlice } from "./features/diagrams/diagrams-slice";
import { authHandlerSlice } from "./features/auth/auth-handler-slice";
import { predictionsSlice } from "./features/predictions/predictions-slice";

const AppReducer = combineReducers({
	[apiSlice.reducerPath]: apiSlice.reducer,
	auth: authHandlerSlice.reducer,
	diagrams: diagramsSlice.reducer,
	predictions: predictionsSlice.reducer,
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
