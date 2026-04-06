import type { ActionType } from '@ant-design/pro-components';
import { App, Form } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { createMenu, deleteMenu, fetchMenuTree, updateMenu, updateMenuStatus } from '../../api/menus';
import { MenuModal } from './components/MenuModal';
import { MenusTable } from './components/MenusTable';
import type { MenuFormValues, MenuRecord, MenuTreeOption, StatusTabKey } from './types';
import { toMenuTreeOptions } from './utils';
import './index.less';

export function MenusPage() {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>(null);
  const [form] = Form.useForm<MenuFormValues>();
  const [activeTab, setActiveTab] = useState<StatusTabKey>('all');
  const [selectedRows, setSelectedRows] = useState<MenuRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MenuRecord | null>(null);
  const [menuTreeOptions, setMenuTreeOptions] = useState<MenuTreeOption[]>([]);
  const [summary, setSummary] = useState<Record<StatusTabKey, number>>({
    all: 0,
    启用: 0,
    禁用: 0,
  });

  const loadMenuTree = async (editingId?: number) => {
    const tree = await fetchMenuTree();
    setMenuTreeOptions(toMenuTreeOptions(tree, editingId));
  };

  useEffect(() => {
    void loadMenuTree();
  }, []);

  const openCreateModal = async () => {
    try {
      setEditingRecord(null);
      await loadMenuTree();
      form.resetFields();
      form.setFieldsValue({
        sortOrder: 0,
        status: '启用',
      });
      setModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取菜单树失败');
    }
  };

  const openEditModal = async (record: MenuRecord) => {
    try {
      setEditingRecord(record);
      await loadMenuTree(record.id);
      form.setFieldsValue({
        parentId: record.parentId > 0 ? record.parentId : undefined,
        menuName: record.name,
        menuCode: record.code,
        path: record.path === '-' ? '' : record.path,
        component: record.component === '-' ? '' : record.component,
        icon: record.icon === '-' ? '' : record.icon,
        sortOrder: record.sortOrder,
        status: record.status,
      });
      setModalOpen(true);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取菜单树失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        parentId: values.parentId ?? 0,
        menuName: values.menuName.trim(),
        menuCode: values.menuCode.trim(),
        path: values.path?.trim() || null,
        component: values.component?.trim() || null,
        icon: values.icon?.trim() || null,
        sortOrder: values.sortOrder ?? 0,
        status: values.status === '启用' ? 1 : 0,
      };

      if (editingRecord) {
        await updateMenu(editingRecord.id, payload);
        message.success(`已更新菜单 ${values.menuName}`);
      } else {
        await createMenu(payload);
        message.success(`已新增菜单 ${values.menuName}`);
      }

      setModalOpen(false);
      setEditingRecord(null);
      form.resetFields();
      await loadMenuTree();
      void actionRef.current?.reload();
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (record: MenuRecord) => {
    try {
      await deleteMenu(record.id);
      message.success(`已删除菜单 ${record.name}`);
      setSelectedRows((rows) => rows.filter((row) => row.id !== record.id));
      await loadMenuTree();
      void actionRef.current?.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '删除菜单失败');
    }
  };

  const handleStatusChange = async (record: MenuRecord, checked: boolean) => {
    try {
      await updateMenuStatus(record.id, checked ? 1 : 0);
      message.success(`已${checked ? '启用' : '禁用'}菜单 ${record.name}`);
      void actionRef.current?.reload();
    } catch (error) {
      message.error(error instanceof Error ? error.message : '更新菜单状态失败');
    }
  };

  return (
    <div className="page-root">
      <MenusTable
        actionRef={actionRef}
        activeTab={activeTab}
        summary={summary}
        selectedRows={selectedRows}
        setActiveTab={setActiveTab}
        setSelectedRows={setSelectedRows}
        setSummary={setSummary}
        onCreate={() => {
          void openCreateModal();
        }}
        onEdit={(record) => {
          void openEditModal(record);
        }}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />

      <MenuModal
        form={form}
        editingRecord={editingRecord}
        menuTreeOptions={menuTreeOptions}
        modalOpen={modalOpen}
        submitting={submitting}
        onOk={() => {
          void handleSubmit();
        }}
        onCancel={() => {
          setModalOpen(false);
          setEditingRecord(null);
          form.resetFields();
        }}
      />
    </div>
  );
}
