import { Form, Input, Modal, Select } from 'antd';
import type { FormInstance } from 'antd';
import type {
  PermissionFormValues,
  PermissionOption,
  RoleFormValues,
  RoleRecord,
} from '../../types';

type RoleModalsProps = {
  roleForm: FormInstance<RoleFormValues>;
  permissionForm: FormInstance<PermissionFormValues>;
  currentRole: RoleRecord | null;
  editingRole: RoleRecord | null;
  permissionOptions: PermissionOption[];
  roleModalOpen: boolean;
  permissionModalOpen: boolean;
  roleSubmitting: boolean;
  permissionSubmitting: boolean;
  onRoleOk: () => void;
  onPermissionOk: () => void;
  onRoleCancel: () => void;
  onPermissionCancel: () => void;
};

const statusOptions = [
  { label: '启用', value: '启用' },
  { label: '禁用', value: '禁用' },
];

export function RoleModals({
  roleForm,
  permissionForm,
  currentRole,
  editingRole,
  permissionOptions,
  roleModalOpen,
  permissionModalOpen,
  roleSubmitting,
  permissionSubmitting,
  onRoleOk,
  onPermissionOk,
  onRoleCancel,
  onPermissionCancel,
}: RoleModalsProps) {
  return (
    <>
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={roleModalOpen}
        forceRender
        confirmLoading={roleSubmitting}
        destroyOnHidden
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
        title={currentRole ? `权限配置 - ${currentRole.name}` : '权限配置'}
        open={permissionModalOpen}
        confirmLoading={permissionSubmitting}
        destroyOnHidden
        onOk={onPermissionOk}
        onCancel={onPermissionCancel}
      >
        <Form<PermissionFormValues> form={permissionForm} layout="vertical">
          <Form.Item label="已选权限" name="permissionIds">
            <Select
              mode="multiple"
              placeholder="请选择权限"
              options={permissionOptions}
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
