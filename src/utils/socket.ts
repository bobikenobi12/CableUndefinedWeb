import { Socket, io } from "socket.io-client";
import { SocketNamespace } from "@/types/socket";

import { ServerErrors } from "@/types/errors";

let socket: Socket;

function getSocket(namespace: SocketNamespace = SocketNamespace.INDEX) {
	if (!socket) {
		socket = io(import.meta.env.VITE_API_URL + namespace);
	}
	socket.on("connect", () => {
		console.log("socket connected");
	});
	socket.on("error", (error: ServerErrors) => {
		switch (error) {
			case ServerErrors.INVALID_TOKEN:
				console.error("Invalid token");
				break;
			case ServerErrors.UNAUTHORIZED:
				console.error("Unauthorized");
				break;
			default:
				console.error("Unknown error", error);
				break;
		}
	});
	return socket;
}

export { getSocket };
