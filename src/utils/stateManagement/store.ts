import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import playerReducer from "./playerSlice";
import chatReducer from "./chatSlice";
import gameReducer from "./gameSlice";

export const store = configureStore({
    reducer: {
        ui: uiReducer,
        player: playerReducer,
        chat: chatReducer,
        game: gameReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
