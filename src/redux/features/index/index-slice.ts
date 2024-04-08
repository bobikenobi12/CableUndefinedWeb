import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import indexApiSlice from "./index-api-slice";

import type { PredictionRequest, GenerateCodeRequest } from "./index-api-slice";

interface Prediction extends PredictionRequest {
	prediction: string;
}

interface Code extends GenerateCodeRequest {
	code: string;
}

export enum Tab {
	PREDICTION = "prediction",
	CODE = "code",
	PARTS = "parts",
	SETTINGS = "settings",
}

interface IndexState {
	tab: Tab;
	prediction: string;
	code: string;
}

const initialState: IndexState = {
	tab: (localStorage.getItem("indexTab") as Tab) || Tab.PREDICTION,
	prediction: "",
	code: "",
};

export const indexSlice = createSlice({
	name: "index",
	initialState,
	reducers: {
		setTab: (state, action: PayloadAction<Tab>) => {
			state.tab = action.payload;
			localStorage.setItem("indexTab", action.payload);
		},
	},
	extraReducers: (builder) => {
		// builder.addMatcher(
		// 	indexApiSlice.endpoints.predictions.matchPending,
		//     (state, action) => {
		//         if (action.payload) {
		//             state.predictions.push(action.payload);
		//         }
		//     }
		// );
		builder.addMatcher(
			indexApiSlice.endpoints.predictions.matchFulfilled,
			(state, action) => {
				state.prediction = action.payload.prediction;
			}
		);
		builder.addMatcher(
			indexApiSlice.endpoints.generateCode.matchFulfilled,
			(state, action) => {
				state.code = action.payload.code;
			}
		);
	},
});

export const { setTab } = indexSlice.actions;

export const selectTab = (state: RootState) => state.index.tab;

export default indexSlice.reducer;
