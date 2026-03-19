import http from "./http.js";

export const login = (account: string, pwd: string) => {
    return http.post('/auth/admin/login', {
        account,
        pwd
    });
}

export const register = (data: any) => {
    return http.post('/auth/admin/register', data);
}

export const jwtAuth = (accessToken: string) => {
    return http.post('/auth/admin/jwtAuth', {
        accessToken
    });
}
