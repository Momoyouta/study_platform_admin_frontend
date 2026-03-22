import { BaseUserInfo } from "@/type/user";
import { makeAutoObservable } from "mobx";

export class User {
    count: number = 0;
    accessToken: string | null = localStorage.getItem('access_token');
    userBaseInfo: BaseUserInfo | null = localStorage.getItem('user_base_info') ? JSON.parse(localStorage.getItem('user_base_info')!) : null;

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

    setUserBaseInfo(info: BaseUserInfo | null) {
        this.userBaseInfo = info;
        localStorage.setItem('user_base_info', JSON.stringify(info));
    }

    clearToken() {
        this.accessToken = null;
        this.userBaseInfo = null;
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_base_info');
    }
}