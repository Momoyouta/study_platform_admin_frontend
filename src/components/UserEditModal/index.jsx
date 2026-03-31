import { useEffect, useMemo, useRef, useState } from 'react';
import { Form, Input, Modal, Select, Space } from 'antd';
import TempImageUpload from '@/components/TempImageUpload.tsx';

const { Option } = Select;

const pickFirstDefined = (record, keys) => {
    for (const key of keys) {
        const val = record?.[key];
        if (val !== undefined && val !== null) {
            return val;
        }
    }
    return undefined;
};

const UserEditModal = ({
    open,
    title = '编辑属性',
    record,
    onCancel,
    onSubmit,
    extraFields,
    phoneFieldKey = 'phone',
    avatarFieldKey = 'avatar',
    note,
}) => {
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);
    const [avatarPath, setAvatarPath] = useState('');
    const [initialAvatarPath, setInitialAvatarPath] = useState('');
    const initKeyRef = useRef('');
    const normalizedExtraFields = useMemo(() => extraFields || [], [extraFields]);

    useEffect(() => {
        if (!open) {
            initKeyRef.current = '';
            return;
        }

        const recordIdentity = record?.id || record?.userId || '__new__';
        const fieldsIdentity = normalizedExtraFields.map(field => `${field.name}:${field.label || ''}`).join('|');
        const currentInitKey = `${recordIdentity}|${phoneFieldKey}|${avatarFieldKey}|${fieldsIdentity}`;
        if (initKeyRef.current === currentInitKey) {
            return;
        }
        initKeyRef.current = currentInitKey;

        const initialValues = {
            name: pickFirstDefined(record, ['name', 'userName']) || '',
            sex: pickFirstDefined(record, ['sex']) ? 1 : 0,
            password: '',
            [phoneFieldKey]: pickFirstDefined(record, [phoneFieldKey, 'phone']) || '',
            [avatarFieldKey]: pickFirstDefined(record, [avatarFieldKey, 'avatar']) || '',
        };

        normalizedExtraFields.forEach(field => {
            initialValues[field.name] = pickFirstDefined(record, [field.name]) || '';
        });

        form.setFieldsValue(initialValues);
        const originalAvatarPath = initialValues[avatarFieldKey] || '';
        setInitialAvatarPath(originalAvatarPath);
        setAvatarPath('');
    }, [open, record, form, normalizedExtraFields, phoneFieldKey, avatarFieldKey]);

    const handleAvatarChange = (tempPath) => {
        const path = tempPath || '';
        setAvatarPath(path);
        form.setFieldValue(avatarFieldKey, path);
    };

    const handleOk = async () => {
        const values = await form.validateFields();
        const payload = {
            name: values.name,
            sex: values.sex === 1,
            [phoneFieldKey]: values[phoneFieldKey],
        };

        if (values.password) {
            payload.password = values.password;
        }
        console.log('avatarPath:', avatarPath, 'initialAvatarPath:', initialAvatarPath);
        if (values[avatarFieldKey] && values[avatarFieldKey] !== initialAvatarPath) {
            payload[avatarFieldKey] = values[avatarFieldKey];
        }

        normalizedExtraFields.forEach(field => {
            if (values[field.name] !== undefined) {
                payload[field.name] = values[field.name];
            }
        });

        setSubmitting(true);
        try {
            await onSubmit?.(payload);
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        form.resetFields();
        setAvatarPath('');
        onCancel?.();
    };

    return (
        <Modal
            title={title}
            open={open}
            onOk={handleOk}
            onCancel={handleClose}
            okText="保存"
            cancelText="取消"
            confirmLoading={submitting}
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item name="name" label="姓名" rules={[{ required: true, message: '姓名不能为空' }]}>
                    <Input />
                </Form.Item>

                <Form.Item name="sex" label="性别">
                    <Select>
                        <Option value={1}>男</Option>
                        <Option value={0}>女</Option>
                    </Select>
                </Form.Item>

                <Form.Item name={phoneFieldKey} label="电话号">
                    <Input placeholder="请输入电话号" allowClear />
                </Form.Item>

                {normalizedExtraFields.map(field => (
                    <Form.Item key={field.name} name={field.name} label={field.label} rules={field.rules || []}>
                        <Input placeholder={field.placeholder || `请输入${field.label}`} allowClear />
                    </Form.Item>
                ))}

                <Form.Item name={avatarFieldKey} hidden>
                    <Input />
                </Form.Item>

                <Form.Item label="头像">
                    <Space direction="vertical" size={8}>
                        <TempImageUpload
                            onChange={handleAvatarChange}
                            variant="picture-card"
                            previewPath={avatarPath || initialAvatarPath}
                            buttonText="上传头像"
                            disabled={submitting}
                        />
                    </Space>
                </Form.Item>

                <Form.Item name="password" label="新密码" tooltip="如果不修改密码请留空">
                    <Input.Password placeholder="留空则不修改密码" />
                </Form.Item>

                <div style={{ color: '#888', marginTop: '10px' }}>
                    {note || '*注：仅支持修改姓名、性别、电话号、头像、密码及扩展字段。'}
                </div>
            </Form>
        </Modal>
    );
};

export default UserEditModal;