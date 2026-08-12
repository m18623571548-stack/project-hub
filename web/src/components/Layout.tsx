import React, { useState } from 'react'
import {
  Layout as AntLayout,
  Menu,
  Badge,
  Avatar,
  Dropdown,
  Space,
  Tag,
} from 'antd'
import {
  DashboardOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  TeamOutlined,
  HistoryOutlined,
  DatabaseOutlined,
  BellOutlined,
  UserOutlined,
  DownOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'

const { Sider, Header, Content } = AntLayout

interface LayoutProps {
  children: React.ReactNode
}

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '项目概览' },
  { key: '/modules', icon: <AppstoreOutlined />, label: '模块管理' },
  { key: '/tasks', icon: <FileTextOutlined />, label: '任务协作' },
  { key: '/datafiles', icon: <DatabaseOutlined />, label: '数据文件' },
  { key: '/members', icon: <TeamOutlined />, label: '成员管理' },
  { key: '/activities', icon: <HistoryOutlined />, label: '活动日志' },
]

const LayoutComponent: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人资料' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ]

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={240}
        style={{
          background: '#001529',
          boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
        }}
      >
        <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: collapsed ? 14 : 18, fontWeight: 600 }}>
            {collapsed ? 'DMS' : '数据管理系统'}
          </h2>
          {!collapsed && (
            <p style={{ color: 'rgba(255,255,255,0.45)', margin: '4px 0 0', fontSize: 12 }}>
              项目协作空间
            </p>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ background: '#001529', borderRight: 0 }}
        />
      </Sider>

      <AntLayout>
        <Header
          style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Tag color="blue">数据同步: 实时</Tag>
            <Tag color="green">系统状态: 正常</Tag>
          </div>

          <Space size={24}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#595959', cursor: 'pointer' }} />
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} style={{ background: '#1890ff' }} />
                <span style={{ color: '#262626' }}>管理员</span>
                <DownOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default LayoutComponent
