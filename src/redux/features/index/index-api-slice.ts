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
export const indexApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		predictions: builder.query<{ prediction: string }, PredictionRequest>({
			queryFn: async ({ microcontroller, module }) => {
				const socket = getSocket(SocketNamespace.INDEX);

				socket.emit(SocketEvent.PREDICTION, {
					token: localStorage.getItem("_token"),
					microcontroller,
					module,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.PREDICTION, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({
								data: data.predictions,
							});
						}
					});
				});
			},
		}),
		generateCode: builder.query<{ code: string }, GenerateCodeRequest>({
			queryFn: async () => {
				const socket = getSocket(SocketNamespace.INDEX);

				socket.emit(SocketEvent.GENERATE_CODE, {
					token: localStorage.getItem("_token"),
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.GENERATE_CODE, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({
								data: data.code,
							});
						}
					});
				});
			},
		}),
	}),
	overrideExisting: false,
});

export const { useLazyGenerateCodeQuery, useLazyPredictionsQuery } =
	indexApiSlice;

export default indexApiSlice;
