import { apiSlice } from "@/redux/api/api-slice";

import type { Diagram } from "@/types/diagrams";

import { AddPart, Part } from "@/types/parts";
import { SocketEvent, SocketNamespace } from "@/types/socket";
import { getSocket } from "@/utils/socket";

export const partsApiSlice = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		addPart: build.mutation<
			{ diagram: Diagram },
			{ diagramId: string; part: AddPart }
		>({
			queryFn: ({ diagramId, part }) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);

				socket.emit(SocketEvent.ADD_PART, {
					token: localStorage.getItem("_token"),
					diagram: {
						_id: diagramId,
					},
					part,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.ADD_PART, (data) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							console.log("added part", data);
							resolve({ data });
						}
					});
				});
			},
			invalidatesTags: (result) =>
				result
					? [{ type: "Diagrams", id: result.diagram._id }]
					: [{ type: "Diagrams", id: "LIST" }],
		}),
		updatePart: build.mutation<
			{ diagram: Diagram },
			{ diagramId: string; partId: string; update: AddPart }
		>({
			queryFn: ({ diagramId, partId, update }) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);
				socket.emit(SocketEvent.UPDATE_PART, {
					token: localStorage.getItem("_token"),
					diagram: {
						_id: diagramId,
					},
					part: {
						id: partId,
					},
					update,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.UPDATE_PART, (data) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							console.log(data);
							resolve({ data });
						}
					});
				});
			},
			invalidatesTags: (result) =>
				result
					? [{ type: "Diagrams", id: result.diagram._id }]
					: [{ type: "Diagrams", id: "LIST" }],
		}),
		removePart: build.mutation<
			{ diagram: Diagram },
			{ diagramId: string; partId: string }
		>({
			queryFn: ({ diagramId, partId }) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);

				socket.emit(SocketEvent.REMOVE_PART, {
					token: localStorage.getItem("_token"),
					diagram: {
						_id: diagramId,
					},
					part: {
						id: partId,
					},
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.REMOVE_PART, (data) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({ data });
						}
					});
				});
			},
			// invalidatesTags: (result) =>
			// 	result
			// 		? [{ type: "Diagrams", id: result.diagram._id }]
			// 		: [{ type: "Diagrams", id: "LIST" }],
		}),
	}),
});

export const {
	useAddPartMutation,
	useUpdatePartMutation,
	useRemovePartMutation,
} = partsApiSlice;
