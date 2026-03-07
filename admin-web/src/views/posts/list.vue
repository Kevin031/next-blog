<template>
  <div class="posts-list art-full-height">
    <ElCard class="art-table-card" shadow="never">
      <!-- 筛选面板 -->
      <ArtSearchBar
        v-model="searchForm"
        :items="searchItems"
        :span="8"
        label-width="80px"
        @search="handleSearch"
        @reset="handleReset"
      />

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
  import { TagService } from '@/api/tagApi'
  import ArtButtonTable from '@/components/core/forms/art-button-table/index.vue'
  import ArtSearchBar from '@/components/core/forms/art-search-bar/index.vue'
  import dayjs from 'dayjs'
  import { useRouter } from 'vue-router'
  import { mittBus } from '@/utils/sys'
  import { ElTag } from 'element-plus'
  import { h, ref, onMounted, computed } from 'vue'

  const router = useRouter()

  const { getPostList } = PostService
  const { getTagList } = TagService

  // 所有标签列表
  const allTags = ref<Api.Tag.TagItem[]>([])

  // 搜索表单
  const searchForm = ref({
    tagId: undefined,
    // 预留未来可扩展的筛选字段
    // title: undefined,
    // status: undefined,
    // dateRange: undefined
  })

  // 筛选面板配置
  const searchItems = computed(() => [
    {
      key: 'tagId',
      label: '标签',
      type: 'select',
      placeholder: '请选择标签',
      props: {
        clearable: true,
        options: allTags.value.map(tag => ({
          label: tag.name,
          value: tag.id
        }))
      }
    }
    // 未来可扩展更多筛选条件
    // {
    //   key: 'title',
    //   label: '标题',
    //   type: 'input',
    //   placeholder: '请输入文章标题'
    // },
    // {
    //   key: 'status',
    //   label: '状态',
    //   type: 'select',
    //   placeholder: '请选择状态',
    //   props: {
    //     clearable: true,
    //     options: [
    //       { label: '已发布', value: true },
    //       { label: '草稿', value: false }
    //     ]
    //   }
    // }
  ])

  // 获取所有标签
  const fetchTags = async () => {
    try {
      const res = await getTagList({ current: 1, size: 1000 })
      allTags.value = res.list
    } catch (error) {
      console.error('获取标签列表失败:', error)
    }
  }

  // 搜索处理
  const handleSearch = () => {
    refreshUpdate()
  }

  // 重置处理
  const handleReset = () => {
    refreshUpdate()
  }

  const { columns, columnChecks, refreshData, loading, pagination, data, refreshUpdate } =
    useTable<Api.Post.PostListItem>({
      core: {
        apiFn: getPostList,
        apiParams: computed(() => ({
          current: 1,
          size: 20,
          tagId: searchForm.value.tagId
        })),
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
            prop: 'tags',
            label: '标签',
            formatter: (row) => {
              if (!row.tags || row.tags.length === 0) {
                return h('span', { class: 'text-gray-400' }, '无标签')
              }
              return h('div', { class: 'flex gap-1 flex-wrap' },
                row.tags.map((tag: Api.Tag.TagItem) =>
                  h(ElTag, {
                    key: tag.id,
                    size: 'small',
                    type: 'primary'
                  }, () => tag.name)
                )
              )
            }
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
            prop: 'content_type',
            label: '类型',
            width: 100,
            formatter: (row) => {
              const typeConfig = row.content_type === 'markdown'
                ? { type: 'primary' as const, text: 'MD' }
                : { type: 'success' as const, text: '富文本' }
              return h(ElTag, { type: typeConfig.type, size: 'small' }, () => typeConfig.text)
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

  onMounted(() => {
    fetchTags()
  })

  mittBus.on('refreshPostsList', refreshUpdate)
</script>

<style scoped lang="scss">
  .posts-list {
    :deep(.art-table-card) {
      .el-card__body {
        padding: 20px;
      }
    }

    :deep(.art-search-bar) {
      margin-bottom: 16px;
    }
  }
</style>
