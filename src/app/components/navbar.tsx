'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from 'next/navigation'
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs'
import { Supabase } from '../supabase/client';
import { User } from '../types';
import useWindowDimensions from '../utils/useWindowDimensions';
import "../globals.scss";

export function NavBar() {
    const supabase = new Supabase(createClientComponentClient());
    const [userData, setUserData] = useState<User | null>(null);
    const [dropdown, setDropdown] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname()
    const { height, width } = useWindowDimensions();

    useEffect(() => {
        supabase.onAuthStateChange((event, session) => {
            supabase.getCurrentUserData().then((data => {
                setUserData(data);
            }));
        });
    }, [setUserData]);

    const navigate = (route: string) => {
        router.push(route);
        setOpen(false);
    }

    const signOut = async () => {
        await supabase.signOut();
        setUserData(null);
        setOpen(false);
        router.push("/");
    }

    if (width > 800) {
        return (
            <div className="nav-wrapper">
                <div className="nav-logo">
                    <img src="/logo-coachella.svg" />
                </div>
                <div className="nav-links">
                    <Link href="/lineup">
                        <h4
                            id='lineup'
                            className={pathname === "/lineup" ? 'selected' : ''}
                        >
                            Lineup
                        </h4>
                    </Link>
                    {userData ?
                        <>
                            <Link href="/">
                                <h4
                                    id='schedule'
                                    className={pathname === "/" ? 'selected' : ''}
                                >
                                    Schedule
                                </h4>
                            </Link>
                            <div className="profile-wrapper" onClick={() => setDropdown(!dropdown)}>
                                <div className="profile-pic">
                                    <img src={userData.profilePic} />
                                </div>
                                {dropdown && <div className="dropdown-wrapper">
                                    <Link href="/profile">
                                        <div className="dropdown-item">
                                            Profile
                                        </div>
                                    </Link>
                                    <Link href="/friends">
                                        <div className="dropdown-item">
                                            Friends
                                        </div>
                                    </Link>
                                    <div className="dropdown-item" onClick={signOut}>
                                        Log out
                                    </div>
                                </div>
                                }
                            </div>
                        </>
                        :
                        <Link href="/login">
                            <h4
                                id='login'
                                className={pathname === "/login" ? 'selected' : ''}
                            >
                                Log in
                            </h4>
                        </Link>
                    }
                </div>
            </div>
        );
    } else {
        return (
            <div className="mobile-nav-wrapper">
                <div className="hamburger-icon" onClick={() => setOpen(!open)}>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
                <div className={"slide-out-menu" + (open ? " open" : "")}>
                    <img src="/logo-coachella.svg" />
                    <h4
                        id='lineup'
                        onClick={() => navigate("/lineup")}
                        className={pathname === "/lineup" ? 'selected' : ''}
                    >
                        Lineup
                    </h4>
                    {userData ?
                        <>
                            <h4
                                id='schedule'
                                onClick={() => navigate("/")}
                                className={pathname === "/" ? 'selected' : ''}
                            >
                                Schedule
                            </h4>
                            <h4
                                onClick={() => navigate("/profile")}
                                className={pathname === "/profile" ? 'selected' : ''}>
                                Profile
                            </h4>
                            <h4
                                onClick={() => navigate("/friends")}
                                className={pathname === "/friends" ? 'selected' : ''}>
                                Friends
                            </h4>
                            <h4 onClick={signOut}>
                                Log out
                            </h4>
                        </>
                        :
                        <h4
                            id='login'
                            onClick={() => navigate("/login")}
                            className={pathname === "/login" ? 'selected' : ''}
                        >
                            Log in
                        </h4>
                    }
                </div>
            </div>
        )
    }
}