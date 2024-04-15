import { apiSlice } from "@/redux/api/api-slice";
import { SocketEvent, SocketNamespace } from "@/types/socket";
import { getSocket } from "@/utils/socket";
import type { Diagram } from "@/types/diagrams";
import { Microcontroller } from "@/types/diagrams";

export const diagramsApiSlice = apiSlice.injectEndpoints({
	endpoints: (build) => ({
		getDiagrams: build.query<Diagram[], void>({
			queryFn: () => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);

				socket.emit(SocketEvent.GET_DIAGRAMS, {
					token: localStorage.getItem("_token"),
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.GET_DIAGRAMS, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							console.log(data.diagrams);
							resolve({
								data: data.diagrams,
							});
						}
					});
				});
			},
			providesTags: (result) =>
				result
					? [
							...result.map(({ _id }) => ({
								type: "Diagrams" as const,
								_id,
							})),
							{ type: "Diagrams", id: "LIST" },
					  ]
					: [{ type: "Diagrams", id: "LIST" }],
		}),
		createDiagram: build.mutation<
			Diagram,
			{ name: string; microcontroller: Microcontroller }
		>({
			queryFn: (body: { name: string; microcontroller: string }) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);

				socket.emit(SocketEvent.CREATE_DIAGRAM, {
					token: localStorage.getItem("_token"),
					name: body.name,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.CREATE_DIAGRAM, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({
								data: data.diagram,
							});
						}
					});
				});
			},
			invalidatesTags: [{ type: "Diagrams", id: "LIST" }],
		}),
		updateDiagram: build.mutation<
			Diagram,
			{ id: string; name: string; microcontroller: Microcontroller }
		>({
			queryFn: (body: {
				id: string;
				name: string;
				microcontroller: Microcontroller;
			}) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);

				socket.emit(SocketEvent.UPDATE_DIAGRAM, {
					token: localStorage.getItem("_token"),
					diagram: {
						_id: body.id,
					},
					update: {
						name: body.name,
						microcontroller: body.microcontroller,
					},
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.UPDATE_DIAGRAM, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({
								data: data.diagram,
							});
						}
					});
				});
			},
			invalidatesTags: (result) =>
				result
					? [{ type: "Diagrams", id: result._id }]
					: [{ type: "Diagrams", id: "LIST" }],
		}),
		deleteDiagram: build.mutation({
			queryFn: (id: string) => {
				const socket = getSocket(SocketNamespace.DIAGRAMS);

				socket.emit(SocketEvent.DELETE_DIAGRAM, {
					token: localStorage.getItem("_token"),
					diagram: {
						_id: id,
					},
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.DELETE_DIAGRAM, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({
								data: data.diagram,
							});
						}
					});
				});
			},
			invalidatesTags: (result) =>
				result
					? [{ type: "Diagrams", id: result._id }]
					: [{ type: "Diagrams", id: "LIST" }],
		}),
	}),
});

export const {
	useGetDiagramsQuery,
	useLazyGetDiagramsQuery,
	useCreateDiagramMutation,
	useUpdateDiagramMutation,
	useDeleteDiagramMutation,
} = diagramsApiSlice;
