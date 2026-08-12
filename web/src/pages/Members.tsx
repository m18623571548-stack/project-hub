import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Modal, Form, Input, Select, Space, message, Avatar } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { getUsers } from '../utils/api'
import type { User } from '../utils/api'

const Members: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getUsers().then(u => {
      setUsers(u)
      setLoading(false)
    })
  }, [])

  const handleCreate = (values: any) => {
    const newUser: User = {
      id: `user_${Date.now()}`,
      ...values,
      status: 'active',
      last_active: new Date().toISOString(),
    }
    setUsers([...users, newUser])
    setModalVisible(false)
    form.resetFields()
    message.success('成员添加成功')
  }

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id))
    message.success('成员已移除')
  }

  const columns = [
    {
      title: '成员',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r: User) => (
        <Space>
          <Avatar style={{ background: r.status === 'active' ? '#1890ff' : '#8c8c8c' }}>{v[0]}</Avatar>
          <span>{v}</span>
        </Space>
      ),
    },
    { title: '角色', dataIndex: 'role', key: 'role', render: (v: string) => <Tag color="blue">{v}</Tag> },
    { title: '部门', dataIndex: 'department', key: 'department' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => (
        <Tag color={v === 'active' ? 'success' : 'default'}>{v === 'active' ? '在线' : '离线'}</Tag>
      ),
    },
    { title: '最后活跃', dataIndex: 'last_active', key: 'last_active', render: (v: string) => v.slice(0, 10) },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>移除</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>成员管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
          添加成员
        </Button>
      </div>

      <Card>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="添加成员"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
            <Input placeholder="输入成员姓名" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true }]} initialValue="developer">
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="developer">开发工程师</Select.Option>
              <Select.Option value="analyst">数据分析师</Select.Option>
              <Select.Option value="viewer">只读用户</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="department" label="部门" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="量化投资部">量化投资部</Select.Option>
              <Select.Option value="风险管理部">风险管理部</Select.Option>
              <Select.Option value="IT技术部">IT技术部</Select.Option>
              <Select.Option value="产品运营部">产品运营部</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Members
