import request from '@/utils/http'

export class PostService {
  static getPostList(params: Api.Common.PaginatingSearchParams) {
    return request.get<Api.Post.PostListData>({
      url: '/posts',
      params
    })
  }

  static getPostDetail(id: string) {
    return request.get<Api.Post.PostDetailData>({
      url: `/posts/${id}`
    })
  }

  static patchPostDetail(id: number, data: Api.Post.PostPatchData) {
    return request.patch<Api.Post.PostPatchData>({
      url: `/posts/${id}`,
      data
    })
  }

  static createPost(data: Api.Post.PostPatchData) {
    return request.post<Api.Post.PostPatchData>({
      url: '/posts/create',
      data
    })
  }
}
