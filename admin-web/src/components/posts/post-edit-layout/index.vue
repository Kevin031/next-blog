<template>
  <div :class="['post-edit-layout', { fullscreen: isFullScreen }]">
    <PostEditTopBar
      v-show="!isFullScreen"
      v-model:title="title"
      :loading="loading"
      :highlight="highlight"
      @save="handleSave"
    />
    <PostEditToolbar
      v-show="!isFullScreen"
      v-model:tag-ids="tagIds"
      v-model:content-type="contentType"
      :all-tags="allTags"
      :is-edit-mode="isEditMode"
    />
    <div class="editor-container">
      <slot></slot>
      <div v-if="isFullScreen" class="fullscreen-exit-btn">
        <FullScreenToggle v-model:is-full-screen="isFullScreen" />
      </div>
    </div>
    <PostEditStatusBar v-show="!isFullScreen" v-model:visible="visible" />
  </div>
</template>

<script setup lang="ts">
  import PostEditTopBar from '../post-edit-top-bar/index.vue'
  import PostEditToolbar from '../post-edit-toolbar/index.vue'
  import PostEditStatusBar from '../post-edit-status-bar/index.vue'
  import FullScreenToggle from '../full-screen-toggle/index.vue'

  interface Props {
    title: string
    tagIds: number[]
    allTags: Api.Tag.TagItem[]
    contentType: string
    visible: boolean
    isEditMode: boolean
    loading: boolean
    highlight?: boolean
  }

  interface Emits {
    (e: 'update:title', value: string): void
    (e: 'update:tagIds', value: number[]): void
    (e: 'update:contentType', value: string): void
    (e: 'update:visible', value: boolean): void
    (e: 'save'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    title: '',
    tagIds: () => [],
    allTags: () => [],
    contentType: '',
    visible: true,
    isEditMode: false,
    loading: false,
    highlight: false
  })
  const emit = defineEmits<Emits>()

  const title = computed({
    get: () => props.title,
    set: (value) => emit('update:title', value)
  })

  const tagIds = computed({
    get: () => props.tagIds,
    set: (value) => emit('update:tagIds', value)
  })

  const contentType = computed({
    get: () => props.contentType,
    set: (value) => emit('update:contentType', value)
  })

  const visible = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })

  const isFullScreen = defineModel<boolean>('isFullScreen', { default: false })

  const handleSave = () => {
    emit('save')
  }
</script>

<style scoped lang="scss">
  // 响应式断点
  $breakpoint-mobile: 768px;
  $breakpoint-tablet: 1200px;

  .post-edit-layout {
    display: flex;
    margin-bottom: 20px;
    flex-direction: column;
    background-color: var(--el-bg-color-page);

    .editor-container {
      overflow: auto;
      position: relative;
    }

    // 平板版布局（768px - 1200px）
    @media (min-width: $breakpoint-mobile) and (max-width: $breakpoint-tablet) {
      .editor-container {
      }
    }

    // 移动版布局（< 768px）
    @media (max-width: $breakpoint-mobile) {
      .editor-container {
      }
    }

    &.fullscreen {
      .editor-container {
      }

      .fullscreen-exit-btn {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      }
    }
  }
</style>
