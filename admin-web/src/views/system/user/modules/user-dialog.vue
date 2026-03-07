<template>
  <ElDialog
    v-model="dialogVisible"
    :title="dialogType === 'add' ? '添加用户' : '编辑用户'"
    width="30%"
    align-center
  >
    <ElForm ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <ElFormItem label="用户名" prop="username">
        <ElInput v-model="formData.username" :disabled="dialogType === 'edit'" />
      </ElFormItem>
      <ElFormItem label="密码" prop="password" v-if="dialogType === 'add'">
        <ElInput v-model="formData.password" type="password" show-password />
      </ElFormItem>
      <ElFormItem label="昵称" prop="nickname">
        <ElInput v-model="formData.nickname" />
      </ElFormItem>
      <ElFormItem label="手机号" prop="phone">
        <ElInput v-model="formData.phone" />
      </ElFormItem>
      <ElFormItem label="性别" prop="gender">
        <ElSelect v-model="formData.gender" placeholder="请选择性别">
          <ElOption label="男" value="male" />
          <ElOption label="女" value="female" />
          <ElOption label="其他" value="other" />
        </ElSelect>
      </ElFormItem>
      <ElFormItem label="地址" prop="location">
        <ElInput v-model="formData.location" />
      </ElFormItem>
      <ElFormItem label="个人简介" prop="bio">
        <ElInput v-model="formData.bio" type="textarea" :rows="3" />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" @click="handleSubmit">提交</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage } from 'element-plus'
  import { UserService } from '@/api/usersApi'
  import sha256 from 'crypto-js/sha256'

  interface Props {
    visible: boolean
    type: string
    userData?: Api.User.UserListItem
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
    (e: 'submit'): void
  }

  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 对话框显示控制
  const dialogVisible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const dialogType = computed(() => props.type)

  // 表单实例
  const formRef = ref<FormInstance>()

  // 表单数据
  const formData = reactive({
    username: '',
    password: '',
    nickname: '',
    phone: '',
    gender: undefined as 'male' | 'female' | 'other' | undefined,
    location: '',
    bio: ''
  })

  // 表单验证规则
  const rules: FormRules = {
    username: [
      { required: true, message: '请输入用户名', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, message: '密码长度至少 6 位', trigger: 'blur' }
    ],
    phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号格式', trigger: 'blur' }]
  }

  // 初始化表单数据
  const initFormData = () => {
    const isEdit = props.type === 'edit' && props.userData
    const row = props.userData

    console.log('=== 编辑弹窗初始化 ===')
    console.log('props.type:', props.type)
    console.log('props.userData:', JSON.stringify(row, null, 2))
    console.log('isEdit:', isEdit)

    // 获取用户名
    const username = isEdit ? row?.auth?.username || row?.username || '' : ''
    console.log('提取的 username:', username)
    console.log('row?.auth:', row?.auth)
    console.log('row?.auth?.username:', row?.auth?.username)

    Object.assign(formData, {
      username: username,
      password: '',
      nickname: isEdit ? row?.nickname || '' : '',
      phone: isEdit ? row?.phone || '' : '',
      gender: isEdit ? row?.gender || undefined : undefined,
      location: isEdit ? row?.location || '' : '',
      bio: isEdit ? row?.bio || '' : ''
    })

    console.log('初始化后的 formData:', JSON.stringify(formData, null, 2))
  }

  // 统一监听对话框状态变化
  watch(
    () => [props.visible, props.type, props.userData],
    ([visible]) => {
      if (visible) {
        initFormData()
        // 强制刷新
        nextTick(() => {
          formRef.value?.clearValidate()
          // 再次确保数据已更新
          if (props.type === 'edit' && props.userData?.auth?.username) {
            formData.username = props.userData.auth.username
          }
        })
      }
    },
    { immediate: true }
  )

  // 提交表单
  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        try {
          if (dialogType.value === 'add') {
            // 新增用户 - 调用创建用户接口
            // 将空字符串转换为 undefined
            const cleanData = {
              username: formData.username,
              password: formData.password,  // 直接发送明文密码，后端会 bcrypt 加密
              nickname: formData.nickname || undefined,
              phone: formData.phone || undefined,
              gender: formData.gender,
              location: formData.location || undefined,
              bio: formData.bio || undefined
            }
            await UserService.createUser(cleanData)
            ElMessage.success('添加成功')
          } else {
            // 编辑用户 - 调用更新用户接口
            await UserService.updateUser(props.userData!.id, {
              nickname: formData.nickname || undefined,
              phone: formData.phone || undefined,
              gender: formData.gender,
              location: formData.location || undefined,
              bio: formData.bio || undefined
            })
            ElMessage.success('更新成功')
          }
          dialogVisible.value = false
          emit('submit')
        } catch (error) {
          console.error('提交失败:', error)
        }
      }
    })
  }
</script>
