<template>
  <PostEditLayout
    v-model:title="formData.title"
    v-model:tag-ids="formData.tagIds"
    v-model:content-type="formData.content_type"
    v-model:visible="formData.visible"
    v-model:is-full-screen="isFullScreen"
    :all-tags="allTags"
    :is-edit-mode="isEditMode"
    :loading="submitLoading"
    :highlight="saveButtonHighlight"
    @save="savePost"
  >
    <div ref="editorWrapperRef" class="editor-wrapper">
      <ArtMarkdownEditor v-if="currentEditorType === 'markdown'" v-model="formData.content" />
      <ArtWangEditor v-else v-model="formData.content" />
    </div>
  </PostEditLayout>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { useEventListener } from '@vueuse/core'
  import { PostService } from '@/api/postApi'
  import { TagService } from '@/api/tagApi'
  import { pick } from 'lodash-es'
  import { mittBus } from '@/utils/sys'
  import PostEditLayout from '@/components/posts/post-edit-layout/index.vue'

  const submitLoading = ref(false)
  const allTags = ref<Api.Tag.TagItem[]>([])
  const isFullScreen = ref(false)
  const saveButtonHighlight = ref(false)
  const editorWrapperRef = ref<HTMLElement | null>(null)
  let resizeObserver: ResizeObserver | null = null

  const route = useRoute()
  const router = useRouter()

  const isEditMode = computed(() => !!route.params.id)

  // 当前编辑器类型
  const currentEditorType = computed(() => {
    // 如果是编辑模式，使用数据库中的 content_type
    if (isEditMode.value && formData.value.content_type) {
      return formData.value.content_type
    }
    // 如果是新建模式，使用用户选择的 content_type
    return formData.value.content_type || 'rich-text'
  })

  const { getPostDetail, patchPostDetail, createPost } = PostService
  const { getTagList } = TagService

  const formData = ref<{
    title: string
    content: string
    visible: boolean
    tagIds?: number[]
    content_type?: string
  }>({
    title: '',
    content: '',
    visible: true,
    tagIds: [],
    content_type: 'rich-text'
  })

  // 获取所有标签
  const fetchTags = async () => {
    try {
      const res = await getTagList({ current: 1, size: 1000 })
      allTags.value = res.list
    } catch (error) {
      console.error('获取标签列表失败:', error)
    }
  }

  const initData = async () => {
    if (!route.params.id) return
    const res = await getPostDetail(route.params.id as string)
    console.log(res)
    formData.value = Object.assign(
      formData.value,
      pick(res, ['title', 'content', 'visible', 'tags', 'content_type'])
    )
    // 处理标签数据，提取 tagIds
    if (res.tags && res.tags.length > 0) {
      formData.value.tagIds = res.tags.map((tag: Api.Tag.TagItem) => tag.id)
    }
    // 旧数据兼容：content_type 为空/null 时默认使用富文本
    if (!formData.value.content_type) {
      formData.value.content_type = 'rich-text'
    }
  }

  // 触发保存按钮高亮效果
  const triggerSaveButtonHighlight = () => {
    saveButtonHighlight.value = true
    setTimeout(() => {
      saveButtonHighlight.value = false
    }, 300)
  }

  const savePost = async () => {
    submitLoading.value = true
    try {
      const submitData = {
        title: formData.value.title,
        content: formData.value.content,
        visible: formData.value.visible,
        tagIds: formData.value.tagIds,
        content_type: formData.value.content_type
      }
      if (isEditMode.value) {
        await patchPostDetail(Number(route.params.id as string), submitData)
      } else {
        await createPost(submitData)
      }
      ElMessage.success('保存成功')
      router.push('/posts/list')
      mittBus.emit('refreshPostsList')
    } catch (error) {
      console.error(error)
    } finally {
      submitLoading.value = false
    }
  }

  onMounted(async () => {
    await fetchTags()
    await initData()

    // 监听快捷键
    useEventListener(document, 'keydown', (e) => {
      // Ctrl+S 或 Cmd+S 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault() // 阻止浏览器默认保存行为
        triggerSaveButtonHighlight()
        savePost()
      }
      // Esc 退出全屏
      if (e.key === 'Escape' && isFullScreen.value) {
        isFullScreen.value = false
      }
    })

    // 使用 ResizeObserver 监听窗口大小变化
    if (editorWrapperRef.value) {
      resizeObserver = new ResizeObserver(() => {
        // 窗口大小变化时，编辑器高度会自动调整（Flexbox 布局）
        // 这里可以添加额外的自适应逻辑
        console.log('Editor size changed')
      })
      resizeObserver.observe(editorWrapperRef.value)
    }
  })

  onBeforeUnmount(() => {
    // 清理 ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  })
</script>

<style scoped lang="scss">
  // 响应式断点
  $breakpoint-mobile: 768px;
  $breakpoint-tablet: 1200px;

  .editor-wrapper {
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
</style>
