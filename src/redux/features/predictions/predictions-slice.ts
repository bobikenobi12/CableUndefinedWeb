import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";

import { predictionsApiSlice } from "./predictions-api-slice";

import { splitCodeResponse } from "@/utils/predictions";

export enum Tab {
	PREDICTION = "prediction",
	CODE = "code",
	PARTS = "parts",
	SETTINGS = "settings",
}

interface Code {
	beforeText: string;
	language: string;
	code: string;
	afterText: string;
}

interface PredictionsState {
	tab: Tab;
	prediction: string;
	code: Code;
}

const initialState: PredictionsState = {
	tab: (localStorage.getItem("indexTab") as Tab) || Tab.PREDICTION,
	prediction: "",
	code: {
		beforeText: "",
		language: "",
		code: "",
		afterText: "",
	},
};

export const predictionsSlice = createSlice({
	name: "predictions",
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
			predictionsApiSlice.endpoints.wiring.matchFulfilled,
			(state, action) => {
				console.log(action.payload);
				state.prediction = action.payload.prediction;
			}
		);
		builder.addMatcher(
			predictionsApiSlice.endpoints.code.matchFulfilled,
			(state, action) => {
				console.log(action.payload);
				const { beforeText, language, code, afterText } =
					splitCodeResponse(action.payload.code);

				state.code = {
					beforeText,
					language,
					code,
					afterText,
				};
			}
		);
	},
});

export const { setTab } = predictionsSlice.actions;

export const selectTab = (state: RootState) => state.predictions.tab;
export const selectPrediction = (state: RootState) =>
	state.predictions.prediction;
export const selectCode = (state: RootState) => state.predictions.code;

export default predictionsSlice.reducer;
