import { useState } from 'react';
import { Menu, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import menuConfig from '@/config/menuConfig.jsx';
import './index.less';

/**
 * 将 menuConfig 转换为 antd Menu 的 items 格式
 */
const buildMenuItems = (config) => {
    return config.map((item) => {
        const menuItem = {
            key: item.key,
            icon: item.icon,
            label: item.label,
        };
        if (item.children && item.children.length > 0) {
            menuItem.children = item.children.map((child) => ({
                key: child.key,
                label: child.label,
            }));
        }
        return menuItem;
    });
};

/**
 * 将 menuConfig 扁平化为 key -> path 映射
 */
const buildPathMap = (config) => {
    const map = {};
    config.forEach((item) => {
        if (item.path) {
            map[item.key] = item.path;
        }
        if (item.children) {
            item.children.forEach((child) => {
                if (child.path) {
                    map[child.key] = child.path;
                }
            });
        }
    });
    return map;
};

/**
 * 根据当前路径找到对应的 menu key
 */
const findSelectedKey = (pathname, config) => {
    for (const item of config) {
        if (item.path === pathname) return [item.key];
        if (item.children) {
            for (const child of item.children) {
                if (child.path === pathname) return [child.key];
            }
        }
    }
    return [];
};

/**
 * 根据当前路径找到需要展开的 SubMenu key
 */
const findOpenKeys = (pathname, config) => {
    for (const item of config) {
        if (item.children) {
            for (const child of item.children) {
                if (child.path === pathname) return [item.key];
            }
        }
    }
    return [];
};

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchValue, setSearchValue] = useState('');

    const pathMap = buildPathMap(menuConfig);
    const allItems = buildMenuItems(menuConfig);

    // 搜索过滤菜单
    const filteredItems = searchValue
        ? allItems
              .map((item) => {
                  if (item.children) {
                      const filteredChildren = item.children.filter((child) =>
                          child.label.toLowerCase().includes(searchValue.toLowerCase())
                      );
                      if (filteredChildren.length > 0) {
                          return { ...item, children: filteredChildren };
                      }
                      if (item.label.toLowerCase().includes(searchValue.toLowerCase())) {
                          return item;
                      }
                      return null;
                  }
                  if (item.label.toLowerCase().includes(searchValue.toLowerCase())) {
                      return item;
                  }
                  return null;
              })
              .filter(Boolean)
        : allItems;

    const handleMenuClick = ({ key }) => {
        const path = pathMap[key];
        if (path) {
            navigate(path);
        }
    };

    const selectedKeys = findSelectedKey(location.pathname, menuConfig);
    const defaultOpenKeys = findOpenKeys(location.pathname, menuConfig);

    return (
        <div className="sidebar-container">
            <div className="sidebar-logo">
                <span className="sidebar-logo-text">在线学习平台</span>
                <span className="sidebar-logo-text">后台管理系统</span>
            </div>
            <div className="sidebar-search">
                <Input
                    placeholder="搜索菜单"
                    prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    allowClear
                    className="sidebar-search-input"
                />
            </div>
            <Menu
                mode="inline"
                theme="dark"
                selectedKeys={selectedKeys}
                defaultOpenKeys={defaultOpenKeys}
                items={filteredItems}
                onClick={handleMenuClick}
                className="sidebar-menu"
            />
        </div>
    );
};

export default Sidebar;
