import request from '@/utils/http'

export class UserService {
  // 登录
  static login(params: Api.Auth.LoginParams) {
    return request.post<Api.Auth.LoginResponse>({
      url: '/auth/login',
      params
      // showErrorMessage: false // 不显示错误消息
    })
  }

  // 获取用户信息
  static getUserInfo() {
    return request.get<Api.User.UserInfo>({
      url: '/auth/user'
      // 自定义请求头
      // headers: {
      //   'X-Custom-Header': 'your-custom-value'
      // }
    })
  }

  // 获取用户列表（含认证信息，支持搜索筛选）
  static getUserList(params: Api.User.UserSearchParams) {
    return request.get<Api.User.UserListData>({
      url: '/user/with-auth',
      params
    })
  }

  // 创建用户（管理员）
  static createUser(data: Api.User.CreateUserParams) {
    return request.post({
      url: '/user',
      data
    })
  }

  // 更新用户信息
  static updateUser(id: number, data: Api.User.UpdateUserParams) {
    return request.patch({
      url: `/user/${id}`,
      data
    })
  }

  // 删除用户
  static deleteUser(id: number) {
    return request.del({
      url: `/user/${id}`
    })
  }

  // 用户注册（公开接口）
  static signup(data: Api.Auth.SignupParams) {
    return request.post<Api.Auth.SignupResponse>({
      url: '/auth/signup',
      data
    })
  }
}
