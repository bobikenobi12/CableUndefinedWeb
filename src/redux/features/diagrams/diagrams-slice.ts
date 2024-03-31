import { createSlice } from "@reduxjs/toolkit";
import { diagramsApiSlice } from "./diagrams-api-slice";
import type { RootState } from "@/redux/store";

import type { Diagram } from "@/types/diagrams";
import type { Part } from "@/types/parts";

interface DiagramsState {
	diagrams: Diagram[];
	partsByDiagramId: { [diagramId: string]: Part[] };
}

const initialState: DiagramsState = {
	diagrams: [],
	partsByDiagramId: {},
};

export const diagramsSlice = createSlice({
	name: "diagrams",
	initialState,
	reducers: {
		dragPart: (
			state,
			action: {
				payload: {
					diagramId: string;
					partId: string;
					x: number;
					y: number;
				};
			}
		) => {
			const { diagramId, partId, x, y } = action.payload;
			const parts = state.partsByDiagramId[diagramId];
			if (parts) {
				const partIndex = parts.findIndex(
					(part) => part._id === partId
				);
				if (partIndex !== -1) {
					state.partsByDiagramId[diagramId][partIndex].x = x;
					state.partsByDiagramId[diagramId][partIndex].y = y;
				}
			}
		},
	},
	extraReducers: (builder) => {
		builder.addMatcher(
			diagramsApiSlice.endpoints.getDiagrams.matchFulfilled,
			(state, action) => {
				state.diagrams = action.payload;
				state.partsByDiagramId = action.payload.reduce(
					(acc, diagram) => {
						acc[diagram._id] = diagram.parts;
						return acc;
					},
					{} as { [diagramId: string]: Part[] }
				);
			}
		);
	},
});

export const { dragPart } = diagramsSlice.actions;

export const selectDiagrams = (state: RootState) => state.diagrams.diagrams;
export const selectDiagramById = (state: RootState, id: string) =>
	state.diagrams.diagrams.find((d) => d._id === id);
export const selectPartsByDiagramId = (state: RootState, id: string) =>
	state.diagrams.partsByDiagramId[id];
export const selectPartById = (
	state: RootState,
	diagramId: string,
	partId: string
) => state.diagrams.partsByDiagramId[diagramId].find((p) => p._id === partId);

export default diagramsSlice.reducer;
