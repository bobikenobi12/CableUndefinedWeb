enum SocketEvent {
	LOGIN = "auth:login",
	LOGOUT = "auth:logout",
	REGISTER = "auth:register",
	WIRING = "predictions:wiring",
	CODE = "predictions:code",
	USER_UPDATE = "users:update",
	USER_DELETE = "users:delete",
	GET_DIAGRAMS = "diagrams:get",
	CREATE_DIAGRAM = "diagrams:create",
	UPDATE_DIAGRAM = "diagrams:update",
	DELETE_DIAGRAM = "diagrams:delete",
	ADD_PART = "diagrams:parts:add",
	UPDATE_PART = "diagrams:parts:update",
	REMOVE_PART = "diagrams:parts:remove",
	CREATE_CONNECTION = "diagrams:connections:create",
	DELETE_CONNECTION = "diagrams:connections:delete",
}

enum SocketNamespace {
	AUTH = "/auth",
	USERS = "/users",
	PREDICTIONS = "/predictions",
	DIAGRAMS = "/diagrams",
	INDEX = "/",
}

export { SocketEvent, SocketNamespace };
