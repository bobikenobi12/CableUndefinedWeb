import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/redux/store";
import { partMappings } from "@/types/wokwi-elements-mapping";

export interface DiagramsElement {
	id: string;
	x: number;
	y: number;
	name: string;
	angle: number;
	locked: boolean;
}

interface DiagramsState {
	elements: DiagramsElement[];
	showGrid: boolean;
}

const initialState: DiagramsState = {
	elements: [],
	showGrid: localStorage.getItem("showGrid") === "true",
};

export const wokwiSlice = createSlice({
	name: "wokwi",
	initialState,
	reducers: {
		toggleGrid: (state) => {
			state.showGrid = !state.showGrid;
			localStorage.setItem("showGrid", state.showGrid ? "true" : "false");
		},
		setElements: (state, action: { payload: DiagramsElement[] }) => {
			state.elements = action.payload;
		},
		addElement: (state, action: { payload: DiagramsElement }) => {
			state.elements.push(action.payload);
		},
		dragElement: (state, action) => {
			const element = state.elements.find(
				(e) => e.id === action.payload.id
			);
			if (element) {
				element.x = action.payload.x;
				element.y = action.payload.y;
			}
		},
		editElementName: (state, action) => {
			const element = state.elements.find(
				(e) => e.id === action.payload.id
			);
			if (element) {
				element.name = action.payload.name;
			}
		},
		deleteElement: (state, action) => {
			const id = action.payload;
			state.elements = state.elements.filter((e) => e.id !== id);
		},
	},
});

export const {
	setElements,
	toggleGrid,
	addElement,
	dragElement,
	editElementName,
	deleteElement,
} = wokwiSlice.actions;

export const getAllElements = (state: RootState) => state.wokwi.elements;
export const getShowGrid = (state: RootState) => state.wokwi.showGrid;

export default wokwiSlice.reducer;
