import { apiSlice } from "@/redux/api/api-slice";
import { SocketEvent, SocketNamespace } from "@/types/socket";
import { getSocket } from "@/utils/socket";
import { Microcontroller } from "@/types/diagrams";

export interface PredictionRequest {
	microcontroller: Microcontroller;
	module: string;
}

export interface GenerateCodeRequest extends PredictionRequest {
	prompt: string;
}
export const predictionsApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		wiring: builder.query<{ prediction: string }, PredictionRequest>({
			queryFn: ({ microcontroller, module }) => {
				const socket = getSocket(SocketNamespace.PREDICTIONS);

				socket.emit(SocketEvent.WIRING, {
					token: localStorage.getItem("_token"),
					microcontroller,
					module,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.WIRING, (data: any) => {
						if ("error" in data) {
							console.log(data.error);
							reject(data.error);
						} else {
							console.log(data.prediction);
							resolve({
								data: data,
							});
						}
					});
				});
			},
		}),
		code: builder.query<{ code: string }, GenerateCodeRequest>({
			queryFn: ({ microcontroller, module, prompt }) => {
				const socket = getSocket(SocketNamespace.PREDICTIONS);

				socket.emit(SocketEvent.CODE, {
					microcontroller,
					module,
					prompt,
					token: localStorage.getItem("_token"),
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.CODE, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({
								data,
							});
						}
					});
				});
			},
		}),
	}),
	overrideExisting: false,
});

export const { useLazyWiringQuery, useLazyCodeQuery } = predictionsApiSlice;

export default predictionsApiSlice;
