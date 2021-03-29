import './Landing.css';
import React, { useState } from 'react';
import backgroundVideo from './video.mp4';
import { Button } from '@material-ui/core';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import axios from 'axios';

function Landing(props) {
  const [fileSelected, setFileSelected] = useState(false);
  const [imagesSelected, setImagesSelected] = useState(false);
  const [fileName, setfileName] = useState(''); // for drop area 1
  const [fileCount, setfileCount] = useState(0); // for drop area 2

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
    props.stepChanged(-1); // SWitch back to the initial page.
  }

  const sendData = data => {
    setfileName(data.name)
    props.sendOjb3dToParent(data);

    var bodyFormData = new FormData();
    bodyFormData.append('name', 'obj');
    bodyFormData.append('obj3d', data); 
    axios({
      "method": "POST",
      "url": "http://localhost:3001/upload3d",
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

  const sendData2 = (bodyFormDataImages) => { // TODO: test it!
    axios({
      "method": "POST",
      "url": "http://localhost:3001/uploadImg",
      "data": bodyFormDataImages,
      "headers": {'Content-Type': 'multipart/form-data' }
    })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.log(error)
    })

  }

  //input parameters 
  const [dataFieldsTemp, setDataFieldsTemp] = useState({numberOfDimensions:2.0, numberOfRenders:0, numberOfRealImages:0, train_test_split:''});
  const [dataFields, setDataFields] = useState({numberOfDimensions:2.0, numberOfRenders:0, numberOfRealImages:0, train_test_split:0});
  const onChangeFields = (name, e) => {
    if (name === "train_test_split"){
      setDataFieldsTemp({...dataFieldsTemp,[name]:e.target.value})
    }else{
      setDataFieldsTemp({...dataFieldsTemp,[name]:parseFloat(e.target.value)})
    }
  }

  const convertParameters = () => {
    setDataFields({...dataFields,numberOfDimensions:dataFieldsTemp.numberOfDimensions})
    setDataFields({...dataFields,numberOfRenders:dataFieldsTemp.numberOfRenders})
    setDataFields({...dataFields,numberOfRealImages:dataFieldsTemp.numberOfRealImages})
    let train_test_split_float = 0.0
    if (dataFieldsTemp.train_test_split.split('/').length === 2) {
      train_test_split_float = parseFloat(dataFieldsTemp.train_test_split.split('/')[0])/parseFloat(dataFieldsTemp.train_test_split.split('/')[1])
    }
    setDataFields({...dataFields,train_test_split:train_test_split_float})
    
    dataFields.numberOfDimensions = dataFieldsTemp.numberOfDimensions
    dataFields.numberOfRenders = dataFieldsTemp.numberOfRenders
    dataFields.numberOfRealImages = dataFieldsTemp.numberOfRealImages
    dataFields.train_test_split = train_test_split_float
  }

  const setParameters = () => {
    props.sendParamsToParent(dataFields);
  }

  const dragAndDropArea = event => {

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
      
      // TODO: The progress bar will then show how much it takes to upload it to a cloud, but not to our server, it will still be very fast, so could be still used for showing an approximate time.
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

      // Send (NEW)
      setFileSelected(true);
      sendData(file);

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

  // TODO: manage better both drop areas
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

  const dragAndDropArea2 = event => {

    let dropArea = document.getElementById('drop-area2')
    
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
      handleFiles(files)
    }
    
    function handleFiles(files) {
      files = [...files]
      var onlyImgFiles = [];
      for (var i=0; i < files.length; i++){
        if (files[i].type.split("image").length === 2){ // only if the type is an image
          onlyImgFiles.push(files[i]);
        }
      }
      var bodyFormDataImages = new FormData();
      bodyFormDataImages.append('name', 'obj');
      for (var j=0; j < onlyImgFiles.length; j++){
        uploadFile(onlyImgFiles[j], j, bodyFormDataImages)
      }
      sendData2(bodyFormDataImages);
      const galleryNode = document.getElementById("gallery"); // reset the gallery
      while (galleryNode.firstChild) {
        galleryNode.removeChild(galleryNode.lastChild);
      }
      onlyImgFiles.forEach(previewFile)
      props.sendImgToParent(onlyImgFiles); // array of image files, not only one
      setfileCount(onlyImgFiles.length)
      setImagesSelected(true);
    }

    function uploadFile(file, i, bodyFormDataImages) {
      bodyFormDataImages.append(file.name, file); // 'image' + i.toString()
    }
  }

  //When file selected, post it to server
  const onChangeHandler = event => {
    setFileSelected(true);
    sendData(event.target.files[0]);
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
      bodyFormDataImages.append(event.target.files[i].name, event.target.files[i]); // 'image' + i.toString()
      previewFile(event.target.files[i])
    }
    sendData2(bodyFormDataImages);
    props.sendImgToParent(event.target.files); // array of files, not only one
    setfileCount(event.target.files.length)
  }
  
  return (
    <div className="Landing">
      <video autoPlay muted loop id="video">
          <source src={backgroundVideo} type="video/mp4" />
      </video>
      {/*<input type="file" name="file" accept=".ply"onChange={onChangeHandler}/>*/}

      <div className="navigation">
        <Button id="nav-back" variant="contained" color="secondary" onClick={btnClickedPrev} startIcon={<KeyboardBackspaceIcon />}>Back</Button>
        <Button id="nav-go" variant="contained" color="default" onClick={btnClickedNext} endIcon={<DoubleArrowIcon />}>go to workspace</Button>
      </div>

      <div id="drop-area">
        <form className="my-form">
          <br /><br /><p>Upload a 3D object ( one ply file )<br /><br />with the file dialog or<br />
          <Button color="secondary" onClick={dragAndDropArea}> activate </Button><br />
          the drag and drop behavior for the dashed region</p>
          <br /><input type="file" name="file" id="fileElem" accept=".ply" onChange={onChangeHandler}/>
          <label className="button" htmlFor="fileElem">Select a file</label>
          &nbsp;{fileName}
          <br /><br /><progress id="progress-bar" max="100" value="0"></progress>
          {/* TODO: A progress bar with our service! For now it is hided. The progress bar should be also working with the file dialog. */}
        </form>
      </div>

      <div className="container">
        <div className="center">
          <h3 className="set-parameters">Parameters</h3>
        </div>
      </div>

      {/* TODO: The parameter 2D/2.5D should be also considered! Make sure that the parameter 'train_test_split' is correctly received by the backend! */}
      <div className="container">
        <div className="center set-parameters">
          Dimensions:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <input value={dataFieldsTemp.numberOfDimensions} onChange={(e) => onChangeFields("numberOfDimensions", e)} className="form-control" type="number" min="2.0" max="2.5" step="0.5"/>&nbsp;
          <span className="btn btn-secondary tooltip" data-bs-toggle="tooltip" data-bs-placement="right" title="Set the amount of dimensions. You can choose between 2D and 2.5D.">Info</span>
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
            <br /><br /><p>Upload one or multiple image file/s<br /><br />with the file dialog or<br />
            {/* Important: if clicked again or drag&dropped again, the images will be reseted! That is why it is not a problem anymore that the same image could be uploaded (once per button click and once per drag&drop) */}
            <Button color="secondary" onClick={dragAndDropArea2}> activate </Button><br />
            the drag and drop behavior for the dashed region</p>
            <br /><input type="file" name="file" id="fileElem2" multiple accept="image/*" onChange={onChangeHandler2}/>
            <label className="button" htmlFor="fileElem2">Select some files</label>
            &nbsp;{fileCount}&nbsp;file/s uploaded
            <div id="gallery"></div>
          </form>
        </div>
      }<br />

    </div>
  );
}

export default Landing;
  