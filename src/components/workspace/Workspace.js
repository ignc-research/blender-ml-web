import './Workspace.css';
import React, { useEffect, useState } from 'react';
import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module';
import { Spherical } from 'three/src/math/Spherical.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader';
import axios from 'axios';
import Button from '@material-ui/core/Button';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import LinearProgress from '@material-ui/core/LinearProgress';
import Slide from '@material-ui/core/Slide';

function Workspace(props) {
  //var getProgressInterval = null;
  const [progress] = useState(0);
  const noRenders = parseInt(props.objParams.numberOfRenders);

  useEffect(() => {
    initThree();
    
  });

  const fov = 45;
  const aspect = 2;  // the canvas default
  const near = 5;
  const far = 50;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  var objRadius = 1;
  const initThree = () => {

    const canvas = document.querySelector('#c');
    const view1Elem = document.querySelector('#view1');
    const view2Elem = document.querySelector('#view2');
    const renderer = new THREE.WebGLRenderer({canvas});
      
    // camera.zoom = 0.05;
    
    camera.up.set(0,0,1);
    camera.position.set(30, 30, 10);
    camera.rotation.y = 90 * Math.PI / 180;
    camera.rotation.z = 90 * Math.PI / 180;
    camera.lookAt(10,10,10);
    const cameraHelper = new THREE.CameraHelper(camera);
  
    const camera2 = new THREE.PerspectiveCamera(
      60,  // fov
      2,   // aspect
      0.1, // near
      500, // far
    );
    camera2.position.set(30, 30, 10);
    camera2.up.set(0, 0, 1);
    camera2.lookAt(0, 0, 0);
  
    const controls2 = new OrbitControls(camera2, view2Elem);
    controls2.target.set(0, 0, 0);
    controls2.update();
  
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('black');
    scene.add(cameraHelper);
    
    const objGeometry = new THREE.SphereGeometry( objRadius, 32, 32 );
    const objMaterial = new THREE.MeshBasicMaterial( { color: 0xffc000, wireframe: true, transparent: true } );
    const objSphereBound = new THREE.Mesh( objGeometry, objMaterial );
    objSphereBound.position.set(0, 0, 0);
    scene.add( objSphereBound );
    // console.log(objSphereBound);

    var cameraRadius = 1;
    const cameraGeometry = new THREE.SphereGeometry( cameraRadius, 32, 32 );
    const cameraMaterial = new THREE.MeshBasicMaterial( { color: 0xdfe3ee, wireframe: true, transparent: true,opacity: 0.25 } );
    const cameraSphereBound = new THREE.Mesh( cameraGeometry, cameraMaterial );
    cameraSphereBound.position.set(0, 0, 0);
    scene.add( cameraSphereBound );
    // console.log(cameraSphereBound);

    const gui = new GUI();

    const radiusFolder = gui.addFolder('Set Radius');
    radiusFolder.add(objSphereBound.geometry.parameters, 'radius', 0, 30).name('Min Radius').onChange(function () {
      objRadius = objSphereBound.geometry.parameters.radius;
      objSphereBound.scale.x = objRadius;
      objSphereBound.scale.y = objRadius;
      objSphereBound.scale.z = objRadius;
    });
    radiusFolder.add(cameraSphereBound.geometry.parameters, 'radius', 0, 50).name('Max Radius').onChange(function () {
      cameraRadius = cameraSphereBound.geometry.parameters.radius;
      cameraSphereBound.scale.x = cameraRadius;
      cameraSphereBound.scale.y = cameraRadius;
      cameraSphereBound.scale.z = cameraRadius;

      camera.position.x = cameraRadius - 4;
      camera.position.y = cameraRadius - 4;
    });
    radiusFolder.open();

    // console.log(camera);

    // coordinateFolder.open()
    var guiContainer = document.getElementById('gui-container');
    guiContainer.appendChild(gui.domElement);

    THREE.Object3D.DefaultUp = new THREE.Vector3(0,0,1);
    
    {
      const planeSize = 100;

      const loader = new THREE.TextureLoader();
      const texture = loader.load('/checker.png');
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      const repeats = planeSize / 2;
      texture.repeat.set(repeats, repeats);
  
      const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
      const planeMat = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
      });
      var plane = new THREE.Mesh(planeGeo, planeMat);
      // plane.rotation.x = Math.PI / 2;
      plane.rotateZ(Math.PI / 2); 
      // plane.position.x = 0;
      // plane.position.y = 0;
      // plane.position.z = 0;
      scene.add(plane);
    } 

    // Load 3d object file 
      var file3d = props.obj3d;
      var reader = new FileReader();
      reader.onload = function ()
      {
          var loader = new PLYLoader();
          //alert(this.result)
          var geometry = loader.parse(this.result);
          var material = new THREE.MeshPhongMaterial( { color: 0x0055ff, flatShading: true } );
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.x = 0;
          mesh.position.y = 0;
          mesh.position.z = 0;
          mesh.rotation.x = Math.PI / 2;

          var multiplier = 5/mesh.geometry.boundingSphere.radius;

          // console.log(mesh);
          mesh.scale.multiplyScalar( multiplier  );
          // console.log(mesh);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          
      }; 
      reader.readAsText(file3d)     
      
    {
      const color = 0xFFFFFF;
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(0, 0, 0);
      light.target.position.set(-5, 0, 0);
      scene.add(light);
      scene.add(light.target);
    }
    
      var axes = new THREE.AxisHelper(50);
      scene.add(axes);
      var gridXY = new THREE.GridHelper(100, 100);
      gridXY.rotateX(Math.PI / 2); 
      scene.add(gridXY);
    

    // resize renderer to screen
    function resizeRendererToDisplaySize(renderer) {
      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
      }
      return needResize;
    }
  
    function setScissorForElement(elem) {
      const canvasRect = canvas.getBoundingClientRect();
      const elemRect = elem.getBoundingClientRect();
  
      // compute a canvas relative rectangle
      const right = Math.min(elemRect.right, canvasRect.right) - canvasRect.left;
      const left = Math.max(0, elemRect.left - canvasRect.left);
      const bottom = Math.min(elemRect.bottom, canvasRect.bottom) - canvasRect.top;
      const top = Math.max(0, elemRect.top - canvasRect.top);
  
      const width = Math.min(canvasRect.width, right - left);
      const height = Math.min(canvasRect.height, bottom - top);
  
      // setup the scissor to only render to that part of the canvas
      const positiveYUpBottom = canvasRect.height - bottom;
      renderer.setScissor(left, positiveYUpBottom, width, height);
      renderer.setViewport(left, positiveYUpBottom, width, height);
  
      // return the aspect
      return width / height;
    }
  
    function render() {
  
      resizeRendererToDisplaySize(renderer);
  
      // turn on the scissor
      renderer.setScissorTest(true);
  
      // render the original view
      {
        const aspect = setScissorForElement(view1Elem);
  
        // update the camera for this aspect
        camera.left   = -aspect;
        camera.right  =  aspect;
        camera.updateProjectionMatrix();
        cameraHelper.update();

        // don't draw the camera helper in the original view
        cameraHelper.visible = false;
        axes.visible = false;
        gridXY.visible = false;
        plane.visible = true;
        objSphereBound.visible = false;
        cameraSphereBound.visible = false;
  
        scene.background.set(0x333333);
        renderer.render(scene, camera);
      }
  
      // render from the 2nd camera
      {
        const aspect = setScissorForElement(view2Elem);
  
        // update the camera for this aspect
        camera2.aspect = aspect;
        camera2.updateProjectionMatrix();
      
        // draw the camera helper in the 2nd view
        cameraHelper.visible = true;
        axes.visible = true;
        gridXY.visible = true;
        plane.visible = false;
        objSphereBound.visible = true;
        cameraSphereBound.visible = true;

        scene.background.set(0x17191e);
        
        renderer.render(scene, camera2);
      }
  
      requestAnimationFrame(render);
    }
  
    requestAnimationFrame(render);
  }

  const initData = () => {
    //cartesian coordinates to Spherical coordinates system
    var minSpherical = new Spherical();
    minSpherical.setFromCartesianCoords(camera.position.x, camera.position.y, objRadius);
    var maxSpherical = new Spherical();
    maxSpherical.setFromCartesianCoords(camera.position.x, camera.position.y, camera.position.z);

    var data = { 
        cam_rmin : objRadius,
        cam_rmax: camera.position.z,
        cam_incmin: minSpherical.phi,
        cam_incmax: maxSpherical.phi,
        cam_azimin: minSpherical.theta,
        cam_azimax: maxSpherical.theta,
        ...props.objParams
    }
    console.log(data);
    axios({
      "method": "POST",
      "url": "http://localhost:3001/uploadcamdata",
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
  // go back to landing page button setting
  const btnClicked = () => {
    setChecked(false);
    setTimeout(() => {
      props.stepChanged(0);
    }, 500)
    
  }

  const [disabled] = useState(false);
  const [checked, setChecked] = useState(true);
  const initRenderTrig = () => {
    initData();
    
    var data = { 
      start : "rendering",
    }
    //Node API test
    axios({
      "method": "POST",
      "url": "http://localhost:3001/receiverendertrigger",
      "headers": {
        
      }, "params": {
        "myData": data
      }
    })
    .then((response) => {
      console.log(response)
      props.renderingStarted(noRenders);

    })
    .catch((error) => {
      console.log(error)
    })
  }

  const initTrainTrig = () => {
    
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
  }
// Workspace UI elements
  return (
    <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
    <div className="App">
      <div className="nav">
        <Button 
          id="back"
          onClick={btnClicked} 
          variant="contained"
          color="primary"
          // className={classes.button}
          startIcon={<KeyboardBackspaceIcon  />}
        >
        Back
        </Button>
        <Button
          id="ren"   
          onClick={initRenderTrig} 
          variant="contained"
          color="default"
          disabled = {disabled}
          // className={classes.button}
          endIcon={<DoubleArrowIcon  />}
        >
        Start Rendering
        </Button>

        { disabled &&
          <div className="progress-bar">
            <LinearProgress variant="determinate" value={progress} />
          </div>
        }
        { disabled &&
          <div className="progress-value">
           {parseFloat(progress).toFixed(1)}%
          </div>
        }

        {progress >= 100 &&
          <Button
            id="train"  
            onClick={initTrainTrig} 
            variant="contained"
            color="default"
            endIcon={<DoubleArrowIcon  />}
          >
          Start Training
          </Button>
        }
      </div>

      { !disabled &&
        <div id="gui-container" ></div>
      }
      { !disabled &&
        <canvas id="c"></canvas>
      }
      { !disabled &&
        <div className="split">
          <div id="view1" tabIndex="1"></div>
          <div id="view2" tabIndex="2"></div>
        </div>
      }

    </div>
    </Slide>
  );

}

export default Workspace;
  