'use client'
import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { Supabase } from "@/app/supabase/client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/app/components/button";
import './style.scss';

export default function Profile({ session }: { session: Session }) {
    const [file, setFile] = useState<File | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const supabase = new Supabase(createClientComponentClient());

    useEffect(() => {
        getUsername();
    }, []);

    const getUsername = async () => {
        const { data, error } = await supabase.getUserData(session.user.id);
        if (data) {
            setUsername(data.username);
        }
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files?.[0]) {
            setFile(event.target.files[0]);
        } else {
            setFile(null);
        }
    }

    const onSubmit = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setSuccess(false);
        if (!username || username.length < 3) {
            setError("Your username needs to be at least 3 characters long.");
            return;
        }
        const { error } =
            await supabase.updateUser(file, username, session.user.id);
        if (error) {
            setError(error.message);
        } else {
            setError('');
            setSuccess(true);
        }
    }

    return (
        <div className="update-profile-form">
            <h1>My Profile</h1>
            {
                error && <div className="error-banner"><p>{error}</p></div>
            }
            {
                success && <div className="success-banner"><p>Success!</p></div>
            }
            <div className="input-wrapper">
                <label>Username</label>
                <input
                    type="text"
                    onChange={e => setUsername(e.target.value)}
                    value={username ?? ''}
                />
            </div>
            <div className="input-wrapper">
                <label>Update profile picture</label>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept='image/png, image/jpeg'
                />
            </div>
            <Button handleClick={onSubmit}>Update profile</Button>
        </div>
    )
}