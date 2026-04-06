import { Form, Input, InputNumber, Modal, Select, TreeSelect } from 'antd';
import type { FormInstance } from 'antd';
import type { MenuFormValues, MenuRecord, MenuTreeOption } from '../../types';

type MenuModalProps = {
  form: FormInstance<MenuFormValues>;
  editingRecord: MenuRecord | null;
  menuTreeOptions: MenuTreeOption[];
  modalOpen: boolean;
  submitting: boolean;
  onOk: () => void;
  onCancel: () => void;
};

const statusOptions = [
  { label: '启用', value: '启用' },
  { label: '禁用', value: '禁用' },
];

export function MenuModal({
  form,
  editingRecord,
  menuTreeOptions,
  modalOpen,
  submitting,
  onOk,
  onCancel,
}: MenuModalProps) {
  return (
    <Modal
      title={editingRecord ? '编辑菜单' : '新增菜单'}
      open={modalOpen}
      forceRender
      confirmLoading={submitting}
      destroyOnHidden
      onOk={onOk}
      onCancel={onCancel}
    >
      <Form<MenuFormValues> form={form} layout="vertical">
        <Form.Item label="父级菜单" name="parentId">
          <TreeSelect
            allowClear
            treeDefaultExpandAll
            placeholder="不选择则为顶级菜单"
            treeData={menuTreeOptions}
            fieldNames={{ label: 'title', value: 'value', children: 'children' }}
          />
        </Form.Item>

        <Form.Item label="菜单名称" name="menuName" rules={[{ required: true, message: '请输入菜单名称' }]}>
          <Input placeholder="请输入菜单名称" />
        </Form.Item>

        <Form.Item label="菜单编码" name="menuCode" rules={[{ required: true, message: '请输入菜单编码' }]}>
          <Input placeholder="请输入菜单编码，例如 menus" />
        </Form.Item>

        <Form.Item label="路由路径" name="path">
          <Input placeholder="请输入路由路径，例如 /menus" />
        </Form.Item>

        <Form.Item label="组件路径" name="component">
          <Input placeholder="请输入组件路径，例如 views/MenusPage" />
        </Form.Item>

        <Form.Item label="图标" name="icon">
          <Input placeholder="请输入图标名称，例如 MenuOutlined" />
        </Form.Item>

        <Form.Item label="排序" name="sortOrder">
          <InputNumber style={{ width: '100%' }} placeholder="请输入排序值" />
        </Form.Item>

        <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
          <Select options={statusOptions} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
