import React, { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Upload, message } from 'antd'
import { UploadOutlined, FileExcelOutlined, FileTextOutlined, FileZipOutlined } from '@ant-design/icons'

interface DataFile {
  id: string
  name: string
  module: string
  size: string
  type: string
  uploaded_by: string
  uploaded_at: string
  status: string
}

const DataFiles: React.FC = () => {
  const [files, setFiles] = useState<DataFile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟数据
    setFiles([
      { id: '1', name: '组合持仓_20240115.csv', module: '数据看板', size: '2.3MB', type: 'csv', uploaded_by: '张三', uploaded_at: '2024-01-15 09:30', status: 'processed' },
      { id: '2', name: '风控指标_20240115.xlsx', module: '风控数据', size: '1.8MB', type: 'excel', uploaded_by: '李四', uploaded_at: '2024-01-15 10:15', status: 'processed' },
      { id: '3', name: '底层参数_v2.json', module: '底层参数', size: '156KB', type: 'json', uploaded_by: '王五', uploaded_at: '2024-01-14 16:45', status: 'processing' },
      { id: '4', name: '净值数据_202401.zip', module: 'FOF数据', size: '5.2MB', type: 'zip', uploaded_by: '赵六', uploaded_at: '2024-01-15 08:00', status: 'pending' },
    ])
    setLoading(false)
  }, [])

  const getFileIcon = (type: string) => {
    if (type === 'excel') return <FileExcelOutlined style={{ color: '#52c41a' }} />
    if (type === 'zip') return <FileZipOutlined style={{ color: '#faad14' }} />
    return <FileTextOutlined style={{ color: '#1890ff' }} />
  }

  const columns = [
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
      render: (v: string, r: DataFile) => (
        <span>{getFileIcon(r.type)} {v}</span>
      ),
    },
    { title: '所属模块', dataIndex: 'module', key: 'module', render: (v: string) => <Tag>{v}</Tag> },
    { title: '大小', dataIndex: 'size', key: 'size' },
    { title: '上传人', dataIndex: 'uploaded_by', key: 'uploaded_by' },
    { title: '上传时间', dataIndex: 'uploaded_at', key: 'uploaded_at' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v: string) => {
        const config: Record<string, { color: string; text: string }> = {
          processed: { color: 'success', text: '已处理' },
          processing: { color: 'processing', text: '处理中' },
          pending: { color: 'warning', text: '待处理' },
        }
        const c = config[v] || config.pending
        return <Tag color={c.color}>{c.text}</Tag>
      },
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button size="small">下载</Button>
      ),
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>数据文件</h2>
        <Upload
          multiple
          showUploadList={false}
          beforeUpload={() => {
            message.info('上传功能需要后端支持')
            return false
          }}
        >
          <Button type="primary" icon={<UploadOutlined />}>上传文件</Button>
        </Upload>
      </div>

      <Card>
        <Upload.Dragger
          style={{ marginBottom: 24 }}
          beforeUpload={() => {
            message.info('拖拽上传功能需要后端支持')
            return false
          }}
        >
          <p><UploadOutlined style={{ fontSize: 32 }} /></p>
          <p>点击或拖拽文件到此处上传</p>
          <p style={{ color: '#8c8c8c' }}>支持 CSV, Excel, JSON, ZIP 格式</p>
        </Upload.Dragger>

        <Table
          dataSource={files}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default DataFiles
