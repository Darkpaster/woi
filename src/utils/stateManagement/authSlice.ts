import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import useAuthAPI from "../../ui/service/hooks/authAPI.ts";

export interface AuthState {
    user: { password: string, email: string } | null,
    error: string | null,
    loading: boolean,
    access_token: null|string,
}

const initialState: AuthState = {
    user: null,
    error: null,
    loading: false,
    access_token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginUser(state, action: PayloadAction<{ password: string, email: string } | null>) {

        },
        registerUser(state, action: PayloadAction<{ password: string, email: string } | null>) {
            state.user = action.payload;
            // const [data, error, loading] = useAuthAPI({url: "/auth", method: "POST", body: JSON.stringify(action.payload)});
            // new Promise((resolve, reject) => {
            //
            // }).then((result) => {
            //
            // })
            // if (error) {
            //     state.error = error;
            //     return
            // }
        },
    },
});

export const { loginUser, registerUser } = authSlice.actions;
export default authSlice.reducer;
