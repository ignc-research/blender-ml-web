import './Start.css';
import React from 'react';
import backgroundVideo from './video.mp4';
import { Button } from '@material-ui/core';
import axios from 'axios';

function Start(props) {

    const getStarted2D = () => {
        axios.post('http://localhost:3001/loaddocker', { Dimensions: 2 });
        props.stepChanged(0); // Switch to the landing page.
        props.dimensionChanged(2)
    }

    const getStarted2_5D = () => {
        axios.post('http://localhost:3001/loaddocker', { Dimensions: 2.5 });
        props.stepChanged(0); // Switch to the landing page.
        props.dimensionChanged(2.5)
    }

    return (
             

        <div className="Start">

            
            <div className="header">
                <h1>3D object tracking in industrial environments gets easier here!</h1>
                <p class="expanded__text">We bring you a simple and great interface where you can set up basic configuration for the desired neural network weight. 
                A few clicks will automate the process in generating data for 6D pose estimation. Boost your data generation process here!</p>
            </div>

       
            <div className="about">
                <h2>Tech specs</h2>

                <div className="tile-container">
                    <div className="tile">
                        <div className="tile-image">
                            <img src="/images/blender.png"></img>
                        </div>
                        <div className="tile-text">
                            Generate labeled images using blender script automatically.
                        </div>
                    </div>
                    <div className="tile">
                        <div className="tile-image">
                            <img src="/images/artificial-intelligence.png"></img>
                        </div>
                        <div className="tile-text">
                            6D pose estimation will get trained based on user's configuration.
                        </div>
                    </div>
                    <div className="tile">
                        <div className="tile-image">
                            <img src="/images/annotate.png"></img>
                        </div>
                        <div className="tile-text">
                            Possible to add annotated dataset for neural weight using Annotate.photo 
                        </div>
                    </div>
                </div>
            </div>

            <div className="work-flow">
                 <h2>How it works</h2>
                 <div className="howitworks-image">
                     <img src="/images/howitworks.png"></img>
                 </div>
            </div>

            <div className="get-started-section">
                <h2>Let's get started!</h2>
                <p>Please choose one option for your training dataset</p>
                <div className="button-container">
                <Button variant="outlined" size="large" color="secondary" id="button-get-started" onClick={getStarted2D}> 2D</Button>
                <Button variant="contained" size="large" color="secondary" id="button-get-started" onClick={getStarted2_5D}>  2.5 D</Button>
                </div>

               
            </div>
           
                

            {/* <div id="center-horizontally-vertically">
                <form className="my-form">
                    <h1>Welcome!</h1>
                    <h1>3D object tracking in industrial environments made easier</h1>
                    <Button id="button-get-started" onClick={getStarted2D}> GET STARTED with 2D</Button>
                    <Button id="button-get-started" onClick={getStarted2_5D}> GET STARTED with 2.5D</Button>
                </form>
            </div> */}

           {/*TODO: Give maybe more information about the website - what it does, how it works. */}
        </div>
            
            
    );
}

export default Start;