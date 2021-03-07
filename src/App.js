import Start from "./components/start/Start"
import Landing from "./components/landing/Landing";
import Workspace from "./components/workspace/Workspace";
import React, { useState } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState(-1);
  const stepChanged = (step) => {
    setStep(step);
  } 

  // variable for 3d object and its function to set
  const [obj3d, setObj3d] = useState(null);
  const setTheObj3dForWorkspace = (obj3dFromLanding) => {
    setObj3d(obj3dFromLanding);
  } 

  return (
    <div className="App">
      {step === -1 &&
        <Start stepChanged={stepChanged}/>
      }
      {step === 0 &&
        <Landing stepChanged={stepChanged} sendOjb3dToParent={setTheObj3dForWorkspace}/>
      }
      {step === 1 &&
        <Workspace stepChanged={stepChanged} obj3d={obj3d}/>
      }
      
    </div>
  );
}

export default App;
