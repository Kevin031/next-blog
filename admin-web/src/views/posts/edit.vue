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
  import { ref, computed } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import { PostService } from '@/api/postApi'
  import { pick } from 'lodash-es'
  import { mittBus } from '@/utils/sys'

  const submitLoading = ref(false)

  const route = useRoute()
  const router = useRouter()

  const isEditMode = computed(() => !!route.params.id)

  const { getPostDetail, patchPostDetail, createPost } = PostService

  const formData = ref({
    title: '',
    content: '',
    visible: true
  })

  const initData = async () => {
    if (!route.params.id) return
    const res = await getPostDetail(route.params.id as string)
    console.log(res)
    formData.value = Object.assign(formData.value, pick(res, ['title', 'content', 'visible']))
  }
  initData()

  const savePost = async () => {
    submitLoading.value = true
    try {
      if (isEditMode.value) {
        await patchPostDetail(Number(route.params.id as string), formData.value)
      } else {
        await createPost(formData.value)
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
