import { Form, Input, Modal, Select, Tree, Typography } from 'antd';
import type { FormInstance } from 'antd';
import type { DataNode } from 'antd/es/tree';
import type {
  MenuFormValues,
  RoleFormValues,
  RoleRecord,
} from '../../types';

type RoleModalsProps = {
  roleForm: FormInstance<RoleFormValues>;
  menuForm: FormInstance<MenuFormValues>;
  currentRole: RoleRecord | null;
  editingRole: RoleRecord | null;
  menuTreeData: DataNode[];
  roleModalOpen: boolean;
  menuModalOpen: boolean;
  roleSubmitting: boolean;
  menuSubmitting: boolean;
  onRoleOk: () => void;
  onMenuOk: () => void;
  onRoleCancel: () => void;
  onMenuCancel: () => void;
};

const statusOptions = [
  { label: '启用', value: '启用' },
  { label: '禁用', value: '禁用' },
];

export function RoleModals({
  roleForm,
  menuForm,
  currentRole,
  editingRole,
  menuTreeData,
  roleModalOpen,
  menuModalOpen,
  roleSubmitting,
  menuSubmitting,
  onRoleOk,
  onMenuOk,
  onRoleCancel,
  onMenuCancel,
}: RoleModalsProps) {
  return (
    <>
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={roleModalOpen}
        forceRender
        confirmLoading={roleSubmitting}
        okText="确定"
        cancelText="取消"
        onOk={onRoleOk}
        onCancel={onRoleCancel}
      >
        <Form<RoleFormValues> form={roleForm} layout="vertical">
          <Form.Item
            label="角色名称"
            name="roleName"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            label="角色编码"
            name="roleCode"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码，例如 OPERATOR" />
          </Form.Item>

          <Form.Item label="角色说明" name="description">
            <Input.TextArea placeholder="请输入角色说明" rows={4} />
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={currentRole ? `菜单配置 - ${currentRole.name}` : '菜单配置'}
        open={menuModalOpen}
        forceRender
        confirmLoading={menuSubmitting}
        width={640}
        okText="确定"
        cancelText="取消"
        onOk={onMenuOk}
        onCancel={onMenuCancel}
      >
        <Form<MenuFormValues> form={menuForm} layout="vertical">
          <Typography.Paragraph type="secondary">
            勾选后，该角色登录账号的左侧导航只展示这些菜单页面；父级分组会随子菜单一并保留。
          </Typography.Paragraph>
          <Form.Item label="可打开的菜单页面">
            <Form.Item noStyle shouldUpdate>
              {() => (
                <Tree
                  checkable
                  defaultExpandAll
                  treeData={menuTreeData}
                  checkedKeys={menuForm.getFieldValue('menuIds') ?? []}
                  onCheck={(checkedKeys) => {
                    const nextKeys = Array.isArray(checkedKeys) ? checkedKeys : checkedKeys.checked;
                    menuForm.setFieldValue(
                      'menuIds',
                      nextKeys.map((key) => Number(key)).filter((key) => Number.isInteger(key)),
                    );
                  }}
                />
              )}
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
