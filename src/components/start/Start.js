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
            <video autoPlay muted loop id="video">
                <source src={backgroundVideo} type="video/mp4" />
            </video>

            <div id="center-horizontally-vertically">
                <form className="my-form">
                    <h1>Welcome!</h1>
                    <h1>3D object tracking in industrial environments made easier</h1>
                    <Button id="button-get-started" onClick={getStarted2D}> GET STARTED with 2D</Button>
                    <Button id="button-get-started" onClick={getStarted2_5D}> GET STARTED with 2.5D</Button>
                </form>
            </div>

            {/*TODO: Give maybe more information about the website - what it does, how it works. */}
            
        </div>
    );
}

export default Start;