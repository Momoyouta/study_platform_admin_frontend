import { makeAutoObservable } from "mobx";

export interface CurrentCourseInfo {
    courseId: string;
    schoolId: string;
    creatorId: string;
}

const EMPTY_COURSE_INFO: CurrentCourseInfo = {
    courseId: '',
    schoolId: '',
    creatorId: '',
};

export class Course {
    currentCourseInfo: CurrentCourseInfo = { ...EMPTY_COURSE_INFO };

    constructor() {
        makeAutoObservable(this);
    }

    setCurrentCourseInfo(payload: Partial<CurrentCourseInfo>) {
        this.currentCourseInfo = {
            ...this.currentCourseInfo,
            ...payload,
        };
    }

    replaceCurrentCourseInfo(payload: Partial<CurrentCourseInfo>) {
        this.currentCourseInfo = {
            ...EMPTY_COURSE_INFO,
            ...payload,
        };
    }

    clearCurrentCourseInfo() {
        this.currentCourseInfo = { ...EMPTY_COURSE_INFO };
    }

    get courseId() {
        return this.currentCourseInfo.courseId;
    }

    get schoolId() {
        return this.currentCourseInfo.schoolId;
    }

    get creatorId() {
        return this.currentCourseInfo.creatorId;
    }
}
