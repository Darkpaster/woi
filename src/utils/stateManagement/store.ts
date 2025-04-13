import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";

import AuthSlice from "./authSlice"

import {useDispatch, useSelector, useStore} from "react-redux";
import WorldSlice from "./worldSlice.ts";
import PlayerSlice from "./playerSlice.ts";

export const store = configureStore({
    reducer: {
        auth: AuthSlice,
        player: PlayerSlice,
        world: WorldSlice,
        // inventory: ,
        // combat: ,
        ui: uiReducer,
        // chat: chatReducer,
        // quests: quest,
    },
});


type AppStore = typeof store;
type RootState = ReturnType<AppStore['getState']>;
type AppDispatch = AppStore['dispatch'];

export const useMyDispatch = useDispatch.withTypes<AppDispatch>()
export const useMySelector = useSelector.withTypes<RootState>()
export const useMyStore = useStore.withTypes<AppStore>()