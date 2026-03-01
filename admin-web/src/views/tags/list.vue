<template>
  <div class="tags-list art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton v-ripple type="primary" @click="openCreateDialog">新建标签</ElButton>
        </template>
      </ArtTableHeader>
      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination" />
    </ElCard>

    <!-- 创建/编辑对话框 -->
    <ElDialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑标签' : '新建标签'"
      width="500px"
      @close="resetForm"
    >
      <ElForm :model="formData" label-width="80px">
        <ElFormItem label="标签名称">
          <ElInput
            v-model.trim="formData.name"
            placeholder="请输入标签名称（最多30个字符）"
            maxlength="30"
          />
        </ElFormItem>
      </ElForm>
      <template #footer>
        <ElButton @click="dialogVisible = false">取消</ElButton>
        <ElButton type="primary" :loading="submitLoading" @click="submitForm">确定</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue'
  import { useTable } from '@/composables/useTable'
  import { TagService } from '@/api/tagApi'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import dayjs from 'dayjs'
  import { ElMessageBox, ElMessage } from 'element-plus'
  import { h } from 'vue'

  const { getTagList, createTag, updateTag, deleteTag } = TagService

  const dialogVisible = ref(false)
  const submitLoading = ref(false)
  const editingId = ref<number | null>(null)

  const isEditMode = computed(() => editingId.value !== null)

  const formData = ref<{
    name: string
  }>({
    name: ''
  })

  const { columns, columnChecks, refreshData, loading, pagination, data, refreshUpdate } =
    useTable<Api.Tag.TagItem>({
      core: {
        apiFn: getTagList,
        apiParams: {
          current: 1,
          size: 20
        },
        columnsFactory: () => [
          {
            type: 'index',
            label: '序号',
            width: 60
          },
          {
            prop: 'name',
            label: '标签名称'
          },
          {
            prop: 'count',
            label: '使用次数',
            width: 120
          },
          {
            prop: 'createTime',
            label: '创建时间',
            width: 180,
            formatter: (row) => {
              return dayjs(row.createTime).format('YYYY-MM-DD HH:mm:ss')
            }
          },
          {
            prop: 'operation',
            label: '操作',
            width: 150,
            fixed: 'right',
            formatter: (row) =>
              h('div', [
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => {
                    openEditDialog(row)
                  }
                }),
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => {
                    handleDelete(row)
                  }
                })
              ])
          }
        ]
      }
    })

  // 打开创建对话框
  const openCreateDialog = () => {
    editingId.value = null
    formData.value.name = ''
    dialogVisible.value = true
  }

  // 打开编辑对话框
  const openEditDialog = (row: Api.Tag.TagItem) => {
    editingId.value = row.id
    formData.value.name = row.name
    dialogVisible.value = true
  }

  // 重置表单
  const resetForm = () => {
    formData.value.name = ''
    editingId.value = null
  }

  // 提交表单
  const submitForm = async () => {
    if (!formData.value.name) {
      ElMessage.warning('请输入标签名称')
      return
    }

    submitLoading.value = true
    try {
      if (isEditMode.value) {
        await updateTag(editingId.value!, formData.value)
        ElMessage.success('更新成功')
      } else {
        await createTag(formData.value)
        ElMessage.success('创建成功')
      }
      dialogVisible.value = false
      refreshUpdate()
    } catch (error) {
      console.error(error)
    } finally {
      submitLoading.value = false
    }
  }

  // 删除标签
  const handleDelete = (row: Api.Tag.TagItem) => {
    ElMessageBox.confirm(`确定要删除标签"${row.name}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        try {
          await deleteTag(row.id)
          ElMessage.success('删除成功')
          refreshUpdate()
        } catch (error: any) {
          ElMessage.error(error.message || '删除失败')
        }
      })
      .catch(() => {})
  }
</script>

<style scoped lang="scss">
  .tags-list {
    :deep(.art-table-card) {
      .el-card__body {
        padding: 20px;
      }
    }
  }
</style>
