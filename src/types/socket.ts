enum SocketEvent {
	LOGIN = "auth:login",
	LOGOUT = "auth:logout",
	REGISTER = "auth:register",
	PREDICTION = "prediction",
	USER_UPDATE = "users:update",
	USER_DELETE = "users:delete",
	GET_DIAGRAMS = "diagrams:get",
	CREATE_DIAGRAM = "diagrams:create",
	UPDATE_DIAGRAM = "diagrams:update",
	DELETE_DIAGRAM = "diagrams:delete",
	ADD_PART = "diagrams:parts:add",
	UPDATE_PART = "diagrams:parts:update",
	REMOVE_PART = "diagrams:parts:remove",
}

enum SocketNamespace {
	AUTH = "/auth",
	USERS = "/users",
	INDEX = "/",
	DIAGRAMS = "/diagrams",
}

export { SocketEvent, SocketNamespace };
