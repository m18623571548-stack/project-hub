import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Upload, message, Modal, Form, Input, Space } from 'antd'
import { UploadOutlined, FileOutlined, CodeOutlined } from '@ant-design/icons'
import { getModules, getModuleFiles } from '../utils/api'
import type { Module } from '../utils/api'

const { TextArea } = Input

const Modules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([])
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadModal, setUploadModal] = useState(false)
  const [fileModal, setFileModal] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getModules().then(m => {
      setModules(m)
      setLoading(false)
    })
  }, [])

  const handleViewFiles = async (module: Module) => {
    setSelectedModule(module)
    setLoading(true)
    try {
      const f = await getModuleFiles(module.id)
      setFiles(f)
      setFileModal(true)
    } catch (err) {
      message.error('获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { title: '模块名称', dataIndex: 'name', key: 'name', render: (v: string) => (
      <Space>
        <CodeOutlined />
        <span>{v}</span>
      </Space>
    )},
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '文件数', dataIndex: 'file_count', key: 'file_count', render: (v: number) => (
      <Tag color={v > 0 ? 'blue' : 'default'}>{v}</Tag>
    )},
    { title: '负责人', dataIndex: 'owner', key: 'owner' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: string) => (
      <Tag color={v === 'active' ? 'success' : 'default'}>{v === 'active' ? '运行中' : '未配置'}</Tag>
    )},
    { title: '最后更新', dataIndex: 'last_updated', key: 'last_updated' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Module) => (
        <Space>
          <Button size="small" onClick={() => handleViewFiles(record)}>查看文件</Button>
          <Button size="small" type="primary" icon={<UploadOutlined />} onClick={() => {
            setSelectedModule(record)
            setUploadModal(true)
          }}>上传</Button>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>模块管理</h2>

      <Card>
        <Table
          dataSource={modules}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>

      <Modal
        title={`${selectedModule?.name} - 文件列表`}
        open={fileModal}
        onCancel={() => setFileModal(false)}
        footer={null}
        width={600}
      >
        {files.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#8c8c8c', padding: 40 }}>暂无文件</p>
        ) : (
          <ul>
            {files.map(f => (
              <li key={f} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <FileOutlined /> {f}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal
        title={`上传代码到 ${selectedModule?.name}`}
        open={uploadModal}
        onCancel={() => setUploadModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setUploadModal(false)}>取消</Button>,
          <Button key="submit" type="primary">确认上传</Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="file" label="选择文件">
            <Upload.Dragger
              name="file"
              multiple
              action={`/api/modules/${selectedModule?.id}/upload`}
              onChange={(info) => {
                if (info.file.status === 'done') {
                  message.success(`${info.file.name} 上传成功`)
                }
              }}
            >
              <p><UploadOutlined style={{ fontSize: 32 }} /></p>
              <p>点击或拖拽文件到此处上传</p>
            </Upload.Dragger>
          </Form.Item>
          <Form.Item name="description" label="更新说明">
            <TextArea rows={3} placeholder="描述本次更新内容..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default Modules
