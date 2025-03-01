import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import {useDispatch, useSelector, useStore} from "react-redux";

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        // player: playerReducer,
        // chat: chatReducer,
        // game: gameReducer,
    },
});

type AppStore = typeof store;
type RootState = ReturnType<AppStore['getState']>;
type AppDispatch = AppStore['dispatch'];


export const useMyDispatch = useDispatch.withTypes<AppDispatch>()
export const useMySelector = useSelector.withTypes<RootState>()
export const useMyStore = useStore.withTypes<AppStore>()