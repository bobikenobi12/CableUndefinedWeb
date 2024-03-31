import { apiSlice } from "../../api/api-slice";
import { getSocket } from "@/utils/socket";
import { SocketEvent, SocketNamespace } from "@/types/socket";
import type { User } from "@/types/users";

export interface LoginRequest {
	email: string;
	password: string;
}
export interface RegisterRequest {
	email: string;
	password: string;
	username: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation<User, LoginRequest>({
			queryFn: ({ email, password }) => {
				const socket = getSocket(SocketNamespace.AUTH);

				socket.emit(SocketEvent.LOGIN, { email, password });

				return new Promise((resolve, reject) => {
					socket.on(
						SocketEvent.LOGIN,
						(data: { user: User; error: string }) => {
							if (data.error) {
								reject(data.error);
							} else {
								resolve({
									data: {
										_id: data.user._id,
										email: data.user.email,
										username: data.user.username,
										createdAt: data.user.createdAt,
										updatedAt: data.user.updatedAt,
										lastActivity: data.user.lastActivity,
										_token: data.user._token,
									},
								});
							}
						}
					);
				});
			},
		}),
		register: builder.mutation<void, RegisterRequest>({
			queryFn: ({ email, password, username }) => {
				const socket = getSocket(SocketNamespace.AUTH);

				socket.emit(SocketEvent.REGISTER, {
					email,
					password,
					username,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.REGISTER, (data: any) => {
						if ("error" in data) {
							reject(data.error);
						} else {
							resolve({ data: undefined });
						}
					});
				});
			},
		}),
		logout: builder.mutation<void, void>({
			queryFn: () => {
				const socket = getSocket(SocketNamespace.AUTH);
				socket.emit(SocketEvent.LOGOUT, {
					token: localStorage.getItem("_token"),
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.LOGOUT, (data: any) => {
						if (data.error) {
							reject(data.error);
						} else {
							resolve({ data: undefined });
						}
					});
				});
			},
		}),
		updateUser: builder.mutation<void, { password: string; data: User }>({
			queryFn: async ({ password, data }) => {
				const socket = getSocket(SocketNamespace.USERS);

				socket.emit(SocketEvent.USER_UPDATE, {
					token: localStorage.getItem("_token"),
					password,
					updatedUser: data,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.USER_UPDATE, (data: any) => {
						if (data.error) {
							reject(data.error);
						} else {
							resolve({
								data: data,
							});
						}
					});
				});
			},
		}),
		deleteUser: builder.mutation<void, { password: string }>({
			queryFn: async ({ password }) => {
				const socket = getSocket(SocketNamespace.USERS);

				socket.emit(SocketEvent.USER_DELETE, {
					token: localStorage.getItem("_token"),
					password,
				});

				return new Promise((resolve, reject) => {
					socket.on(SocketEvent.USER_DELETE, (data: any) => {
						if (data.error) {
							reject(data.error);
						} else {
							resolve({
								data: data,
							});
						}
					});
				});
			},
		}),
	}),
	overrideExisting: false,
});

export const {
	useLoginMutation,
	useRegisterMutation,
	useLogoutMutation,
	useUpdateUserMutation,
	useDeleteUserMutation,
} = authApiSlice;
