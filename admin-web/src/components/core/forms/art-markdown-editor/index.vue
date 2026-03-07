<template>
  <div class="markdown-editor-wrapper">
    <MdEditor
      v-model="modelValue"
      :height="height"
      :mode="mode"
      :placeholder="placeholder"
      :disabled="disabled"
      :theme="theme"
      :code-theme="codeTheme"
      @onUploadImg="handleUploadImage"
      ref="editorRef"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { MdEditor } from 'md-editor-v3'
  import 'md-editor-v3/lib/style.css'
  import { useUserStore } from '@/store/modules/user'
  import { ElMessage } from 'element-plus'
  import hljs from 'highlight.js'
  import 'highlight.js/styles/github-dark.css'

  defineOptions({ name: 'ArtMarkdownEditor' })

  interface Props {
    /** 编辑器高度 */
    height?: string
    /** 编辑器模式：preview/edit/live */
    mode?: 'preview' | 'edit' | 'live'
    /** 占位符文本 */
    placeholder?: string
    /** 是否禁用 */
    disabled?: boolean
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const props = withDefaults(defineProps<Props>(), {
    height: '500px',
    mode: 'live',
    placeholder: '请输入 Markdown 内容...',
    disabled: false
  })

  const modelValue = defineModel<string>({ required: true })

  const userStore = useUserStore()
  const editorRef = ref()

  // 主题配置
  const theme = computed(() => 'dark')
  const codeTheme = computed(() => 'atom')

  // 配置 highlight.js
  hljs.highlightAll()

  // 生命周期
  onMounted(() => {
    // 编辑器初始化完成
  })

  onBeforeUnmount(() => {
    // 清理编辑器资源
  })

  // 图片上传处理
  const handleUploadImage = async (files: File[], callback: (urls: string[]) => void) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('file', file)
    })

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/common/upload/wangeditor`, {
        method: 'POST',
        headers: {
          Authorization: userStore.accessToken
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('上传失败')
      }

      const result = await response.json()
      if (result.code === 200 && result.data?.url) {
        callback([result.data.url])
        ElMessage.success('图片上传成功')
      } else {
        throw new Error(result.msg || '上传失败')
      }
    } catch (error) {
      console.error('图片上传失败:', error)
      ElMessage.error('图片上传失败')
    }
  }

  // 暴露编辑器实例和方法
  defineExpose({
    /** 获取编辑器实例 */
    getEditor: () => editorRef.value,
    /** 设置编辑器内容 */
    setContent: (text: string) => {
      modelValue.value = text
    },
    /** 获取编辑器内容 */
    getContent: () => modelValue.value,
    /** 聚焦编辑器 */
    focus: () => {
      editorRef.value?.focus()
    }
  })
</script>

<style lang="scss" scoped>
  .markdown-editor-wrapper {
    :deep(.md-editor) {
      border-radius: 4px;
      border: 1px solid var(--el-border-color);

      &:hover {
        border-color: var(--el-color-primary);
      }
    }

    :deep(.md-editor-toolbar-wrapper) {
      background-color: var(--el-bg-color);
      border-bottom: 1px solid var(--el-border-color);
    }

    :deep(.md-editor-content) {
      background-color: var(--el-bg-color);
    }

    :deep(.md-editor-preview-wrapper) {
      background-color: var(--el-bg-color-page);
    }
  }
</style>
