import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router/index.jsx'
import './index.css'
import { post } from './http/http.js'
import './theme/variables.less'
import { jwtAuth } from './http/api.js'
// 移除 message 提示，统一由拦截器处理
console.error('登录已过期，请重新登录');
const init = async () => {
    const token = localStorage.getItem('access_token');
    const isLoginPage = window.location.pathname === '/login';

    if (!token) {
        // 无 token 且不在登录页，重定向到登录页
        if (!isLoginPage) {
            window.location.href = '/login';
            return;
        }
    } else {
        try {
            // 有 token，向后端校验
            await jwtAuth(token);
            // 校验成功：如果在登录页则跳转到首页
            if (isLoginPage) {
                window.location.href = '/';
                return;
            }
        } catch (error) {
            // 校验失败：清除 token
            console.error('登录已过期，请重新登录');
            localStorage.removeItem('access_token');
            // 如果不在登录页则跳转到登录页
            if (!isLoginPage) {
                window.location.href = '/login';
                return;
            }
        }
    }

    // 校验完成后（或无需跳转时）再渲染页面
    createRoot(document.getElementById('root')).render(
        <StrictMode>
            <RouterProvider router={router} />
        </StrictMode>,
    )
}

init();
