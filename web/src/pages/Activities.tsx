import React, { useEffect, useState } from 'react'
import { Card, Timeline, Tag, Spin, Avatar } from 'antd'
import {
  FileAddOutlined,
  EditOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  UserAddOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons'
import { getActivities } from '../utils/api'
import type { Activity } from '../utils/api'

const Activities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getActivities().then(a => {
      setActivities(a)
      setLoading(false)
    })
  }, [])

  const getIcon = (action: string) => {
    if (action.includes('上传')) return <UploadOutlined />
    if (action.includes('创建') || action.includes('添加')) return <FileAddOutlined />
    if (action.includes('更新') || action.includes('编辑')) return <EditOutlined />
    if (action.includes('完成')) return <CheckCircleOutlined />
    if (action.includes('删除')) return <DeleteOutlined />
    if (action.includes('邀请')) return <UserAddOutlined />
    return <ExclamationCircleOutlined />
  }

  const getColor = (action: string) => {
    if (action.includes('上传')) return 'blue'
    if (action.includes('创建') || action.includes('添加')) return 'green'
    if (action.includes('更新')) return 'orange'
    if (action.includes('完成')) return 'green'
    if (action.includes('删除')) return 'red'
    return 'gray'
  }

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>活动日志</h2>

      <Card>
        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '100px auto' }} />
        ) : (
          <Timeline mode="left">
            {activities.map(item => (
              <Timeline.Item
                key={item.id}
                dot={
                  <Avatar
                    size="small"
                    style={{ background: getColor(item.action) === 'blue' ? '#1890ff' : getColor(item.action) === 'green' ? '#52c41a' : getColor(item.action) === 'red' ? '#f5222d' : '#8c8c8c' }}
                  >
                    {getIcon(item.action)}
                  </Avatar>
                }
                label={item.time}
              >
                <Card size="small" style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontWeight: 500 }}>{item.user}</span>
                      <span style={{ margin: '0 8px', color: '#8c8c8c' }}>{item.action}</span>
                      <Tag>{item.module}</Tag>
                    </div>
                  </div>
                  <p style={{ margin: '8px 0 0', color: '#595959', fontSize: 14 }}>{item.detail}</p>
                </Card>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </Card>
    </div>
  )
}

export default Activities
