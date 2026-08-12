import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, Progress, Space, message } from 'antd'
import { PlusOutlined, CheckCircleOutlined, PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons'
import { getTasks } from '../utils/api'
import type { Task } from '../utils/api'

const { TextArea } = Input

const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getTasks().then(t => {
      setTasks(t)
      setLoading(false)
    })
  }, [])

  const handleCreate = (values: any) => {
    const newTask: Task = {
      id: `task_${Date.now()}`,
      ...values,
      progress: 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setTasks([...tasks, newTask])
    setModalVisible(false)
    form.resetFields()
    message.success('任务创建成功')
  }

  const columns = [
    { title: '任务标题', dataIndex: 'title', key: 'title' },
    { title: '模块', dataIndex: 'module', key: 'module', render: (v: string) => <Tag>{v}</Tag> },
    { title: '负责人', dataIndex: 'assignee', key: 'assignee' },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (v: string) => {
        const color = v === 'high' ? 'red' : v === 'medium' ? 'orange' : 'green'
        const text = v === 'high' ? '高' : v === 'medium' ? '中' : '低'
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (v: number) => <Progress percent={v} size="small" status={v === 100 ? 'success' : 'active'} />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const config: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
          pending: { color: 'warning', text: '待处理', icon: <PauseCircleOutlined /> },
          in_progress: { color: 'processing', text: '处理中', icon: <PlayCircleOutlined /> },
          completed: { color: 'success', text: '已完成', icon: <CheckCircleOutlined /> },
        }
        const c = config[v] || config.pending
        return <Tag color={c.color} icon={c.icon}>{c.text}</Tag>
      },
    },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', render: (v: string) => v.slice(0, 10) },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Task) => (
        <Space>
          {record.status === 'pending' && (
            <Button size="small" type="primary" onClick={() => {
              const updated = tasks.map(t => t.id === record.id ? { ...t, status: 'in_progress' as const, progress: 10 } : t)
              setTasks(updated)
              message.success('任务已开始')
            }}>开始</Button>
          )}
          {record.status === 'in_progress' && (
            <Button size="small" onClick={() => {
              const updated = tasks.map(t => t.id === record.id ? { ...t, progress: Math.min(t.progress + 20, 100), status: t.progress + 20 >= 100 ? 'completed' as const : 'in_progress' as const } : t)
              setTasks(updated)
              message.success('进度已更新')
            }}>更新进度</Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>任务协作</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          新建任务
        </Button>
      </div>

      <Card>
        <Table
          dataSource={tasks}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="新建任务"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="任务标题" rules={[{ required: true }]}>
            <Input placeholder="输入任务标题" />
          </Form.Item>
          <Form.Item name="module" label="所属模块" rules={[{ required: true }]}>
            <Select placeholder="选择模块">
              <Select.Option value="dashboard">数据看板</Select.Option>
              <Select.Option value="risk">风控数据</Select.Option>
              <Select.Option value="underlying">底层参数</Select.Option>
              <Select.Option value="performance">绩效分析</Select.Option>
              <Select.Option value="fof">FOF数据</Select.Option>
              <Select.Option value="bond">券源数据</Select.Option>
              <Select.Option value="user">用户管理</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="assignee" label="负责人" rules={[{ required: true }]}>
            <Input placeholder="输入负责人姓名" />
          </Form.Item>
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]} initialValue="medium">
            <Select>
              <Select.Option value="high">高</Select.Option>
              <Select.Option value="medium">中</Select.Option>
              <Select.Option value="low">低</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="任务描述">
            <TextArea rows={4} placeholder="描述任务详情..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Tasks
