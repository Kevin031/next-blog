<template>
  <ElButton :icon="isFullScreen ? ZoomOut : ZoomIn" @click="toggleFullScreen">
    {{ isFullScreen ? '退出全屏' : '全屏' }}
  </ElButton>
</template>

<script setup lang="ts">
  import { ZoomIn, ZoomOut } from '@element-plus/icons-vue'

  interface Props {
    isFullScreen: boolean
  }

  interface Emits {
    (e: 'update:isFullScreen', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    isFullScreen: false
  })
  const emit = defineEmits<Emits>()

  const toggleFullScreen = () => {
    emit('update:isFullScreen', !props.isFullScreen)
  }
</script>
