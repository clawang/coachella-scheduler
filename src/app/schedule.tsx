'use client'
import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Session } from '@supabase/supabase-js'
import styles from './page.module.scss'
import { Act, User } from "./types";
import { toTimeString } from './utils/timeFunctions';
import { convertSupabase, findConflicts, timeSortFunction } from './utils/parseData';
import { Supabase } from './supabase/client';
import ActFriendList from './components/friend-cluster';

const dayMap: { [key: number]: any } = {
    418: {
        name: 'Friday, April 18',
        date: '04/18',
    },
    419: {
        name: 'Saturday, April 19',
        date: '04/19',
    },
    420: {
        name: 'Sunday, April 20',
        date: '04/20',
    }
}

export default function Schedule({ session }: { session: Session | null }) {
    const supabase = new Supabase(createClientComponentClient());
    const [acts, setActs] = useState<Act[] | null>(null);
    const [userId, setId] = useState<string>('');

    useEffect(() => {
        if (session?.user.id && !acts) {
            fetchProfile(session.user.id);
            setId(session.user.id);
        }
    }, []);

    const fetchProfile = async (user_id: string) => {
        const { data, error } = await supabase.fetchProfile(user_id);
        if (data?.[0].acts) {
            let convertedActs = convertSupabase(data[0].acts);
            convertedActs.sort(timeSortFunction);
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
            setActs(convertedActs.map((act: Act) => {
                if (act.id in friendActs) {
                    return { ...act, friends: friendActs[act.id] };
                } else {
                    return act;
                }
            }));
        }
    }

    const removeAct = (act_id: number) => {
        if (acts) {
            const temp = [...acts];
            setActs(temp.filter(act => act.id !== act_id));
        }
    }

    return (
        <div className={styles.scheduleWrapper}>
            <h2>Your Schedule</h2>
            {acts &&
                <>
                    {[418, 419, 420].map((day, index) => (
                        <Day
                            key={`${index}-day`}
                            date={day}
                            data={acts}
                            supabase={supabase}
                            userId={userId}
                            removeAct={removeAct}
                        />
                    ))}
                </>
            }
        </div>
    );
}

function Day({ data, date, supabase, userId, removeAct }: {
    data: Array<Act>;
    date: number,
    supabase: Supabase,
    userId: string,
    removeAct: (act_id: number) => void,
}) {

    const [schedule, setSchedule] = useState<Act[]>([]);
    const [conflicts, setConflicts] = useState({});
    const [gaps, setGaps] = useState({});

    useEffect(() => {
        const tempSched = data.filter(item => item.date === dayMap[date].date);
        if (tempSched.length > 0) {
            let tempConflicts = findConflicts(tempSched);
            // let tempGaps = findGaps(tempSched);
            setSchedule(tempSched);
            // setConflicts(tempConflicts);
            // setGaps(tempGaps);
        }
    }, [data]);

    return (
        <div className={styles.scheduleDay}>
            <h3>{dayMap[date].name}</h3>
            {
                schedule.length > 0 ?
                    schedule.map((act, i) => (
                        <ScheduleItem
                            actData={act}
                            supabase={supabase}
                            userId={userId}
                            removeAct={removeAct}
                        />
                    ))
                    :
                    <p>Nothing here yet.</p>
            }
        </div>
    );
}

// function Conflict(props) {

//     const split = () => {
//         const firstActId = props.conflicts[props.index][0].id;
//         const secondActId = props.conflicts[props.index][1].id;
//         let tempSched = [...props.schedule];
//         let tempConflicts = { ...props.conflicts };
//         delete tempConflicts[props.index];
//         props.setConflicts(tempConflicts);
//         const conflictsArray = Object.values(tempConflicts);
//         if (conflictsArray.findIndex(c => c[0].id === firstActId || c[1].id === firstActId) < 0) {
//             const firstAct = tempSched.find(act => act.id === firstActId);
//             firstAct.override = true;
//         }
//         if (conflictsArray.findIndex(c => c[0].id === secondActId || c[1].id === secondActId) < 0) {
//             const secondAct = tempSched.find(act => act.id === secondActId);
//             secondAct.override = true;
//         }
//         props.setSchedule(tempSched);
//     }

