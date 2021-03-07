import './Start.css';
import React from 'react';
import backgroundVideo from './video.mp4';
import { Button } from '@material-ui/core';

function Start(props) {
    const getStarted = () => {
        props.stepChanged(0); // Switch to the landing page.
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
                    <Button id="button-get-started" onClick={getStarted}> GET STARTED </Button>
                </form>
            </div>

            {/*TODO: Give maybe more information about the website - what it does, how it works. */}
            
        </div>
    );
}

export default Start;