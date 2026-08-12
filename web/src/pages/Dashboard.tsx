import React, { useEffect, useState } from 'react'
import { Card, Row, Col, Statistic, Table, Tag, Progress, List, Avatar, Spin } from 'antd'
import {
  AppstoreOutlined,
  FileOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { getStats, getModules, getTasks, getUsers, getActivities } from '../utils/api'
import type { Module, Task, User, Activity, ProjectStats } from '../utils/api'

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<ProjectStats | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, m, t, u, a] = await Promise.all([
          getStats(),
          getModules(),
          getTasks(),
          getUsers(),
          getActivities(),
        ])
        setStats(s)
        setModules(m)
        setTasks(t)
        setUsers(u)
        setActivities(a.slice(0, 5))
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const activeUsers = users.filter(u => u.status === 'active')

  const taskColumns = [
    { title: '任务', dataIndex: 'title', key: 'title' },
    { title: '模块', dataIndex: 'module', key: 'module' },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee' },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (v: number) => <Progress percent={v} size="small" />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const color = v === 'completed' ? 'success' : v === 'in_progress' ? 'processing' : 'warning'
        const text = v === 'completed' ? '已完成' : v === 'in_progress' ? '处理中' : '待处理'
        return <Tag color={color}>{text}</Tag>
      },
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>项目概览</h2>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="模块总数"
              value={stats?.total_modules || 0}
              prefix={<AppstoreOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="代码文件"
              value={stats?.total_files || 0}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={stats?.total_users || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待办任务"
              value={stats?.pending_tasks || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="模块状态" extra={<a href="#/modules">查看全部</a>}>
            <List
              dataSource={modules}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={item.description}
                  />
                  <div>
                    <Tag color={item.file_count > 0 ? 'success' : 'default'}>
                      {item.file_count} 文件
                    </Tag>
                    <span style={{ marginLeft: 8, color: '#8c8c8c', fontSize: 12 }}>
                      负责人: {item.owner}
                    </span>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="最近动态">
            <List
              dataSource={activities}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<ExclamationCircleOutlined />} />}
                    title={item.user}
                    description={
                      <span>
                        {item.action} <Tag>{item.module}</Tag>
                        <br />
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.detail}</span>
                      </span>
                    }
                  />
                  <span style={{ fontSize: 12, color: '#8c8c8c' }}>{item.time}</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="待办任务" extra={<a href="#/tasks">查看全部</a>}>
            <Table
              dataSource={pendingTasks}
              columns={taskColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card title="在线成员">
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 4, lg: 6 }}
              dataSource={activeUsers}
              renderItem={item => (
                <List.Item>
                  <Card size="small">
                    <List.Item.Meta
                      avatar={<Avatar style={{ background: '#1890ff' }}>{item.name[0]}</Avatar>}
                      title={item.name}
                      description={
                        <span>
                          <Tag>{item.department}</Tag>
                          <br />
                          <span style={{ fontSize: 12, color: '#52c41a' }}>● 在线</span>
                        </span>
                      }
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Dashboard