//     return (
//         <div className={styles.conflictWrapper}>
//             <h3>These two acts conflict:</h3>
//             <div className={styles.conflictActsWrapper}>
//                 <ActContainer data={props.conflicts[props.index][0]} isAdded={true} />
//                 <ActContainer data={props.conflicts[props.index][1]} isAdded={true} />
//             </div>
//             <button onClick={split}>See both</button>
//         </div>
//     );
// }

// function Gap({ data }: { data: Array<Act> }) {

//     const [artists, setArtists] = useState([]);
//     const [open, setOpen] = useState(false);
//     const [hidden, setHidden] = useState(false);

//     useEffect(() => {
//         let dayActs = props.allActs.filter(act => act.date === dayMap[props.day].date);
//         let tempArtists = findArtistsWithinTime(data[0], data[1], dayActs);
//         setArtists(tempArtists);
//     }, [setArtists]);

//     return (
//         <div className={"gap-wrapper" + (hidden ? ' hidden' : '')}>
//             <p onClick={() => setHidden(true)} id="close">X</p>
//             <h3>There's a gap in your schedule.</h3>
//             {artists.length > 0 ?
//                 <div>
//                     <p>Here are some artists playing within this time.</p>
//                     <div className={"gap-artists-wrapper" + (open ? ' open' : '')}>
//                         {artists.map((act: Act) => <ActContainer key={act.id} data={act} isAdded={false} />)}
//                     </div>
//                     <a onClick={() => setOpen(!open)}>{open ? 'Collapse' : 'See All →'}</a>
//                 </div>
//                 :
//                 <p>Try exploring the festival grounds or getting something to eat!</p>
//             }
//         </div>
//     );
// }

function ScheduleItem({ actData, supabase, userId, removeAct }: {
    actData: Act,
    supabase: Supabase,
    userId: string,
    removeAct: (act_id: number) => void,
}) {
    const handleClick = async () => {
        if (!userId) return;
        let { data, error } = await supabase.unjoinUserAct(userId, actData.id);
        if (!error) {
            removeAct(actData.id);
        }
        console.log(error);
    }

    return (
        <div className={styles.scheduleItemWrapper}
            style={{ '--friend-cluster-border-color': '#f9f1e2' } as React.CSSProperties}
        >
            <div className="schedule-item-top">
                <div className="schedule-item-info">
                    <p className="schedule-item-time">{toTimeString(actData.startTime)} - {toTimeString(actData.endTime)}</p>
                    <h3>{actData.name}</h3>
                    <div className={styles.scheduleItemLocation}>
                        <img src="./pin.png" />
                        <h4>{actData.stage}</h4>
                    </div>
                </div>
                <button onClick={handleClick}>
                    Remove
                </button>
            </div>
            {
                actData.conflict && <p className={styles.error}>This act conflicts with another you want to see.</p>
            }
            {
                actData.friends &&
                <div className={styles.friendListWrapper}>
                    <ActFriendList friends={actData.friends} />
                </div>
            }
        </div>
    );
}

// function ActContainer({ data, isAdded }: { data: Act, isAdded: boolean }) {

//     const handleClick = (e: React.MouseEvent<HTMLInputElement>) => {
//         // props.editSchedule(data.id);
//     }

//     return (
//         <div className={styles.actWrapper} onClick={handleClick} style={{ cursor: 'pointer' }}>
//             <p>{data.startTime.toTimeString()} - {data.endTime.toTimeString()}</p>
//             <h3>{data.name}</h3>
//             <div className={styles.actLocation}>
//                 <img src="./pin.png" />
//                 <h4>{data.stage}</h4>
//             </div>
//             <a className={styles.action}>{isAdded ? 'Remove' : 'Add'}</a>
//         </div>
//     );
// }