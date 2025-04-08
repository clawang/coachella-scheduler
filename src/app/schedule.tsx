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
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (session?.user.id && !acts) {
            fetchProfile(session.user.id);
        }
    }, []);

    const fetchProfile = async (user_id: string) => {
        const { data, error } = await supabase.fetchProfile(user_id);
        if (data?.[0].acts) {
            let convertedActs = convertSupabase(data[0].acts, data[0].acts_users);
            convertedActs.sort(timeSortFunction);
            const friendData = await supabase.fetchFriendsActsForSchedule(convertedActs);
            const friendActs: { [key: number]: User[] } = {};
            if ("data" in friendData) {
                friendData.data!.forEach((friendAct: { act: any, friend: any, note?: string }) => {
                    const id = friendAct.act.id;
                    if (!(id in friendActs)) {
                        friendActs[id] = [];
                    }
                    friendActs[id].push({ ...friendAct.friend, note: friendAct.note });
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
        if (data?.[0]) {
            setUser({
                id: data[0].id,
                username: data[0].username,
                profilePic: data[0].profilePic
            });
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
                            user={user!}
                            removeAct={removeAct}
                        />
                    ))}
                </>
            }
        </div>
    );
}

function Day({ data, date, supabase, user, removeAct }: {
    data: Array<Act>;
    date: number,
    supabase: Supabase,
    user: User,
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
                            key={act.id}
                            actData={act}
                            supabase={supabase}
                            user={user}
                            removeAct={removeAct}
                        />
                    ))
                    :
                    <p>Nothing here yet.</p>
            }
        </div>
    );
}

function ScheduleItem({ actData, supabase, user, removeAct }: {
    actData: Act,
    supabase: Supabase,
    user: User,
    removeAct: (act_id: number) => void,
}) {
    const [note, setNote] = useState(actData.note ?? '');
    const [notesOpen, setNotesOpen] = useState(false);
    const [noteInputOpen, setInputOpen] = useState(false);
    const [noteInput, setNoteInput] = useState(actData.note ?? '');
    const [friendNotes, setFriendNotes] = useState(actData.friends?.filter(friend => friend.note));

    const handleRemoveClick = async () => {
        if (!user.id) return;
        let { data, error } = await supabase.unjoinUserAct(user.id, actData.id);
        if (!error) {
            removeAct(actData.id);
        }
        console.log(error);
    }

    const editNote = async () => {
        if (!user.id) return;
        let { data, error } = await supabase.editNote(user.id, actData.id, noteInput);
        if (!error) {
            setInputOpen(false);
            setNote(noteInput);
        }
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
                <div className="button-wrapper">
                    <button onClick={() => setInputOpen(!noteInputOpen)}>
                        {note ? "Edit Note" : "+ Note"}
                    </button>
                    <button onClick={handleRemoveClick}>
                        X Remove
                    </button>
                </div>
            </div>
            {
                actData.conflict && <p className={styles.error}>This act conflicts with another you want to see.</p>
            }
            {(actData.friends || note || noteInputOpen) &&
                <div className={styles.scheduleItemFooter}>
                    {
                        (actData.friends || note) &&
                        <div className={styles.friendListWrapper}
                            style={{ paddingRight: '70px' }}>
                            {actData.friends &&
                                <ActFriendList friends={actData.friends} />
                            }
                            {((friendNotes && friendNotes.length > 0) || note) &&
                                <div className="open-notes" onClick={() => setNotesOpen(!notesOpen)}>
                                    {notesOpen ? "Hide notes" : "Show notes"}
                                    <img src={notesOpen ? "/carrot.png" : "/down-carrot.png"} />
                                </div>
                            }
                        </div>
                    }
                    {
                        ((friendNotes && friendNotes.length > 0) || note) && notesOpen &&
                        <div className="friend-notes-wrapper">
                            {friendNotes && friendNotes.length > 0 &&
                                friendNotes.map(note => (
                                    <div className="friend-note-wrapper">
                                        <p><span className="username">{`@${note.username}`}</span>{` ${note.note}`}</p>
                                    </div>
                                ))}
                            {
                                note && !noteInputOpen &&
                                <div className="friend-note-wrapper">
                                    <p><span className="username">{`@${user.username}`}</span>{` ${note}`}</p>
                                </div>
                            }
                        </div>
                    }
                    {
                        noteInputOpen &&
                        <div className="note-wrapper">
                            <div className="profile-pic">
                                {
                                    user.profilePic && <img src={user.profilePic} />
                                }
                            </div>
                            <div className="note-input">
                                <input type="text" value={noteInput} onChange={e => setNoteInput(e.target.value)} />
                                <div className="send-note" onClick={editNote}>↑</div>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    );
}