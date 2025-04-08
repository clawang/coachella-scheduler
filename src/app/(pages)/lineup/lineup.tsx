'use client'
import React, { useEffect, useState } from 'react';
import { timeSortFunction } from '../../utils/parseData';
import { Session } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Supabase } from '../../supabase/client';
import { Act, Schedule, stages, dayMap, User } from "../../types";
import { toTimeString } from '@/app/utils/timeFunctions';
import { convertSupabase } from '../../utils/parseData';
import ActFriendList from '@/app/components/friend-cluster';
import "./style.scss";

function Lineup({ session }: { session: Session | null }) {
    const supabase = new Supabase(createClientComponentClient());
    const [acts, setActs] = useState<Act[] | null>(null);
    const [day, setDay] = useState(418);
    const [mySchedule, setSchedule] = useState<Schedule>({} as Schedule);

    const fetchProfile = async (user_id: string) => {
        const { data, error } = await supabase.fetchProfile(user_id);
        if (data?.[0].acts) {
            const temp: Schedule = {};
            data[0].acts.map(act => act.id).forEach(act => {
                temp[act] = { conflict: false, override: false };
            });
            setSchedule(temp);
        }
    }

    useEffect(() => {
        if (session?.user.id) {
            fetchProfile(session.user.id);
            if (!acts) {
                getFriendActs();
            }
        } else if (!acts) {
            getActs();
        }
    }, []);

    const getActs = async () => {
        let { data, error } = await supabase.fetchActs();
        if (data) {
            setActs(convertSupabase(data));
        }
        if (error) {
            console.log(error);
        }
    }

    const getFriendActs = async () => {
        let { data, error } = await supabase.fetchActs();
        if (data) {
            const tempActs: Act[] = convertSupabase(data);
            const friendData = await supabase.fetchFriendsActs();
            const friendActs: { [key: number]: User[] } = {};
            if ("data" in friendData) {
                friendData.data!.forEach((friendAct: {act: any, friend: any}) => {
                    const id = friendAct.act.id;
                    if (!(id in friendActs)) {
                        friendActs[id] = [];
                    }
                    friendActs[id].push(friendAct.friend);
                });
            }
            setActs(tempActs.map((act: Act) => {
                if (act.id in friendActs) {
                    return { ...act, friends: friendActs[act.id] };
                } else {
                    return act;
                }
            }));
        }
    }

    const editSchedule = (id: number) => {
        let tempSchedule: Schedule = { ...mySchedule };
        if (tempSchedule.hasOwnProperty(id)) {
            delete tempSchedule[id];
        } else {
            tempSchedule[id] = { conflict: false, override: false };
        }
        setSchedule(tempSchedule);
    }

    return (
        <div className="lineup-page">
            <div className="day-wrapper">
                <button onClick={() => setDay(418)} className={day === 418 ? 'selected' : ''}>Friday</button>
                <button onClick={() => setDay(419)} className={day === 419 ? 'selected' : ''}>Saturday</button>
                <button onClick={() => setDay(420)} className={day === 420 ? 'selected' : ''}>Sunday</button>
            </div>
            <div className="lineup-wrapper">
                <div className="lineup">
                    {acts && stages.map((stage, i) => (
                        <Stage
                            key={i}
                            name={stage}
                            data={acts}
                            day={day}
                            mySchedule={mySchedule}
                            editSchedule={editSchedule}
                            supabase={supabase}
                            userId={session?.user.id ?? null}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function Stage({ day, name, data, mySchedule, editSchedule, supabase, userId }: {
    day: number,
    name: string,
    data: Act[],
    mySchedule: Schedule,
    editSchedule: (id: number) => void,
    supabase: Supabase,
    userId: string | null,
}) {
    const [acts, setActs] = useState<Act[]>([]);

    useEffect(() => {
        let tempActs = data.filter(act => act.stage === name && act.date === dayMap[day]);
        tempActs.sort(timeSortFunction);
        setActs(tempActs);
    }, [data, day]);

    return (
        <div className="stage-wrapper">
            <h2>{name}</h2>
            {acts.map(item => (
                <Artist
                    key={item.id}
                    actData={item}
                    mySchedule={mySchedule}
                    editSchedule={editSchedule}
                    supabase={supabase}
                    userId={userId}
                />
            ))}
        </div>
    );
}

function Artist({ actData, mySchedule, editSchedule, supabase, userId }: {
    actData: Act,
    mySchedule: Schedule,
    editSchedule: (id: number) => void,
    supabase: Supabase,
    userId: string | null,
}) {
    const handleClick = async () => {
        if (!userId) return;
        editSchedule(actData.id);
        let obj = { data: null, error: null };
        if (!mySchedule.hasOwnProperty(actData.id)) {
            obj = await supabase.joinUserAct(userId, actData.id);
        } else {
            obj = await supabase.unjoinUserAct(userId, actData.id);
        }
        if (obj.error) {
            editSchedule(actData.id);
        }
    }

    return (
        <div
            className={
                "artist-wrapper" + (mySchedule.hasOwnProperty(actData.id) ? ' selected' : '')
            }
            style={{ 
                '--friend-cluster-border-color': mySchedule.hasOwnProperty(actData.id) ? '#c9e5d8' : '#83C9D9' } as React.CSSProperties
            }
        >
            <div className="act-info">
                <div className="artist-info">
                    <h3>{actData.name}</h3>
                    <p className="artist-time">{toTimeString(actData.startTime)} - {toTimeString(actData.endTime)}</p>
                </div>
                {
                    userId &&
                    <div className="artist-button-wrapper">
                        <button onClick={handleClick}>
                            {"✓ Going"}
                        </button>
                    </div>
                }
            </div>
            {userId && actData.friends &&
                <ActFriendList friends={actData.friends} />
            }
        </div>
    );
}

export default Lineup;