import Start from "./components/start/Start"
import Landing from "./components/landing/Landing";
import Workspace from "./components/workspace/Workspace";
import React, { useState } from 'react';
import './App.css';

function App() {
  const [step, setStep] = useState(-1);
  const [noRenders, setNoRenders] = useState(-1);
  const stepChanged = (step) => {
    setStep(step);
  }
  const [dimension, setDimension] = useState(2);
  const dimensionChanged = (dimension) => {
    setDimension(dimension);
  }

  // variable for 3d object and its function to set
  const [obj3d, setObj3d] = useState(null);
  const setTheObj3dForWorkspace = (obj3dFromLanding) => {
    setObj3d(obj3dFromLanding);
  }
  const [img, setImg] = useState(null);
  const setTheImgForWorkspace = (imgFromLanding) => {
    setImg(imgFromLanding);
  }
  const [json, setJson] = useState(null);
  const setTheJsonForWorkspace = (jsonFromLanding) => {
    setJson(jsonFromLanding);
  }
  const [objParams, setObjParams] = useState(null);
  const setPramsForWorkspace = (objParamsFromLanding) => {
    setObjParams(objParamsFromLanding);
  }

  const renderingStarted = (noRenders) => {
    setNoRenders(noRenders);
    setStep(0);
  }

  return (
    <div className="App">
      {step === -1 &&
        <Start stepChanged={stepChanged} dimensionChanged={dimensionChanged}/>
      }
      {step === 0 &&
        <Landing noRenders={noRenders} stepChanged={stepChanged} dimension={dimension} sendOjb3dToParent={setTheObj3dForWorkspace} sendImgToParent={setTheImgForWorkspace} sendJsonToParent={setTheJsonForWorkspace} sendParamsToParent={setPramsForWorkspace}/>
      }
      {step === 1 &&
        <Workspace stepChanged={stepChanged} obj3d={obj3d} img={img} json={json} objParams={objParams} renderingStarted={renderingStarted}/>
      }
    </div>
  );
}

export default App;
