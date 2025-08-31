<template>
  <div class="posts-list art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 表格头部 -->
      <ArtTableHeader v-model:columns="columnChecks" @refresh="refreshData">
        <template #left>
          <ElButton v-ripple @click="router.push('/posts/create')">新建文章</ElButton>
        </template>
      </ArtTableHeader>
      <ArtTable :loading="loading" :data="data" :columns="columns" :pagination="pagination" />
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { useTable } from '@/composables/useTable'
  import { PostService } from '@/api/postApi'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import dayjs from 'dayjs'
  import { useRouter } from 'vue-router'
  import { mittBus } from '@/utils/sys'
  import { ElTag } from 'element-plus'
  import { h } from 'vue'

  const router = useRouter()

  const { getPostList } = PostService

  // 搜索表单
  const searchForm = ref({
    title: undefined
  })

  const { columns, columnChecks, refreshData, loading, pagination, data, refreshUpdate } =
    useTable<Api.Post.PostListItem>({
      core: {
        apiFn: getPostList,
        apiParams: {
          current: 1,
          size: 20
          // ...searchForm.value
        },
        columnsFactory: () => [
          {
            type: 'index',
            label: '序号',
            width: 60
          },
          {
            prop: 'title',
            label: '标题'
          },
          {
            prop: 'visible',
            label: '状态',
            formatter: (row) => {
              const statusConfig = row.visible
                ? { type: 'success' as const, text: '已发布' }
                : { type: 'info' as const, text: '草稿' }
              return h(ElTag, { type: statusConfig.type }, () => statusConfig.text)
            }
          },
          {
            prop: 'update_time',
            label: '更新时间',
            width: 180,
            formatter: (row) => {
              return dayjs(row.update_time).format('YYYY-MM-DD HH:mm:ss')
            }
          },
          {
            prop: 'operation',
            label: '操作',
            width: 120,
            fixed: 'right',
            formatter: (row) =>
              h('div', [
                h(ArtButtonTable, {
                  type: 'edit',
                  onClick: () => {
                    router.push({
                      name: 'PostsEdit',
                      params: {
                        id: row.id
                      }
                    })
                  }
                }),
                h(ArtButtonTable, {
                  type: 'delete',
                  onClick: () => {}
                })
              ])
          }
        ]
      }
    })

  mittBus.on('refreshPostsList', refreshUpdate)
</script>
