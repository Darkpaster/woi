import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/style/globalStyles.scss'
import {GameUI} from "./ui/GameUI.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameUI />
  </StrictMode>,
)



