<template>
  <div class="post-edit-toolbar">
    <div class="toolbar-left">
      <slot name="left">
        <ElSelect
          v-model="tagIdsValue"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或创建标签"
          class="tag-selector"
        >
          <ElOption v-for="tag in allTags" :key="tag.id" :label="tag.name" :value="tag.id" />
        </ElSelect>
      </slot>
    </div>
    <div class="toolbar-center">
      <slot name="center"></slot>
    </div>
    <div class="toolbar-right">
      <slot name="right">
        <ElSelect
          v-model="contentTypeValue"
          placeholder="选择编辑器类型"
          :disabled="isEditMode"
          :popper-options="{ modifiers: [{ name: 'zIndex', enabled: true }] }"
          popper-class="editor-type-dropdown"
          class="editor-type-selector"
        >
          <ElOption label="Markdown" value="markdown" />
          <ElOption label="富文本" value="rich-text" />
        </ElSelect>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'

  interface Props {
    tagIds: number[]
    allTags: Api.Tag.TagItem[]
    contentType: string
    isEditMode: boolean
  }

  interface Emits {
    (e: 'update:tagIds', value: number[]): void
    (e: 'update:contentType', value: string): void
  }

  const props = withDefaults(defineProps<Props>(), {
    tagIds: () => [],
    allTags: () => [],
    contentType: 'rich-text',
    isEditMode: false
  })
  const emit = defineEmits<Emits>()

  const tagIdsValue = computed({
    get: () => props.tagIds,
    set: (value) => emit('update:tagIds', value)
  })

  const contentTypeValue = computed({
    get: () => props.contentType,
    set: (value) => emit('update:contentType', value)
  })
</script>

<style scoped lang="scss">
  // 响应式断点
  $breakpoint-mobile: 768px;
  $breakpoint-tablet: 1200px;

  .post-edit-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 48px;
    padding: 0 20px;
    background-color: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color);
    flex-shrink: 0;
    transition: all 0.3s ease;

    .toolbar-left {
      flex: 1;

      .tag-selector {
        width: 100%;
        max-width: 400px;
        transition: all 0.3s ease;

        :deep(.el-select__wrapper) {
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--el-color-primary);
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          }
        }
      }
    }

    .toolbar-center {
      flex: 1;
      display: flex;
      justify-content: center;
      padding: 0 20px;
    }

    .toolbar-right {
      flex-shrink: 0;

      .editor-type-selector {
        width: 150px;
        transition: all 0.3s ease;

        :deep(.el-select__wrapper) {
          transition: all 0.3s ease;

          &:hover {
            border-color: var(--el-color-primary);
          }

          &.is-focus {
            box-shadow: 0 0 0 1px var(--el-color-primary) inset;
          }
        }
      }
    }

    // 平板版布局（768px - 1200px）- 压缩布局
    @media (min-width: $breakpoint-mobile) and (max-width: $breakpoint-tablet) {
      flex-direction: column;
      height: auto;
      padding: 10px;
      gap: 10px;

      .toolbar-left,
      .toolbar-center,
      .toolbar-right {
        flex: none;
        width: 100%;
        justify-content: center;
      }

      .toolbar-center {
        padding: 0;
      }

      .toolbar-left {
        .tag-selector {
          max-width: 100%;
        }
      }

      .toolbar-right {
        .editor-type-selector {
          width: 100%;
        }
      }
    }
  }
</style>

<style lang="scss">
  // 编辑器类型下拉面板的 z-index（非 scoped，确保能影响 body 下的元素）
  .editor-type-dropdown {
    z-index: 9999 !important;
  }
</style>
