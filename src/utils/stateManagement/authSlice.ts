import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import useAuthAPI from "../../game/ui/features/auth/api/authAPI.ts";

export interface AuthState {
    user: { password: string, email: string } | null,
    error: string | null,
    loading: boolean,
    access_token: null|string,
    selectedCharacterId: number | null;
}

const initialState: AuthState = {
    user: null,
    error: null,
    loading: false,
    access_token: null,
    selectedCharacterId: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginUser(state, action: PayloadAction<{ password: string, email: string } | null>) {

        },
        registerUser(state, action: PayloadAction<{ password: string, email: string } | null>) {
            state.user = action.payload;
        },

        loginStart: (state) => {
            // state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<{
            userId: string;
            username: string;
            token: string;
            refreshToken: string;
        }>) => {
            // state.isAuthenticated = true;
            // state.userId = action.payload.userId;
            // state.username = action.payload.username;
            // state.token = action.payload.token;
            // state.refreshToken = action.payload.refreshToken;
            // state.isLoading = false;
            state.error = null;
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            // state.isLoading = false;
            state.error = action.payload;
        },
        logout: (state) => {
            return initialState;
        },
        // setCharacters: (state, action: PayloadAction<CharacterSummary[]>) => {
            // state.characters = action.payload;
        // },
        selectCharacter: (state, action: PayloadAction<string>) => {
            state.selectedCharacterId = action.payload;
        },
        updateToken: (state, action: PayloadAction<{ token: string; refreshToken: string }>) => {
            // state.token = action.payload.token;
            // state.refreshToken = action.payload.refreshToken;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            // state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const { loginUser, registerUser } = authSlice.actions;
export default authSlice.reducer;
