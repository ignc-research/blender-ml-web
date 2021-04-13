import './Landing.css';
import React, { useState } from 'react';
import backgroundVideo from './video.mp4';
import { Button } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import LinearProgress from '@material-ui/core/LinearProgress';
import axios from 'axios';
//import e from 'cors';

function Landing(props) {
  const [fileSelected, setFileSelected] = useState(false);
  const [imagesSelected, setImagesSelected] = useState(false);
  const [jsonSelected, setJsonSelected] = useState(false);
  const [fileName, setfileName] = useState(''); // for drop area 1
  const [fileCount, setfileCount] = useState(0); // for drop area 2
  const [fileNameJSON, setfileNameJSON] = useState(''); // for drop area 3

  const [trainingStarted, setTrainingStarted] = useState(false);
  const [trainingEpisodes, setTrainingEpisodes] = useState(0);
  const [trainingLoss, setTrainingLoss] = useState(0.0);
  const [trainingRunning, setTrainingRunning] = useState(false);
  const [trainingFinished, setTrainingFinished] = useState(false);

  //change the hyperlink to the website to 2D or 2.5D according to the user choice
  var website = "http://annotate.photo/"
  if(props.dimension === 2) website = "http://2d-on-2d.annotate.photo/"
  if(props.dimension === 2.5) website = "http://3d-on-2d.annotate.photo/"

  //input parameters 
  const [dataFieldsTemp, setDataFieldsTemp] = useState({numberOfRenders:10, numberOfRealImages:0, train_test_split:'5/5'});
  const [dataFields, setDataFields] = useState({numberOfRenders:0, numberOfRealImages:0, train_test_split:0});
  
  var getRenderingProgressInterval = null;
  const [progress, setProgress] = useState(0);
  // For progress bar, when "Rendering" started 
  const renderingStarted = () => {
      getRenderingProgressInterval = setInterval(() => {
        getRenderingProgress()
      }, 2000);
  }

  const getRenderingProgress = () => {
    axios({
      "method": "GET",
      "url": "http://localhost:3001/progress",
      "headers": {}
    })
    .then((response) => {
      var value = (parseInt(response.data) - 0) * 100 / (props.noRenders - 0);
      setProgress(value);
      // setProgress(parseInt(response.data))

      if(parseInt(response.data)/props.noRenders >= 1){
        clearInterval(getRenderingProgressInterval);
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  if(props.noRenders !== -1) {
    renderingStarted();
    console.log('The rendering is running..')
  }

  const initTrainTrig = () => {
    if(jsonSelected || props.objParams.numberOfRealImages === 0){ // check if the json file has been uploaded, only if an uploader is visible
      var data = { 
        start : "training",
      }
      //Node API test
      axios({
        "method": "POST",
        "url": "http://localhost:3001/receivetraintrigger",
        "headers": {
          
        }, "params": {
          "myData": data
        }
      })
      .then((response) => {
        console.log(response)
      })
      .catch((error) => {
        console.log(error)
      })
      setTrainingStarted(true)
      setTrainingRunning(true)
      
    }else{
      alert('Please select a json file');
    }
  }

  var getTrainingProgressInterval = null;
  const trainStarted = () => {
    getTrainingProgressInterval = setInterval(() => {
      getTrainingProgress()
    }, 2000);
  }

  const getTrainingProgress = () => {
    axios({
      "method": "GET",
      "url": "http://localhost:3001/progresstraining",
      "headers": {}
    })
    .then((response) => {
      var episodes = parseInt(response.data.episodes);
      var loss = parseFloat(response.data.loss);
      setTrainingEpisodes(episodes)
      setTrainingLoss(loss)
      if (trainingRunning === false){ // TODO: trainingRunning is here stil not updated, so it will not go inside!?
        clearInterval(getTrainingProgressInterval);
      }
    })
    .catch((error) => {
      console.log(error)
    })
  }

  if(trainingRunning === true) { // TODO: check!
    //getTrainingProgress();
    trainStarted()
    console.log('The training is running..')
  }

  const onChangeFields = (name, e) => {
    if (name === "train_test_split"){
      setDataFieldsTemp({...dataFieldsTemp,[name]:e.target.value})
    }else{
      setDataFieldsTemp({...dataFieldsTemp,[name]:parseFloat(e.target.value)})
    }
  }

  const convertParameters = () => {
    setDataFields({...dataFields,numberOfRenders:dataFieldsTemp.numberOfRenders})
    setDataFields({...dataFields,numberOfRealImages:dataFieldsTemp.numberOfRealImages})
    let train_test_split_float = 0.0
    if (dataFieldsTemp.train_test_split.split('/').length === 2) {
      train_test_split_float = parseFloat(dataFieldsTemp.train_test_split.split('/')[0])/parseFloat(dataFieldsTemp.train_test_split.split('/')[1])
    }
    setDataFields({...dataFields,train_test_split:train_test_split_float})
    
    dataFields.numberOfRenders = dataFieldsTemp.numberOfRenders
    dataFields.numberOfRealImages = dataFieldsTemp.numberOfRealImages
    dataFields.train_test_split = train_test_split_float
  }

  const setParameters = () => {
    props.sendParamsToParent(dataFields);
  }

  const btnClickedNext = () => {
    if(fileSelected){
      if(dataFieldsTemp.numberOfRenders !== 0 && dataFieldsTemp.train_test_split !== ''){
        convertParameters();
        if (dataFields.train_test_split === 0.0 || isNaN(dataFields.train_test_split) === true){
          alert('The "Training data / test data" - relation is not correctly set');
        }else{
          if(dataFieldsTemp.numberOfRealImages > 0 && !imagesSelected){
            alert('Please select image files');
          }else{
            setParameters();
            props.stepChanged(1); // Switch to the working space.
          }
        }
      }else{
        alert('Please fill out the parameters');
      }
    }else
      alert('Please select a ply file');
  }

  const btnClickedPrev =() => {
    props.stepChanged(-1); // Switch back to the initial page.
  }

  const btnClickedRestart =() => {
    props.stepChanged(-1); // Switch back to the initial page.
    window.location.reload(); // reset the page
  }

  const btnClickedStopTraining = () => {
    setTrainingFinished(true)
    setTrainingRunning(false)
    var data = { 
      end : "training",
    }
    //Node API test
    axios({
      "method": "POST",
      "url": "http://localhost:3001/receivetrainstop",
      "headers": {
        
      }, "params": {
        "myData": data
      }
    })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  const sendData = (bodyFormData, name) => { // test it!
    axios({
      "method": "POST",
      "url": "http://localhost:3001/" + name, // name = 'upload3d', 'uploadImg', 'uploadJson'
      "data": bodyFormData,
      "headers": {'Content-Type': 'multipart/form-data' }
    })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })
  }

  const dragAndDropArea = (event, dropAreaID) => {
    let dropArea = document.getElementById(dropAreaID)
    
    // Prevent default drag behaviours, otherwise the browser will end up opening the dropped file instead of sending it along to the drop event handler!
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false)   
      document.body.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Add an indicator to let the user know that they have indeed dragged the item over the correct area by using CSS to change the color of the border color of the drop area.
    ;['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false)
    })

    function highlight(e) {
      dropArea.classList.add('highlight')
    }

    function unhighlight(e) {
      dropArea.classList.remove('highlight')
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false)

    function handleDrop(e) {
      let dt = e.dataTransfer
      let files = dt.files
      handleFiles(files, dropAreaID)
    }

    function handleFiles(files, dropAreaID) {
      files = [...files]
      if (dropAreaID === 'drop-area'){
        let cur_file = files[files.length - 1] // only one file should be uploaded, if multiple, then take the last file
        if (cur_file.name.split('.ply').length === 2){ // only if the type is ply
          setFileSelected(true);
          setfileName(cur_file.name)
          props.sendOjb3dToParent(cur_file);
          var bodyFormData = new FormData();
          bodyFormData.append('name', 'obj');
          bodyFormData.append('obj3d', cur_file);
          sendData(bodyFormData, "upload3d");
        }
      }
      if(dropAreaID === 'drop-area2'){
        var onlyImgFiles = [];
        for (var i=0; i < files.length; i++){
          if (files[i].type.split("image").length === 2){ // only if the type is an image
            onlyImgFiles.push(files[i]);
          }
        }
        var bodyFormDataImages = new FormData();
        bodyFormDataImages.append('name', 'obj');
        for (var j=0; j < onlyImgFiles.length; j++){
          bodyFormDataImages.append(onlyImgFiles[j].name, onlyImgFiles[j]); // 'image' + i.toString()
        }
        sendData(bodyFormDataImages, "uploadImg");
        const galleryNode = document.getElementById("gallery"); // reset the gallery
        while (galleryNode.firstChild) {
          galleryNode.removeChild(galleryNode.lastChild);
        }
        onlyImgFiles.forEach(previewFile)
        props.sendImgToParent(onlyImgFiles); // array of image files, not only one
        setfileCount(onlyImgFiles.length)
        setImagesSelected(true);
      }
      if(dropAreaID === 'drop-area3'){
        let cur_file = files[files.length - 1] // take the last file
        if (cur_file.type === "application/json"){ // only if the type is json
          setfileNameJSON(cur_file.name)
          props.sendJsonToParent(cur_file);
          var bodyFormDataJson = new FormData();
          bodyFormDataJson.append('name', 'obj');
          bodyFormDataJson.append('json', cur_file);
          sendData(bodyFormDataJson, "uploadlabels")
          setJsonSelected(true);
        }
      }
    }
  }

  // Image Preview
  function previewFile(file) {
    let reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function() {
      let img = document.createElement('img')
      img.src = reader.result
      document.getElementById('gallery').appendChild(img)
    }
  }

  const dragAndDropAreaDefault = event => { // TODO: use the progress bar? -> it has to be changed to listen to our server
    let dropArea = document.getElementById('drop-area')
    let uploadProgress = [] // track the percentage completion of each request instead of just how many are done
    let progressBar = document.getElementById('progress-bar')
    
    // Prevent default drag behaviours, otherwise the browser will end up opening the dropped file instead of sending it along to the drop event handler!
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      let dropArea = document.getElementById('drop-area')
      dropArea.addEventListener(eventName, preventDefaults, false)   
      document.body.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Add an indicator to let the user know that they have indeed dragged the item over the correct area by using CSS to change the color of the border color of the drop area.
    ;['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false)
    })

    function highlight(e) {
      dropArea.classList.add('highlight')
    }

    function unhighlight(e) {
      dropArea.classList.remove('highlight')
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false)

    function handleDrop(e) {
      let dt = e.dataTransfer
      let files = dt.files
      handleFiles(files)
    }

    function handleFiles(files) {
      files = [...files]
      initializeProgress(files.length)
      files.forEach(uploadFile)
    }

    function uploadFile(file, i) {
      //var url = 'YOUR URL HERE' // change the URL to work with the back-end or service
      var url = 'https://api.cloudinary.com/v1_1/magdalena/image/upload' // to test with a free cloudinary account (works only for images, not for ply files)
      var xhr = new XMLHttpRequest() // to support Internet Explorer
      var formData = new FormData()
      xhr.open('POST', url, true)
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      
      // The progress bar will then show how much it takes to upload it to a cloud, but not to our server, it will still be very fast, so could be still used for showing an approximate time.
      // Update progress (can be used to show progress indicator)
      xhr.upload.addEventListener("progress", function(e) {
        updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
      })

      xhr.addEventListener('readystatechange', function(e) {
        // Depending on how the server is set up, different ranges of status numbers rather than just 200 may also be checked
        if (xhr.readyState === 4 && xhr.status === 200) {
          updateProgress(i, 100)
          // Done. Inform the user
        }
        else if (xhr.readyState === 4 && xhr.status !== 200) {
          // Error. Inform the user
        }
      })

      formData.append('upload_preset', 'pworvx7a') // preset name: pworvx7a, ml_default
      formData.append('file', file) // update, if the server needs more information
      xhr.send(formData)

      setFileSelected(true);
      setfileName(file.name)
      props.sendOjb3dToParent(file);
      var bodyFormData = new FormData();
      bodyFormData.append('name', 'obj');
      bodyFormData.append('obj3d', file);
      sendData(bodyFormData, "upload3d");
    }
    
    // Tracking Progress
    function initializeProgress(numFiles) {
      progressBar.value = 0
      uploadProgress = []

      for(let i = numFiles; i > 0; i--) {
      uploadProgress.push(0)
      }
    }

    function updateProgress(fileNumber, percent) {
      uploadProgress[fileNumber] = percent
      let total = uploadProgress.reduce((tot, curr) => tot + curr, 0) / uploadProgress.length
      console.debug('update', fileNumber, percent, total)
      progressBar.value = total
    }
  }

  //When file selected, post it to server
  const onChangeHandler = event => {
    let file = event.target.files[0]
    setFileSelected(true);
    setfileName(file.name)
    props.sendOjb3dToParent(file);
    var bodyFormData = new FormData();
    bodyFormData.append('name', 'obj');
    bodyFormData.append('obj3d', file);
    sendData(bodyFormData, "upload3d");
  }

  const onChangeHandler2 = event => {
    setImagesSelected(true);
    var bodyFormDataImages = new FormData();
    bodyFormDataImages.append('name', 'obj');
    const galleryNode = document.getElementById("gallery"); // reset the gallery
    while (galleryNode.firstChild) {
      galleryNode.removeChild(galleryNode.lastChild);
    }
    for (var i=0; i < event.target.files.length; i++){
      bodyFormDataImages.append("photos", event.target.files[i]); // the key should stay the same!
      previewFile(event.target.files[i])
    }
    sendData(bodyFormDataImages, "uploadImg");
    props.sendImgToParent(event.target.files); // array of files, not only one
    setfileCount(event.target.files.length)
  }

  const onChangeHandler3 = event => {
    let file = event.target.files[0]
    setJsonSelected(true);
    setfileNameJSON(file.name)
    props.sendJsonToParent(file);
    var bodyFormData = new FormData();
    bodyFormData.append('name', 'obj');
    bodyFormData.append('json', file);
    sendData(bodyFormData, "uploadlabels");
  }
  
  return (
    <div className="Landing">
      <video autoPlay muted loop id="video">
          <source src={backgroundVideo} type="video/mp4" />
      </video>

      { props.noRenders === -1 &&
        <div className="navigation">
          <Button id="nav-back" variant="contained" color="secondary" onClick={btnClickedPrev} startIcon={<KeyboardBackspaceIcon />}>Back</Button>
        </div>
      }
      { props.noRenders !== -1 &&
        <br />
      }

      {/* Progress bar */}
      { props.noRenders !== -1 && !trainingStarted &&
        <div className="progress-section">
          <div className="progress-bar">
            <LinearProgress variant="determinate" value={progress} />
          </div>
          <div className="progress-value">
            {parseFloat(progress).toFixed(1)}%
          </div>
        </div>
      }

      { props.noRenders !== -1 && !trainingStarted && progress >= 100 && // TODO: debug
        <h1>
          <Button
            id="train"  
            onClick={initTrainTrig} 
            variant="contained"
            color="default"
            // disabled={React.state.disabled}
            // className={classes.button}
            endIcon={<DoubleArrowIcon  />}
          >
            Start Training
          </Button>
        </h1>
      }

      { props.noRenders === -1 &&
        <div>
          <div id="drop-area">
            <form className="my-form">
              <br /><br /><p>Upload a 3D object ( one ply file )<br /><br />with the file dialog or<br />
              <Button color="secondary" onClick={(e) => dragAndDropArea(e, 'drop-area')} > activate </Button><br />
              the drag and drop behavior for the dashed region</p>
              <br /><input type="file" name="file" id="fileElem" accept=".ply" onChange={onChangeHandler}/>
              <label className="button" htmlFor="fileElem">Select a file</label>
              &nbsp;{fileName}
            </form>
          </div>

          <div className="container">
            <div className="center">
              <h3 className="set-parameters">Parameters</h3>
            </div>
          </div>

          <div className="container">
            <div className="center set-parameters">
              Amount of by blender generated images:&nbsp;
              <input value={dataFieldsTemp.numberOfRenders} onChange={(e) => onChangeFields("numberOfRenders", e)} className="form-control" type="number" min="0"/>&nbsp;
              <span className="btn btn-secondary tooltip" data-bs-toggle="tooltip" data-bs-placement="right" title="Set the amount of by blender generated images to an integer number bigger or equal to zero.">Info</span>
            </div>
          </div>
          {/*TODO: better ask: real images yes or no and calculate here the uploaded images and send this number to backend if necessary OR give at least an error if the number of images given and uploaded do not match*/}
          <div className="container">
            <div className="center set-parameters">
              Amount of real images:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input value={dataFieldsTemp.numberOfRealImages} onChange={(e) => onChangeFields("numberOfRealImages", e)} className="form-control" type="number" min="0"/>&nbsp;
              <span className="btn btn-secondary tooltip" data-bs-toggle="tooltip" data-bs-placement="right" title="Set the amount of real images to an integer number bigger or equal to zero. If a number bigger then zero is chosen, a second drag and drop area will be shown on the bottom of the page for uploading the images.">Info</span>
            </div>
          </div>
          {/*leave it as a relation and calculate it to a double in the code and send it like this to the backend*/}
          <div className="container">
            <div className="center set-parameters">
              "Training data / test data" - relation:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <input value={dataFieldsTemp.train_test_split} onChange={(e) => onChangeFields("train_test_split", e)} className="form-control" type="text"/>&nbsp;
              <span className="btn btn-secondary tooltip" data-bs-toggle="tooltip" data-bs-placement="right" title="The relation between the training data and the test data is expected. Please write it in the form '<training_data>/<test_data>'. For example '80/20'.">Info</span>
            </div>
          </div>
        
          {dataFieldsTemp.numberOfRealImages > 0 && 
            <div id="drop-area2">
              <form className="my-form">
                {/* Important: if clicked again or drag&dropped again, the images will be reseted! That is why it is not a problem anymore that the same image could be uploaded (once per button click and once per drag&drop) */}
                <br /><br /><p>Upload one or multiple image file/s<br /><br />with the file dialog or<br />
                <Button color="secondary" onClick={(e) => dragAndDropArea(e, 'drop-area2')}> activate </Button><br />
                the drag and drop behavior for the dashed region</p>
                <br /><input type="file" name="file" id="fileElem2" multiple accept="image/*" onChange={onChangeHandler2}/>
                <label className="button" htmlFor="fileElem2">Select some files</label>
                &nbsp;{fileCount}&nbsp;file/s uploaded
                <br /><br /><progress id="progress-bar" max="100" value="0"></progress>
                {/* TODO: A progress bar with our service! For now it is hided. The progress bar should be also working with the file dialog. See dragAndDropAreaDefault(). */}
                <div id="gallery"></div>
              </form>
            </div>
          }

          <div className="container">
            <div className="center">
              <Button id="nav-go" variant="contained" color="default" onClick={btnClickedNext} endIcon={<DoubleArrowIcon />}>go to workspace</Button>
            </div>
          </div>
        </div>
      }

      {/* The json file uploader does not have to be shown, if the user has set real_images = 0. */}
      {/* dataFieldsTemp.numberOfRealImages will have here the reseted value of 0, so the passed parameters to workspace should be then passed back here (see App.js) -> props.objParams.numberOfRealImages will have the value set from the user */}
      {/* The json file uploader should be again made invisible when the training starts. */}
      { props.noRenders !== -1 && props.objParams.numberOfRealImages > 0 && !trainingStarted &&
        <div id="drop-area3">
          <form className="my-form">
            <br /><br /><p>Visit <a href={website} target="_blank" rel="noreferrer">annotate.photo</a> and after the manual image labeling<br /><br />upload the resulting json file<br /><br />with the file dialog or<br />
            <Button color="secondary" onClick={(e) => dragAndDropArea(e, 'drop-area3')}> activate </Button><br />
            the drag and drop behavior for the dashed region</p>
            <br /><input type="file" name="file" id="fileElem3" accept="application/json" onChange={onChangeHandler3}/>
            <label className="button" htmlFor="fileElem3">Select file</label>
            &nbsp;{fileNameJSON}
          </form>
        </div>
      }

      { trainingStarted &&
        <div>
          <div className="container-small">
            <div className="center set-parameters">
              <h3>The training is running...</h3>
            </div>
          </div>
          <div className="container-small">
            <div className="center set-parameters">
              You can download your model at any time now, as many times as you want to check it out.
            </div>
          </div>
          <div className="container-small">
            <div className="center set-color-red">
              Current number of episodes: {trainingEpisodes}
            </div>
          </div>
          <div className="container-small">
            <div className="center set-color-red">
              Current model loss: {trainingLoss}
            </div>
          </div>
          <br />
          <div className="container-small">
            <div className="center">
              <a id="download_href" href="../model.pth" download="model.pth">Download</a> {/* listens to http://localhost:3000/model.pth; if needed correct the path in 'href' */}
            </div>
          </div>
          <br />
          <div className="container-small">
            <div className="center set-parameters">
              When you are fine with the model, please stop the training process and download your final model.
            </div>
          </div>
          <br />
          <div className="container-small">
            <div className="center">
            <input type="button" id="stop_button" onClick={btnClickedStopTraining}/>
            <label className="button" htmlFor="stop_button">Stop the training</label>
            </div>
          </div>
          <br /><br />
        </div>
      }
      { trainingStarted && trainingFinished &&
        <div>
          <div className="container-small">
            <div className="center set-parameters">
              <h3>Congratulations!</h3>
            </div>
          </div>
          <div className="container-small">
            <div className="center set-parameters">
              You are done. Thank you for using our website.
            </div>
          </div>
          <div className="container-small">
            <div className="center set-parameters">
              <Button variant="contained" color="secondary" onClick={btnClickedRestart} startIcon={<KeyboardBackspaceIcon />}>Start all over again</Button>
            </div>
          </div>
        </div>
      }

    </div>
  );
}

export default Landing;
  