<template>
  <div class="posts-edit">
    <ElRow :gutter="20">
      <ElCol :span="18">
        <ElInput
          v-model.trim="formData.title"
          placeholder="请输入文章标题（最多100个字符）"
          maxlength="100"
        />
      </ElCol>
    </ElRow>
    <ElRow class="el-top" :gutter="20">
      <ElCol :span="18">
        <ElSelect
          v-model="formData.tagIds"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或创建标签"
          style="width: 100%"
        >
          <ElOption
            v-for="tag in allTags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
          />
        </ElSelect>
      </ElCol>
    </ElRow>
    <ArtWangEditor class="el-top" v-model="formData.content" />
    <ElCard class="el-top" shadow="never" header="发布设置">
      <ElForm>
        <ElFormItem label="可见">
          <ElSwitch v-model="formData.visible" />
        </ElFormItem>
      </ElForm>
      <div class="footer">
        <ElButton :loading="submitLoading" type="primary" @click="savePost">保存</ElButton>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { PostService } from '@/api/postApi'
  import { TagService } from '@/api/tagApi'
  import { pick } from 'lodash-es'
  import { mittBus } from '@/utils/sys'

  const submitLoading = ref(false)
  const allTags = ref<Api.Tag.TagItem[]>([])

  const route = useRoute()
  const router = useRouter()

  const isEditMode = computed(() => !!route.params.id)

  const { getPostDetail, patchPostDetail, createPost } = PostService
  const { getTagList } = TagService

  const formData = ref<{
    title: string
    content: string
    visible: boolean
    tagIds?: number[]
  }>({
    title: '',
    content: '',
    visible: true,
    tagIds: []
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
    formData.value = Object.assign(formData.value, pick(res, ['title', 'content', 'visible', 'tags']))
    // 处理标签数据，提取 tagIds
    if (res.tags && res.tags.length > 0) {
      formData.value.tagIds = res.tags.map((tag: Api.Tag.TagItem) => tag.id)
    }
  }

  onMounted(async () => {
    await fetchTags()
    await initData()
  })

  const savePost = async () => {
    submitLoading.value = true
    try {
      const submitData = {
        title: formData.value.title,
        content: formData.value.content,
        visible: formData.value.visible,
        tagIds: formData.value.tagIds
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
</script>

<style scoped lang="scss">
  .posts-edit {
    padding-bottom: 20px;
    .el-top {
      margin-top: 10px;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
</style>
