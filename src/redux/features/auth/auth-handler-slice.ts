import { createSlice } from "@reduxjs/toolkit";
import { authApiSlice } from "./auth-api-slice";
import type { User } from "@/types/users";

interface AuthState {
	user: User;
	openProfile: boolean;
	openDeleteProfile: boolean;
	openUpdateProfile: boolean;
}

const authState: AuthState = {
	user: {
		_token: localStorage.getItem("_token") || "",
		...JSON.parse(localStorage.getItem("user") || "{}"),
	},
	openProfile: false,
	openDeleteProfile: false,
	openUpdateProfile: false,
};

export const authHandlerSlice = createSlice({
	name: "auth",
	initialState: authState,
	reducers: {
		setOpenProfile: (state, action) => {
			state.openProfile = action.payload;
		},
		setOpenDeleteProfile: (state, action) => {
			state.openDeleteProfile = action.payload;
		},
		setOpenUpdateProfile: (state, action) => {
			state.openUpdateProfile = action.payload;
		},
		logout: state => {
			state = authState;
			localStorage.removeItem("_token");
			localStorage.removeItem("user");
		},
	},
	extraReducers: builder => {
		builder.addMatcher(
			authApiSlice.endpoints.login.matchFulfilled,
			(state, action) => {
				state.user = action.payload;
				localStorage.setItem("_token", action.payload._token);
				localStorage.setItem("user", JSON.stringify(action.payload));
			}
		);
		builder.addMatcher(authApiSlice.endpoints.logout.matchFulfilled, state => {
			localStorage.removeItem("_token");
			localStorage.removeItem("user");
			state = authState;
		});
		builder.addMatcher(authApiSlice.endpoints.logout.matchRejected, state => {
			localStorage.removeItem("_token");
			localStorage.removeItem("user");
			state = authState;
		});
	},
});

export const {
	setOpenProfile,
	setOpenDeleteProfile,
	setOpenUpdateProfile,
	logout,
} = authHandlerSlice.actions;

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
	state.auth.user._token !== "";
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectOpenProfile = (state: { auth: AuthState }) =>
	state.auth.openProfile;
export const selectOpenDeleteProfile = (state: { auth: AuthState }) =>
	state.auth.openDeleteProfile;
export const selectOpenUpdateProfile = (state: { auth: AuthState }) =>
	state.auth.openUpdateProfile;

export default authHandlerSlice.reducer;
