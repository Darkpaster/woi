import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    isPaused: boolean;
    isInventoryOpen: boolean;
    isMainMenuOpen: boolean;
}

const initialState: UIState = {
    isPaused: false,
    isInventoryOpen: false,
    isMainMenuOpen: true,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        togglePause(state) {
            state.isPaused = !state.isPaused;
        },
        openInventory(state) {
            state.isInventoryOpen = true;
        },
        closeInventory(state) {
            state.isInventoryOpen = false;
        },
        toggleInventory(state) {
            state.isInventoryOpen = !state.isInventoryOpen;
        },
        openMainMenu(state) {
            state.isMainMenuOpen = true;
        },
        closeMainMenu(state) {
            state.isMainMenuOpen = false;
        },
    },
});

export const { togglePause, openInventory, closeInventory, toggleInventory, openMainMenu, closeMainMenu } = uiSlice.actions;
export default uiSlice.reducer;
