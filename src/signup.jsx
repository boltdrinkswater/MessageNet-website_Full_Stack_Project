import React, { useState } from 'react';
import './signup.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function SignUp() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSignInClick = () => {
        navigate('/signin');
    }

    const handleSignUp = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/signup', {
                email,
                username,
                password
            });

            if (response.data.message === 'Sign up successful') {
                alert('Sign up successful');
                navigate('/signin');
            }
        } catch (error) {
            console.error('Error signing up:', error);
            if (error.response && error.response.status === 400) {
                alert('Email or Username already exists');
            } else {
                alert('An error occurred during sign up.');
            }
        }
    };

    return (
        <div className="sign-up">
            <h1>Sign up</h1>
            <input 
                placeholder="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
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
            <button type='submit' onClick={handleSignUp}>Sign Up</button>
            <p onClick={handleSignInClick}>
                Already have an account? Sign in here
            </p>
        </div>
    );
}

export default SignUp;
