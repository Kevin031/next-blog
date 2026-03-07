<template>
  <ArtSearchBar
    ref="searchBarRef"
    v-model="formData"
    :items="formItems"
    :rules="rules"
    @reset="handleReset"
    @search="handleSearch"
  ></ArtSearchBar>
</template>

<script setup lang="ts">
  interface Props {
    modelValue: Record<string, any>
  }
  interface Emits {
    (e: 'update:modelValue', value: Record<string, any>): void
    (e: 'search', params: Record<string, any>): void
    (e: 'reset'): void
  }
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()

  // 表单数据双向绑定
  const searchBarRef = ref()
  const formData = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  })

  // 校验规则
  const rules = {
    // 可以在这里添加校验规则
  }

  // 用户状态选项
  const statusOptions = ref([
    { label: '活跃', value: 'active' },
    { label: '非活跃', value: 'inactive' },
    { label: '已封禁', value: 'banned' }
  ])

  // 表单配置
  const formItems = computed(() => [
    {
      label: '搜索',
      key: 'search',
      type: 'input',
      placeholder: '用户名/昵称/邮箱',
      clearable: true
    },
    {
      label: '手机号',
      key: 'phone',
      type: 'input',
      props: { placeholder: '请输入手机号', maxlength: 11, clearable: true }
    },
    {
      label: '状态',
      key: 'status',
      type: 'select',
      props: { placeholder: '请选择状态', options: statusOptions.value, clearable: true }
    },
    {
      label: '日期范围',
      key: 'daterange',
      type: 'datetime',
      props: {
        type: 'daterange',
        valueFormat: 'YYYY-MM-DD',
        rangeSeparator: '至',
        startPlaceholder: '开始日期',
        endPlaceholder: '结束日期',
        clearable: true
      }
    }
  ])

  // 事件
  function handleReset() {
    console.log('重置表单')
    emit('reset')
  }

  async function handleSearch() {
    await searchBarRef.value.validate()
    emit('search', formData.value)
    console.log('表单数据', formData.value)
  }
</script>
