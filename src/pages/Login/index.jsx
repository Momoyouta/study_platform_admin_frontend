import { observer } from 'mobx-react-lite'
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import Store from "@/store/index.ts";
import { post } from "@/http/http.js";
import styles from './login.module.less';

const Login = observer(() => {
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const onFinish = async (values) => {
        try {
            const res = await post('/auth/login', {
                account: values.username,
                pwd: values.password
            });
            
            // 假设接口返回数据包含 access_token
            if (res && res.data?.token) {
                Store.UserStore.setToken(res.data.token);
                // 如果有用户信息也可以在此设置
                // Store.UserStore.setUserInfo(res.user);
                
                message.success('登录成功');
                navigate('/');
            } else {
                message.error('登录失败：' + res.msg);
            }
        } catch (error) {
            console.error('Login failed:', error);
            // 错误处理已在 http.js 响应拦截器中通过 message.error 提示
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.leftPart}>
                    <h2>学习平台</h2>
                    <p>管理后台系统</p>
                </div>
                <div className={styles.rightPart}>
                    <h1>登录</h1>
                    <Form
                        form={form}
                        name="login"
                        className={styles.loginForm}
                        initialValues={{ remember: true }}
                        requiredMark={false}
                        onFinish={onFinish}
                        layout="vertical"
                    >
                        <Form.Item
                            name="username"
                            label="用户名"
                            rules={[{ required: true, message: '请输入用户名' }]}
                        >
                            <Input size="large" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label="密码"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password size="large" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large">
                                登 录
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    )
})

export default Login
