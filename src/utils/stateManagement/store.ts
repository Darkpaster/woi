// store.ts - CODE REVIEW COMMENTS

import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./uiSlice";
import AuthSlice from "./authSlice"
import {useDispatch, useSelector, useStore} from "react-redux";
import WorldSlice from "./worldSlice.ts";
import PlayerSlice from "./playerSlice.ts";

// SUGGESTIONS FOR IMPROVEMENT:
// 1. Добавить middleware для логирования и dev tools
// 2. Создать типы для всех slice состояний
// 3. Добавить preloadedState для SSR
// 4. Настроить serializable check для игровых объектов

export const store = configureStore({
    reducer: {
        auth: AuthSlice,
        player: PlayerSlice,
        world: WorldSlice,

        // ISSUE 1: Закомментированные reducer'ы без объяснения
        // ❌ Проблема: Неясно, планируются ли они к реализации
        // inventory: ,
        // combat: ,

        ui: uiReducer,

        // ISSUE 2: Еще больше закомментированного кода
        // chat: chatReducer,
        // quests: quests,
    },

    // ISSUE 3: Отсутствует настройка middleware
    // ✅ Рекомендация: Добавить middleware для dev tools и логирования
    // middleware: (getDefaultMiddleware) =>
    //   getDefaultMiddleware({
    //     serializableCheck: {
    //       ignoredActions: ['persist/PERSIST']
    //     }
    //   }).concat(logger)
});

// ISSUE 4: Типы можно улучшить с помощью infer
// ✅ Хорошо: Правильная типизация store
type AppStore = typeof store;
type RootState = ReturnType<AppStore['getState']>;
type AppDispatch = AppStore['dispatch'];

// ISSUE 5: Названия типизированных хуков не очень описательные
// ❌ Проблема: useMyDispatch не объясняет, что это типизированная версия
export const useMyDispatch = useDispatch.withTypes<AppDispatch>()
export const useMySelector = useSelector.withTypes<RootState>()
export const useMyStore = useStore.withTypes<AppStore>()

// РЕКОМЕНДАЦИИ ПО РЕФАКТОРИНГУ:
/*
1. Переименовать хуки:
   export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
   export const useAppSelector = useSelector.withTypes<RootState>()
   export const useAppStore = useStore.withTypes<AppStore>()

2. Добавить middleware:
   import { createListenerMiddleware } from '@reduxjs/toolkit'
   
   const listenerMiddleware = createListenerMiddleware()
   
   export const store = configureStore({
     reducer: { ... },
     middleware: (getDefaultMiddleware) =>
       getDefaultMiddleware({
         serializableCheck: {
           ignoredActions: [
             'game/updatePlayerPosition',
             'world/updateEntities'
           ]
         }
       }).concat(listenerMiddleware.middleware)
   })

3. Создать селекторы для часто используемых данных:
   export const selectIsLoading = (state: RootState) => 
     state.auth.loading || state.player.loading || state.world.loading;
   
   export const selectActiveWindows = (state: RootState) => ({
     inventory: state.ui.isInventoryOpen,
     character: state.ui.isCharMenuOpen,
     // ...
   });

4. Добавить persist для сохранения состояния:
   import { persistStore, persistReducer } from 'redux-persist'
   import storage from 'redux-persist/lib/storage'
   
   const persistConfig = {
     key: 'root',
     storage,
     whitelist: ['auth', 'ui'] // только эти части состояния сохраняем
   }

5. Создать типы для действий:
   export type AppThunk<ReturnType = void> = ThunkAction<
     ReturnType,
     RootState,
     unknown,
     Action<string>
   >

6. Добавить экспорт типов состояния:
   export type { RootState, AppDispatch }
   
7. Создать HOC для подключения store:
   export const withStore = <P extends object>(
     Component: React.ComponentType<P>
   ) => (props: P) => (
     <Provider store={store}>
       <Component {...props} />
     </Provider>
   )

8. Добавить dev tools конфигурацию:
   devTools: process.env.NODE_ENV !== 'production' && {
     name: 'Aftermath Trail Game Store',
     trace: true,
     traceLimit: 25
   }
*/