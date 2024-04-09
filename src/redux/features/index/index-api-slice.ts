import { apiSlice } from "@/redux/api/api-slice";
import { SocketEvent, SocketNamespace } from "@/types/socket";
import { getSocket } from "@/utils/socket";
import { Microcontroller } from "@/types/diagrams";

export interface PredictionRequest {
	microcontroller: "ESP32";
	module: string;
}

export interface GenerateCodeRequest extends PredictionRequest {
	prompt: string;
}
export const indexApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		predictions: builder.query<{ prediction: string }, PredictionRequest>({
			queryFn: ({ microcontroller, module }) => {
				const socket = getSocket(SocketNamespace.PREDICTIONS);

				socket.emit(SocketEvent.WIRING, {
					token: localStorage.getItem("_token"),
					microcontroller: "ESP32", // "Arduino Nano", "Rasberry Pi Pico", "ESP32"
					module: "LED",
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.WIRING, (data: any) => {
						if ("error" in data) {
							console.log(data.error);
							reject(data.error);
						} else {
							console.log(data.prediction);
							resolve({
								data: data.prediction,
							});
						}
					});
				});
			},
		}),
		generateCode: builder.query<{ code: string }, GenerateCodeRequest>({
			queryFn: () => {
				const socket = getSocket(SocketNamespace.PREDICTIONS);

				socket.emit(SocketEvent.CODE, {
					microcontroller: "ESP32",
					module: "MPU6050",
					prompt: "Turn on an LED",
					token: localStorage.getItem("_token"),
				});
				console.log("emitted");

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.CODE, (data: any) => {
						console.log(data);
						if ("error" in data) {
							reject(data.error);
							console.log(data.code);
						} else {
							console.log(data.code);
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
