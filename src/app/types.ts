export interface Act {
    date: string | number,
    name: string,
    startTime: Date,
    endTime: Date,
    stage: string,
    id: number,
    conflict?: boolean,
    friends?: User[],
}

export interface User {
    id: string,
    username: string,
    email: string,
    profilePic: string,
    status?: number,
}

export interface Schedule {
    [key: number]: any;
}

export enum RELATIONSHIP_STATUS {
    NO_RELATION = 0,
    REQUESTER = 1,
    REQUESTEE = 2,
    FRIENDS = 3,
    BLOCKED = 4,
};

export const dayMap: { [key: number]: string } = {
    418: '04/18',
    419: '04/19',
    420: '04/20',
    422: '04/22',
    423: '04/23',
    424: '04/24',
};

export const stages = ['Coachella', 'Gobi', 'Mojave', 'Outdoor', 'Sahara', 'Sonora', 'Yuma', 'Quasar'];

/*
Stages:
0 - Coachella
1 - Gobi
2 - Mojave
3 - Outdoor
4 - Sahara
5 - Sonora
6 - Yuma
*/