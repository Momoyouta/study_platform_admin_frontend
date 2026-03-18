import { observer } from 'mobx-react-lite';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar/index.jsx';
import TopBar from '@/components/TopBar/index.jsx';
import './index.less';

const { Sider, Header, Content } = Layout;

const Home = observer(() => {
    return (
        <Layout className="home-layout">
            <Sider
                width={160}
                className="home-sider"
            >
                <Sidebar />
            </Sider>
            <Layout className="home-main">
                <Header className="home-header">
                    <TopBar />
                </Header>
                <Content className="home-content">
                    <div className="home-content-inner">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
});

export default Home;
