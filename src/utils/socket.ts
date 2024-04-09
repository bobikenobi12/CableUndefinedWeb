import { Socket, io } from "socket.io-client";
import { SocketNamespace } from "@/types/socket";

import { ServerErrors } from "@/types/errors";

let socket: Socket;
const authSocket = io(import.meta.env.VITE_API_URL + SocketNamespace.AUTH);
const diagramsSocket = io(
	import.meta.env.VITE_API_URL + SocketNamespace.DIAGRAMS
);
const predictionsSocket = io(
	import.meta.env.VITE_API_URL + SocketNamespace.PREDICTIONS
);
const usersSocket = io(import.meta.env.VITE_API_URL + SocketNamespace.USERS);

function getSocket(namespace: SocketNamespace = SocketNamespace.DIAGRAMS) {
	switch (namespace) {
		case SocketNamespace.AUTH:
			socket = authSocket;
			break;
		case SocketNamespace.DIAGRAMS:
			socket = diagramsSocket;
			break;
		case SocketNamespace.PREDICTIONS:
			socket = predictionsSocket;
			break;
		case SocketNamespace.USERS:
			socket = usersSocket;
			break;
		default:
			socket = diagramsSocket;
			break;
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
