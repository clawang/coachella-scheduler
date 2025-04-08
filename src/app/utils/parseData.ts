import { Act, stages, dayMap } from "../types";
import { convertTimetoDate } from "./timeFunctions";

const parseData = (str: string) => {
    let data = str.split('\n').map(i => i.split(','));
    let headers: string[] | undefined = data.shift();
    //data = data.filter(d => d.length >= 7);
    let output = data.map((d, index) => {
        let obj: { [key: string]: any } = {};
        headers!.map((h, i) => {
            let str = d[i].trim();
            obj[headers![i].trim()] = str;
        });
        return obj;
    });
    return output;
};

export function convertSupabase(data: Array<{ [key: string]: any }>, notes?: Array<{ [key: string]: any }>): Act[] {
    return data.map(act => {
        const obj = {
            name: act.name,
            date: dayMap[act.date],
            id: act.id,
            stage: stages[act.stage],
            startTime: convertTimetoDate(act.date, act.startTime),
            endTime: convertTimetoDate(act.date, act.endTime),
        } as Act;
        if (notes) {
            const act_user_entry = notes.find(act_user => act_user.act_id === act.id);
            if (act_user_entry) {
                obj.note = act_user_entry.note;
            }
        }
        return obj;
    });
}

const extractProp = (prop: string, arr: Array<any>) => {
    let temp: any[] = [];
    for (let i = 0; i < arr.length; i++) {
        let c = arr[i][prop];
        if (!temp.includes(c) && c !== "") {
            temp.push(c);
        }
    }
    temp.sort();
    return temp;
};

const strToDate = (str: string): Date => {
    return new Date((str.includes('AM') ? '1970/01/02 ' : '1970/01/01 ') + str);
}

const timeSortFunction = (a: Act, b: Act) => {
    return a.startTime.valueOf() - b.startTime.valueOf();
}

const findConflicts = (schedule: Act[]) => {
    let endTime = strToDate('12:00 PM');
    let conflicts: { [key: number]: any } = {};
    for (let i = 0; i < schedule.length; i++) {
        const item = schedule[i];
        if (item.startTime < endTime) {
            item.conflict = true;
            schedule[i - 1].conflict = true;
            let timeSlot = [];
            timeSlot.push(schedule[i - 1]);
            timeSlot.push(item);
            conflicts[i - 1] = timeSlot;
        } else {
            item.conflict = false;
        }
        endTime = item.endTime;
    }
    return conflicts;
}

// const splitActs = (a, b) => {
//     let startTime = strToDate(a.startTime);
//     let endTime = strToDate(b.endTime);
//     let interval = (endTime - startTime) / 2;
//     let newEnd = startTime + Number(interval);
// }

// const findGaps = (schedule) => {
//     let endTime = strToDate('12:00 PM');
//     let endTimeString = '12:00 PM';
//     let gaps = {};
//     for (let i = 0; i < schedule.length; i++) {
//         const item = schedule[i];
//         const gap = (strToDate(item.startTime) - endTime) / 60000;
//         if (gap >= 60) {
//             const gap = [endTimeString, item.startTime];
//             gaps[i] = gap;
//         }
//         endTime = strToDate(item.endTime);
//         endTimeString = item.endTime;
//     }
//     return gaps;
// }

// const findArtistsWithinTime = (startTime, endTime, data) => {
//     const start = strToDate(startTime);
//     const end = strToDate(endTime);
//     let result = [];
//     for (let i = 0; i < data.length; i++) {
//         const item = data[i];
//         const tempStart = strToDate(data[i].startTime);
//         if (tempStart >= start && tempStart < end) {
//             result.push(data[i]);
//         }
//     }
//     return result;
// }

export {
    parseData,
    extractProp,
    timeSortFunction,
    findConflicts,
    // splitActs,
    // findGaps,
    // findArtistsWithinTime
};