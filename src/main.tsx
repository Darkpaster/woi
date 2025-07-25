import {Profiler, ProfilerOnRenderCallback, StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {GameUI} from "./game/ui/game/GameUI.tsx";
import {Provider} from "react-redux";
import {store} from "./utils/stateManagement/store.ts";

const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
) => {
    console.log(
        `id: ${id}, phase: ${phase}, actualDuration: ${actualDuration}, baseDuration: ${baseDuration}, startTime: ${startTime}, commitTime: ${commitTime}`,
    );
};


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <Profiler id={"main"} onRender={handleRender}>
        <Provider store={store}>
          <GameUI />
        </Provider>
      </Profiler>
  </StrictMode>,
)



