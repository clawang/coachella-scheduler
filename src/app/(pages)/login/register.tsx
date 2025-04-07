'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Supabase } from '../../supabase/client';
import { Button } from '@/app/components/button';
import './style.scss';

const usernameMap: { [key: string]: boolean } = {};

export default function Register({ supabase }: {
    supabase: Supabase
}) {
    const [submitted, setSubmitted] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isUnique, setUnique] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        if (username.length > 3) {
            checkUnique();
        }
    }, [username]);

    const checkUnique = async () => {
        if (usernameMap.hasOwnProperty(username)) {
            setUnique(usernameMap[username]);
        } else {
            const unique = await supabase.isUsernameUnique(username);
            usernameMap[username] = unique;
            setUnique(unique);
        }
    }

    const validateForm = () => {
        if (!email) {
            setError('Missing email address');
            return false;
        } else if (!password) {
            setError('Missing password');
            return false;
        } else if (!username) {
            setError('Missing username');
            return false;
        } else if (username.length < 3) {
            setError('Your username must at least 3 characters');
            return false;
        }
        return true;
        // check if password has uppercase, lowercase, and number
    }

    const handleSignUp = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        if (validateForm()) {
            const { data, error } = await supabase.signUp(
                email,
                password,
                username
            );
            if (data?.user) {
                setSubmitted(true);
                router.refresh();
                router.push("/");
            }
            if (error) {
                setError(error.message);
            }
        }
    }

    return (
        <>
            <h2>Sign Up</h2>
            {
                error && <div className="error-banner"><p>{error}</p></div>
            }
            <form className="loginForm">
                <div className="inputWrapper">
                    <label>E-mail</label>
                    <input name="email" onChange={(e) => setEmail(e.target.value)} value={email} />
                </div>
                <div className="inputWrapper">
                    <label>Username</label>
                    <input name="username" onChange={(e) => setUsername(e.target.value)} value={username} />
                    {username && !isUnique && <p className="error">That username is already taken.</p>}
                </div>
                <div className="inputWrapper">
                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        onChange={(e) => setPassword(e.target.value)}
                        value={password}
                    />
                </div>
                <Button handleClick={handleSignUp}>Sign up</Button>
            </form>
        </>
    )
}