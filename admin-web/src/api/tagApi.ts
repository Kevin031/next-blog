import request from '@/utils/http'

export class TagService {
  static getTagList(params?: Api.Tag.TagSearchParams) {
    return request.get<Api.Tag.TagListData>({
      url: '/tags',
      params
    })
  }

  static getTagDetail(id: string) {
    return request.get<Api.Tag.TagDetailData>({
      url: `/tags/${id}`
    })
  }

  static createTag(data: Api.Tag.TagCreateData) {
    return request.post<Api.Tag.TagDetailData>({
      url: '/tags',
      data
    })
  }

  static updateTag(id: number, data: Api.Tag.TagUpdateData) {
    return request.patch<Api.Tag.TagDetailData>({
      url: `/tags/${id}`,
      data
    })
  }

  static deleteTag(id: number) {
    return request.del({
      url: `/tags/${id}`
    })
  }
}
