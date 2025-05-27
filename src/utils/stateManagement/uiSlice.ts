import {createSlice, PayloadAction} from "@reduxjs/toolkit";

export interface ItemType  {
}

export interface SkillType {
    minDamage: number,
    maxDamage: number,
    cooldown: number,
}

export interface UIState {
    isInventoryOpen: boolean;
    isCharMenuOpen: boolean;
    isFriendsWindowOpen: boolean;
    isAchievementsWindowOpen: boolean;
    isTalentsWindowOpen: boolean;
    isSpellBookWindowOpen: boolean;
    isQuestsWindowOpen: boolean;
    isProfessionsWindowOpen: boolean;
    gameState: 'mainMenu' | 'paused' | 'inGame';
    infoEntity: ItemType|SkillType|null,
    infoPosition: { left: number; top: number } | null;
}

const initialState: UIState = {
    isInventoryOpen: false,
    isCharMenuOpen: false,
    gameState: "mainMenu",
    infoEntity: null,
    infoPosition: null,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setGameState(state, action: PayloadAction<'mainMenu' | 'paused' | 'inGame'>) {
            state.gameState = action.payload;
        },
        toggleInventory(state) {
            state.isInventoryOpen = !state.isInventoryOpen;
        },
        toggleFriends(state) {
            state.isFriendsWindowOpen = !state.isFriendsWindowOpen;
        },
        toggleTalents(state) {
            state.isTalentsWindowOpen = !state.isTalentsWindowOpen;
        },
        toggleAchievements(state) {
            state.isAchievementsWindowOpen = !state.isAchievementsWindowOpen;
        },
        toggleSpellBook(state) {
            state.isSpellBookWindowOpen = !state.isSpellBookWindowOpen;
        },
        toggleProfessions(state) {
            state.isProfessionsWindowOpen = !state.isProfessionsWindowOpen;
        },
        toggleQuests(state) {
            state.isQuestsWindowOpen = !state.isQuestsWindowOpen;
        },
        toggleCharMenu(state) {
            state.isCharMenuOpen = !state.isCharMenuOpen;
        },
        setInfoEntity(state, action: PayloadAction<ItemType | SkillType | null>) {
            state.infoEntity = action.payload;
        },
        setInfoPosition(state, action: PayloadAction<{ left: number; top: number } | null>) {
            state.infoPosition = action.payload;
        },
        // setCanvasRef(state, action: PayloadAction<WritableDraft<HTMLCanvasElement> | null>) {
        //     state.canvasRef = action.payload;
        // },
    },
});

export const { toggleInventory, toggleCharMenu, toggleProfessions, toggleFriends, toggleQuests, toggleTalents, toggleAchievements, toggleSpellBook, setInfoPosition, setInfoEntity } = uiSlice.actions;
export default uiSlice.reducer;
