import './Landing.css';
import React, { useState } from 'react';
import backgroundVideo from './video.mp4';
import { Button } from '@material-ui/core';
import axios from 'axios';

function Landing(props) {
  const [fileSelected, setFileSelected] = useState(false);

  const btnClicked = () => {
    if(fileSelected)
      props.stepChanged(1);
    else
      alert('Please select a file');
  }

  // usedragAndDropArea(() => {
  const dragAndDropArea = event => {

    let dropArea = document.getElementById('drop-area')
    //let uploadProgress = [] // track the percentage completion of each request instead of just how many are done
    //let progressBar = document.getElementById('progress-bar')
    
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
      //initializeProgress(files.length)
      files.forEach(uploadFile)
      //files.forEach(previewFile)
    }

    function uploadFile(file, i) {
      //var url = 'YOUR URL HERE' // TODO: change the URL to work with the back-end or service
      var url = 'https://api.cloudinary.com/v1_1/magdalena/image/upload' // to test with a free cloudinary account (works only for images, not for ply files)
      var xhr = new XMLHttpRequest() // to support Internet Explorer
      var formData = new FormData()
      xhr.open('POST', url, true)
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
      
      /*// Update progress (can be used to show progress indicator)
      xhr.upload.addEventListener("progress", function(e) {
      updateProgress(i, (e.loaded * 100.0 / e.total) || 100)
      })

      xhr.addEventListener('readystatechange', function(e) {
      // TODO: Depending on how the server is set up, different ranges of status numbers rather than just 200 may also be checked
      if (xhr.readyState === 4 && xhr.status === 200) {
        updateProgress(i, 100)
        // Done. Inform the user
      }
      else if (xhr.readyState === 4 && xhr.status !== 200) {
        // Error. Inform the user
      }
      })*/

      formData.append('upload_preset', 'pworvx7a') // preset name: pworvx7a, ml_default
      formData.append('file', file) // update, if the server needs more information
      xhr.send(formData)
    }
    
    /*// Image Preview
    
    function previewFile(file) {
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = function() {
      let img = document.createElement('img')
      img.src = reader.result
      document.getElementById('gallery').appendChild(img)
      }
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
    }*/

    setFileSelected(true);

  //},[dropArea])
  }

  //When file selected, post it to server
  const onChangeHandler = event => {

    const selected3dObj = event.target.files[0];
    setFileSelected(true);

    props.sendOjb3dToParent(selected3dObj);

    var bodyFormData = new FormData();
    bodyFormData.append('name', 'obj');
    bodyFormData.append('obj3d', selected3dObj); 
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

  const getStarted = event => {
    // TODO
  }

  return (
    <div className="Landing">
      <video autoPlay muted loop id="video">
          <source src={backgroundVideo} type="video/mp4" />
      </video> 

      {/*<input type="file" name="file" accept=".ply,.obj"onChange={onChangeHandler}/>*/}

      <Button fullWidth variant="outlined" color="secondary" onClick={btnClicked}> To workspace </Button>

      <div className="container">
        <div className="center">
          {/*<a  href="#get-started" className="button">GET STARTED</a>*/}
          <form className="my-form">
            <input type="button" name="start" id="get-started" onChange={getStarted}/>
            <label className="button" htmlFor="get-started">GET STARTED</label>
          </form>
        </div>
      </div>

      <div id="drop-area">
        <Button color="secondary" onClick={dragAndDropArea}> activate </Button>
        <form className="my-form">
          <p>Upload a 3D object ( one ply file ) with the file dialog or by dragging and dropping onto the dashed region</p>
          {/*<input type="file" id="fileElem" multiple accept="image/*" onchange="handleFiles(this.files)"></input>*/}
          <input type="file" name="file" id="fileElem" accept=".ply" onChange={onChangeHandler}/>
          <label className="button" htmlFor="fileElem">Select a file</label>
        </form>
        {/*<progress id="progress-bar" max=100 value=0></progress>
        <div id="gallery"></div>*/}
      </div>

      <div className="container">
        <div className="center">
          <h3 color="white">Set The Parameters</h3>
        </div>
      </div>

    </div>
  );
}

export default Landing;
  