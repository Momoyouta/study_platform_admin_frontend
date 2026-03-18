import { Popover, Button, Avatar } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './index.less';
import { RoleMap } from '../../type/map';
import { observer } from 'mobx-react-lite';
import Store from '@/store';

const TopBar = observer(() => {
    const { UserStore } = Store;
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const profileContent = (
        <div className="topbar-profile-popover">
            <div className="topbar-profile-info">
                <Avatar size={40} icon={<UserOutlined />} />
                <div className="topbar-profile-detail">
                    <div className="topbar-profile-name">{UserStore.userBaseInfo?.userName}</div>
                    <div className="topbar-profile-role">{RoleMap[UserStore.userBaseInfo?.userRoles?.[0]]}</div>
                </div>
            </div>
            <div className="topbar-profile-divider" />
            <Button
                type="text"
                icon={<LogoutOutlined />}
                className="topbar-logout-btn"
                onClick={handleLogout}
                block
            >
                退出登录
            </Button>
        </div>
    );

    return (
        <div className="topbar-container">
            <div className="topbar-spacer" />
            <div className="topbar-right">
                <Popover
                    content={profileContent}
                    trigger="hover"
                    placement="bottomRight"
                    arrow={false}
                >
                    <div className="topbar-profile-trigger">
                        <Avatar
                            size={32}
                            icon={<UserOutlined />}
                            className="topbar-avatar"
                        />
                    </div>
                </Popover>
            </div>
        </div>
    );
});

export default TopBar;
