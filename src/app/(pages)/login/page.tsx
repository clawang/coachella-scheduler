'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Supabase } from '../../supabase/client';
import { Button } from '@/app/components/button';
import Register from './register';
import './style.scss';

export default function Login() {
    const [newUser, setNewUser] = useState(false);
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('');
    const router = useRouter()
    const supabase = new Supabase(createClientComponentClient());

    const handleSignIn = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.signIn(
            email,
            password,
        );

        if (error) {
            setError(error.message);
        } else {
            router.refresh();
            router.push("/");
        }
    }

    return (
        <div className="loginWrapper">
            {newUser ?
                <Register supabase={supabase} />
                :
                <>
                    <h2>Login</h2>
                    {
                        error && <div className="error-banner"><p>{error}</p></div>
                    }
                    <form className="loginForm">
                        <div className="inputWrapper">
                            <label>E-mail</label>
                            <input name="email" onChange={(e) => setEmail(e.target.value)} value={email} />
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
                        <Button handleClick={handleSignIn}>Sign in</Button>
                    </form>
                    <p className="link">Don't have an account? <a onClick={() => setNewUser(true)}>Sign up</a></p>
                </>
            }
        </div>
    )
}