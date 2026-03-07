<template>
  <div class="post-edit-top-bar">
    <div class="top-bar-left">
      <ElButton :icon="ArrowLeft" @click="handleBack">返回</ElButton>
    </div>
    <div class="top-bar-center">
      <ElInput
        v-model.trim="titleValue"
        placeholder="请输入文章标题"
        :maxlength="100"
        show-word-limit
        :class="{ 'title-warning': isOverLimit }"
        class="title-input"
      />
    </div>
    <div class="top-bar-right">
      <ElButton
        type="primary"
        :loading="loading"
        :icon="Document"
        :class="{ 'save-highlight': highlight }"
        @click="handleSave"
      >
        保存
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useRouter } from 'vue-router'
  import { ArrowLeft, Document } from '@element-plus/icons-vue'

  interface Props {
    title: string
    loading?: boolean
    highlight?: boolean
  }

  interface Emits {
    (e: 'update:title', value: string): void
    (e: 'save'): void
  }

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    highlight: false
  })
  const emit = defineEmits<Emits>()
  const router = useRouter()

  const titleValue = computed({
    get: () => props.title,
    set: (value) => emit('update:title', value)
  })

  // 计算是否超过字符限制
  const charCount = computed(() => props.title.length)
  const isOverLimit = computed(() => charCount.value > 100)

  const handleBack = () => {
    router.back()
  }

  const handleSave = () => {
    emit('save')
  }
</script>

<style scoped lang="scss">
  // 响应式断点
  $breakpoint-mobile: 768px;
  $breakpoint-tablet: 1200px;

  .post-edit-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 20px;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    flex-shrink: 0;
    transition: box-shadow 0.3s ease;

    .top-bar-left {
      flex-shrink: 0;
    }

    .top-bar-center {
      flex: 1;
      margin: 0 20px;

      .title-input {
        width: 100%;
        max-width: 800px;
        transition: all 0.3s ease;

        :deep(.el-input__wrapper) {
          background-color: var(--el-bg-color);
          transition: all 0.3s ease;

          &:hover {
            background-color: var(--el-fill-color);
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          }
        }

        :deep(.el-input__inner) {
          font-size: 18px;
          font-weight: 500;
          padding: 8px 12px;
        }

        :deep(.el-input__count) {
          color: var(--el-text-color-secondary);
          font-size: 12px;
          transition: color 0.3s ease;
        }

        &.title-warning {
          :deep(.el-input__count) {
            color: var(--el-color-danger);
            font-weight: 600;
          }

          :deep(.el-input__wrapper) {
            border-color: var(--el-color-danger);

            &.is-focus {
              box-shadow: 0 0 0 1px var(--el-color-danger) inset;
            }
          }
        }
      }
    }

    .top-bar-right {
      flex-shrink: 0;

      .save-highlight {
        animation: pulse 0.3s ease-in-out;
      }
    }

    // 平板版布局
    @media (max-width: $breakpoint-tablet) {
      .top-bar-center {
        margin: 0 15px;

        .title-input {
          max-width: 600px;

          :deep(.el-input__inner) {
            font-size: 16px;
          }
        }
      }
    }

    // 移动版布局
    @media (max-width: $breakpoint-mobile) {
      padding: 0 12px;

      .top-bar-left {
        .el-button {
          padding: 5px 8px;
        }
      }

      .top-bar-center {
        margin: 0 10px;

        .title-input {
          max-width: 100%;

          :deep(.el-input__inner) {
            font-size: 14px;
            padding: 6px 8px;
          }

          :deep(.el-input__count) {
            font-size: 11px;
          }
        }
      }

      .top-bar-right {
        .el-button {
          padding: 5px 12px;
          font-size: 14px;
        }
      }
    }
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(64, 158, 255, 0.7);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 0 8px rgba(64, 158, 255, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(64, 158, 255, 0);
    }
  }
</style>
