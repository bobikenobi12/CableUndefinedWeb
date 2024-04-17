import { apiSlice } from "@/redux/api/api-slice";
import type { RootState } from "@reduxjs/toolkit/query";

import type { Diagram } from "@/types/diagrams";
import type { Connection } from "@/types/connections";

import { SocketEvent, SocketNamespace } from "@/types/socket";
import { getSocket } from "@/utils/socket";

export const connectionsApiSlice = apiSlice.injectEndpoints({
	endpoints: build => ({
		createConnection: build.mutation<
			{ diagram: Diagram },
			{ diagramId: string; connection: Connection }
		>({
			queryFn: ({ diagramId, connection }) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);

				socket.emit(SocketEvent.CREATE_CONNECTION, {
					token: localStorage.getItem("_token"),
					diagram: {
						_id: diagramId,
					},
					connection,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.CREATE_CONNECTION, data => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({ data });
						}
					});
				});
			},
			invalidatesTags: result =>
				result
					? [{ type: "Diagrams", id: result.diagram._id }]
					: [{ type: "Diagrams", id: "LIST" }],
		}),
		deleteConnection: build.mutation<
			{ diagram: Diagram },
			{ diagramId: string; connection: Connection }
		>({
			queryFn: ({ diagramId, connection }) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);
				socket.emit(SocketEvent.DELETE_CONNECTION, {
					token: localStorage.getItem("_token"),
					diagram: {
						_id: diagramId,
					},
					connection,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.DELETE_CONNECTION, data => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({ data });
						}
					});
				});
			},
			invalidatesTags: result =>
				result
					? [{ type: "Diagrams", id: result.diagram._id }]
					: [{ type: "Diagrams", id: "LIST" }],
		}),
	}),
	overrideExisting: false,
});

export const { useCreateConnectionMutation, useDeleteConnectionMutation } =
	connectionsApiSlice;
