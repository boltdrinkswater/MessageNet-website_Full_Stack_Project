import React from 'react';
import './Home.css';
import {useNavigate} from 'react-router-dom';

function Home(){


    const navigate = useNavigate();
    const handleLoginClick = () => {
        navigate('/signin');
    }
    return(
        <div className="outermost">
            <div className="nav-bar">
                <img src="public/assets/message.png" ></img>
                <h1> MessageNet</h1>
                <button type='button' onClick = {handleLoginClick}>Log in</button>
            </div>

            <div className="central">
            <div className="mid-div">
                <h2 id="mid-heading">Message anyone , anywhere across the web</h2>
                <h3>Welcome to MessageNet, your premier destination for seamless and secure online communication. Our platform is designed to bring people closer together, whether you're chatting with friends, collaborating with colleagues, or connecting with family members across the globe.
                </h3>
            </div>
            <div className="mid-div2">
                
            </div>

            </div>
        </div>
    );
}

export default Home;