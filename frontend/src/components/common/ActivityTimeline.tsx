import { Card, Checkbox, Empty, Space, Tag, Timeline as AntTimeline, Typography } from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { useEffect, useMemo, useState } from 'react';
import { auditLogApi } from '../../api/auditLog';
import { AuditCategory, AuditLog, auditCategoryColor, auditCategoryLabel } from '../../types';

const { Text, Paragraph } = Typography;

const ALL_CATEGORIES = Object.values(AuditCategory);

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

interface ActivityTimelineProps {
  projectId?: string;
}

export function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<AuditCategory[]>([...ALL_CATEGORIES]);

  const fetchLogs = async (categories: AuditCategory[]) => {
    setLoading(true);
    try {
      const data = projectId
        ? await auditLogApi.listByProject(projectId, categories)
        : await auditLogApi.list(categories);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs(selectedCategories);
  }, [projectId, selectedCategories]);

  const handleCategoryChange = (category: AuditCategory) => (e: CheckboxChangeEvent) => {
    const checked = e.target.checked;
    setSelectedCategories((prev) =>
      checked ? [...prev, category] : prev.filter((c) => c !== category)
    );
  };

  const handleSelectAll = (e: CheckboxChangeEvent) => {
    setSelectedCategories(e.target.checked ? [...ALL_CATEGORIES] : []);
  };

  const isAllSelected = selectedCategories.length === ALL_CATEGORIES.length;
  const isIndeterminate = selectedCategories.length > 0 && selectedCategories.length < ALL_CATEGORIES.length;

  const groupedByDate = useMemo(() => {
    const groups: Record<string, AuditLog[]> = {};
    logs.forEach((log) => {
      const date = new Date(log.createdAt).toISOString().slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [logs]);

  const formatDateLabel = (dateStr: string) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    const label = `${d.getMonth() + 1}月${d.getDate()}日`;
    if (dateStr === today.toISOString().slice(0, 10)) return `今天 · ${label}`;
    if (dateStr === yesterday.toISOString().slice(0, 10)) return `昨天 · ${label}`;
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekdays[d.getDay()]} · ${label}`;
  };

  const renderTimelineItems = (items: AuditLog[]) =>
    items.map((log) => ({
      color: auditCategoryColor[log.category],
      children: (
        <div style={{ paddingBottom: 8 }}>
          <Space size={8} wrap>
            <Tag color={auditCategoryColor[log.category]} style={{ margin: 0 }}>
              {auditCategoryLabel[log.category]}
            </Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatDateTime(log.createdAt)}
            </Text>
          </Space>
          <Paragraph
            style={{ margin: '8px 0 4px', fontSize: 14, lineHeight: 1.5 }}
            ellipsis={{ rows: 2, expandable: true, symbol: '展开' }}
          >
            {log.details || log.action}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: 12 }}>操作人：{log.userName || log.userId}</Text>
        </div>
      )
    }));

  return (
    <Card
      title={
        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
          <span>项目操作时间线</span>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 'normal' }}>
            共 {logs.length} 条记录
          </span>
        </Space>
      }
      extra={
        <Space size={[8, 8]} wrap>
          <Checkbox
            checked={isAllSelected}
            indeterminate={isIndeterminate}
            onChange={handleSelectAll}
          >
            全部
          </Checkbox>
          {ALL_CATEGORIES.map((cat) => (
            <Checkbox
              key={cat}
              checked={selectedCategories.includes(cat)}
              onChange={handleCategoryChange(cat)}
            >
              <Tag color={auditCategoryColor[cat]} style={{ margin: 0 }}>
                {auditCategoryLabel[cat]}
              </Tag>
            </Checkbox>
          ))}
        </Space>
      }
      style={{ marginTop: 20 }}
      loading={loading}
    >
      {logs.length === 0 ? (
        <Empty description="暂无操作记录" />
      ) : (
        <div>
          {groupedByDate.map(([date, items]) => (
          <div key={date} style={{ marginBottom: 24 }}>
            <div
              style={{
                position: 'sticky',
                top: 0,
                background: '#fafafa',
                padding: '8px 0',
                marginBottom: 8,
                fontWeight: 600,
                fontSize: 13,
                color: '#555',
                borderBottom: '1px solid #eee',
                zIndex: 1
              }}
            >
              {formatDateLabel(date)}
            </div>
            <AntTimeline items={renderTimelineItems(items)} />
          </div>
        ))}
        </div>
      )}
    </Card>
  );
}
