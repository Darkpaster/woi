import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/style/globalStyles.scss'
import {GameUI} from "./ui/GameUI.tsx";
import {Provider} from "react-redux";
import {store} from "./utils/stateManagement/store.ts";


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Provider store={store}>
          <GameUI />
      </Provider>
  </StrictMode>,
)



