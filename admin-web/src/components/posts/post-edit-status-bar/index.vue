<template>
  <div class="post-edit-status-bar">
    <div class="status-bar-left">
      <slot name="left">
        <span class="status-label">可见性：</span>
        <ElSwitch v-model="visibleValue" active-text="已发布" inactive-text="草稿" />
      </slot>
    </div>
    <div class="status-bar-center">
      <slot name="center"></slot>
    </div>
    <div class="status-bar-right">
      <slot name="right">
        <span class="shortcuts-hint">快捷键: Ctrl+S 保存</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    visible: boolean
  }

  interface Emits {
    (e: 'update:visible', value: boolean): void
  }

  const props = withDefaults(defineProps<Props>(), {
    visible: true
  })
  const emit = defineEmits<Emits>()

  const visibleValue = computed({
    get: () => props.visible,
    set: (value) => emit('update:visible', value)
  })
</script>

<style scoped lang="scss">
  // 响应式断点
  $breakpoint-mobile: 768px;
  $breakpoint-tablet: 1200px;

  .post-edit-status-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 36px;
    padding: 0 20px;
    background-color: var(--el-bg-color-page);
    border-top: 1px solid var(--el-border-color);
    flex-shrink: 0;
    transition: all 0.3s ease;

    .status-bar-left {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 8px;

      .status-label {
        font-size: 13px;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }
    }

    .status-bar-center {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 0 20px;
    }

    .status-bar-right {
      flex-shrink: 0;

      .shortcuts-hint {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        user-select: none;
        background-color: var(--el-fill-color-light);
        padding: 2px 8px;
        border-radius: 4px;
        transition: all 0.3s ease;

        &:hover {
          background-color: var(--el-fill-color);
        }
      }
    }

    // 平板版布局
    @media (max-width: $breakpoint-tablet) {
      .status-bar-left {
        .status-label {
          font-size: 12px;
        }
      }

      .status-bar-center {
        padding: 0 10px;
      }

      .status-bar-right {
        .shortcuts-hint {
          font-size: 11px;
          padding: 2px 6px;
        }
      }
    }

    // 移动版布局 - 底部固定
    @media (max-width: $breakpoint-mobile) {
      padding: 0 12px;

      .status-bar-left {
        gap: 6px;

        .status-label {
          font-size: 11px;
        }

        :deep(.el-switch__label) {
          font-size: 11px;
        }
      }

      .status-bar-center {
        display: none; // 移动端隐藏中间区域
      }

      .status-bar-right {
        .shortcuts-hint {
          font-size: 10px;
          padding: 1px 4px;
        }
      }
    }
  }
</style>
