import { createSlice } from "@reduxjs/toolkit";

import { diagramsApiSlice } from "./diagrams-api-slice";
import { partsApiSlice } from "@/redux/features/parts/parts-api-slice";
import { connectionsApiSlice } from "../connections/connections-api-slice";

import type { RootState } from "@/redux/store";

import type { Diagram } from "@/types/diagrams";
import type { Part } from "@/types/parts";
import { connect } from "http2";

interface DiagramsState {
	diagrams: Diagram[];
	partsByDiagramId: { [diagramId: string]: Part[] };
	openDeleteDiagramDialog: boolean;
}

const initialState: DiagramsState = {
	diagrams: [],
	partsByDiagramId: {},
	openDeleteDiagramDialog: false,
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
				const partIndex = parts.findIndex(part => part.id === partId);
				if (partIndex !== -1) {
					state.partsByDiagramId[diagramId][partIndex].x = x;
					state.partsByDiagramId[diagramId][partIndex].y = y;
				}
			}
		},
		setOpenDeleteDiagramDialog: (
			state,
			action: { payload: { open: boolean } }
		) => {
			state.openDeleteDiagramDialog = action.payload.open;
		},
		updatePartState: (
			state,
			action: {
				payload: { diagram: Diagram };
			}
		) => {
			const { diagram } = action.payload;
			state.partsByDiagramId[diagram._id] = diagram.parts;
			state.diagrams = state.diagrams.map(d =>
				d._id === diagram._id ? diagram : d
			);
		},
	},
	extraReducers: builder => {
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
		builder.addMatcher(
			connectionsApiSlice.endpoints.createConnection.matchFulfilled,
			(state, action: { payload: { diagram: Diagram } }) => {
				const { diagram } = action.payload;
				state.diagrams = state.diagrams.map(d =>
					d._id === diagram._id ? diagram : d
				);
			}
		);
		builder.addMatcher(
			connectionsApiSlice.endpoints.deleteConnection.matchFulfilled,
			(state, action: { payload: { diagram: Diagram } }) => {
				const { diagram } = action.payload;
				state.diagrams = state.diagrams.map(d =>
					d._id === diagram._id ? diagram : d
				);
			}
		);
	},
});

export const { dragPart, setOpenDeleteDiagramDialog, updatePartState } =
	diagramsSlice.actions;

export const selectDiagrams = (state: RootState) => state.diagrams.diagrams;
export const selectDiagramById = (state: RootState, id: string) =>
	state.diagrams.diagrams.find(d => d._id === id);
export const selectPartsByDiagramId = (state: RootState, id: string) =>
	state.diagrams.partsByDiagramId[id];
export const selectPartById = (
	state: RootState,
	diagramId: string,
	partId: string
) => state.diagrams.partsByDiagramId[diagramId].find(p => p.id === partId);
export const selectDiagramConnections = (state: RootState, id: string) =>
	state.diagrams.diagrams.find(d => d._id === id)?.connections;

export const selectOpenDeleteDiagramDialog = (state: RootState) =>
	state.diagrams.openDeleteDiagramDialog;

export default diagramsSlice.reducer;
