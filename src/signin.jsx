import React, { useState } from 'react';
import './signin.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';

function SignIn() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignUpClick = () => {
        navigate('/signup');
    }

    const handleSignIn = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/signin', {
                username,
                password
            });

            if (response.data.message === 'User found') {
                alert('Sign in successful');
                Cookies.set('username', username, { expires: 7 });
                // Redirect to '/last' component upon successful sign-in
                navigate('/last');
            } else {
                alert('User not found');
            }
        } catch (error) {
            console.error('Error signing in:', error);
            alert('An error occurred during sign in.');
        }
    };

    return (
        <div className="sign-in">
            <h1>Sign in</h1>
            <input 
                placeholder="username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            <button type='submit' onClick={handleSignIn}>Sign In</button>
            <p onClick={handleSignUpClick}>
                Don't have an account? Sign up here
            </p>
        </div>
    );
}

export default SignIn;
