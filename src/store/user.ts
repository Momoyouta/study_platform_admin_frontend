import {makeAutoObservable} from "mobx";

export class User {
    count: number = 0;
    accessToken: string | null = localStorage.getItem('access_token');
    userInfo: any = null;

    constructor() {
        makeAutoObservable(this);
    }

    addCount() {
        this.count += 1;
    }

    setToken(token: string) {
        this.accessToken = token;
        localStorage.setItem('access_token', token);
    }

    setUserInfo(info: any) {
        this.userInfo = info;
    }

    clearToken() {
        this.accessToken = null;
        this.userInfo = null;
        localStorage.removeItem('access_token');
    }
}