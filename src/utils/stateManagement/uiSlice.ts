// uiSlice.ts - CODE REVIEW COMMENTS

import {createSlice, PayloadAction} from "@reduxjs/toolkit";

// ISSUE 1: Пустые интерфейсы без реализации
// ❌ Проблема: Пустые типы не несут информации
export interface ItemType  {
    // Пустой интерфейс - добавить поля или использовать unknown
}

export interface SkillType {
    minDamage: number,
    maxDamage: number,
    cooldown: number,
}

// SUGGESTIONS FOR IMPROVEMENT:
// 1. Определить все поля для ItemType
// 2. Создать union type для infoEntity
// 3. Добавить валидацию для позиций
// 4. Группировать связанные состояния

export interface UIState {
    // ISSUE 2: Много boolean флагов - можно объединить в объект
    // ❌ Проблема: При добавлении новых окон будет много дублирования
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

// ISSUE 3: initialState не содержит все поля из интерфейса
// ❌ Проблема: Несоответствие между типом и начальным состоянием
const initialState: UIState = {
    isInventoryOpen: false,
    isCharMenuOpen: false,
    gameState: "mainMenu",
    infoEntity: null,
    infoPosition: null,
    // Отсутствуют остальные поля из UIState
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setGameState(state, action: PayloadAction<'mainMenu' | 'paused' | 'inGame'>) {
            state.gameState = action.payload;
        },

        // ISSUE 4: Много однотипных toggle функций
        // ❌ Проблема: Дублирование кода, сложно поддерживать
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

        // ISSUE 5: Сеттеры без валидации
        setInfoEntity(state, action: PayloadAction<ItemType | SkillType | null>) {
            state.infoEntity = action.payload;
        },
        setInfoPosition(state, action: PayloadAction<{ left: number; top: number } | null>) {
            // Нет валидации координат
            state.infoPosition = action.payload;
        },

        // ISSUE 6: Закомментированный код без объяснения
        // setCanvasRef(state, action: PayloadAction<WritableDraft<HTMLCanvasElement> | null>) {
        //     state.canvasRef = action.payload;
        // },
    },
});

// ISSUE 7: Экспорт всех actions без группировки
export const {
    toggleInventory,
    toggleCharMenu,
    toggleProfessions,
    toggleFriends,
    toggleQuests,
    toggleTalents,
    toggleAchievements,
    toggleSpellBook,
    setInfoPosition,
    setInfoEntity
} = uiSlice.actions;

export default uiSlice.reducer;

// РЕКОМЕНДАЦИИ ПО РЕФАКТОРИНГУ:
/*
1. Переструктурировать UIState:
   interface UIState {
     gameState: 'mainMenu' | 'paused' | 'inGame';
     windows: {
       inventory: boolean;
       character: boolean;
       friends: boolean;
       achievements: boolean;
       talents: boolean;
       spellBook: boolean;
       quests: boolean;
       professions: boolean;
     };
     tooltip: {
       entity: ItemType | SkillType | null;
       position: { x: number; y: number } | null;
     };
   }

2. Создать универсальный action для окон:
   toggleWindow(state, action: PayloadAction<keyof UIState['windows']>) {
     const windowName = action.payload;
     state.windows[windowName] = !state.windows[windowName];
   }

3. Добавить типы для сущностей:
   interface ItemType {
     id: string;
     name: string;
     description: string;
     icon: string;
     rarity: 'common' | 'rare' | 'epic' | 'legendary';
   }

4. Создать селекторы:
   export const selectActiveWindows = (state: { ui: UIState }) => 
     Object.entries(state.ui.windows)
       .filter(([_, isOpen]) => isOpen)
       .map(([name]) => name);

5. Добавить middleware для логики UI:
   const uiMiddleware: Middleware = (store) => (next) => (action) => {
     if (action.type === 'ui/toggleWindow') {
       // Логика закрытия других окон при открытии нового
     }
     return next(action);
   };

6. Создать константы для типов окон:
   export const WINDOW_TYPES = {
     INVENTORY: 'inventory',
     CHARACTER: 'character',
     // ...
   } as const;

7. Добавить валидацию позиций:
   setInfoPosition(state, action: PayloadAction<Position | null>) {
     const position = action.payload;
     if (position) {
       // Валидация что позиция находится в пределах экрана
       const isValid = position.x >= 0 && position.y >= 0 && 
                      position.x <= window.innerWidth && 
                      position.y <= window.innerHeight;
       if (isValid) {
         state.tooltip.position = position;
       }
     } else {
       state.tooltip.position = null;
     }
   }

8. Создать экшены с полезной нагрузкой:
   openWindowWithData(state, action: PayloadAction<{
     window: keyof UIState['windows'];
     data?: any;
   }>) {
     state.windows[action.payload.window] = true;
     // Сохранить данные для окна
   }
*/