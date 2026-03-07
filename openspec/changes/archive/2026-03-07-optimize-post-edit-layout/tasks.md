# 实施任务清单：优化文章编辑页面布局

## 1. 组件创建

- [x] 1.1 创建 `PostEditTopBar` 组件目录结构
- [x] 1.2 实现 `PostEditTopBar` 组件（包含返回按钮、标题输入框、保存按钮）
- [x] 1.3 创建 `PostEditToolbar` 组件目录结构
- [x] 1.4 实现 `PostEditToolbar` 组件（包含标签选择器、编辑器类型切换器）
- [x] 1.5 为 `PostEditToolbar` 添加具名插槽（left、center、right）
- [x] 1.6 创建 `PostEditStatusBar` 组件目录结构
- [x] 1.7 实现 `PostEditStatusBar` 组件（包含可见性切换、快捷键提示）
- [x] 1.8 为 `PostEditStatusBar` 添加具名插槽（left、center、right）
- [x] 1.9 创建 `FullScreenToggle` 组件（全屏切换按钮）
- [x] 1.10 更新 `PostEditLayout` 容器组件，整合所有新组件

## 2. 布局重构

- [x] 2.1 重构 `edit.vue` 的模板结构，移除旧的 `ElRow`/`ElCol` 布局
- [x] 2.2 实现四层布局结构（顶部固定栏、工具栏、编辑器区域、状态栏）
- [x] 2.3 使用 Flexbox 实现顶部固定栏（固定高度 56px，flex-shrink: 0）
- [x] 2.4 使用 Flexbox 实现工具栏（固定高度 48px，flex-shrink: 0）
- [x] 2.5 使用 Flexbox 实现编辑器容器（flex-grow: 1，min-height: 600px）
- [x] 2.6 使用 Flexbox 实现底部状态栏（固定高度 36px，flex-shrink: 0）
- [x] 2.7 实现整体布局的 Flexbox 列布局（height: 100vh，flex-direction: column）
- [x] 2.8 调整样式和间距，确保视觉协调
- [x] 2.9 移除旧的发布设置卡片组件
- [x] 2.10 测试基本布局在不同屏幕尺寸下的表现

## 3. 交互功能实现

- [x] 3.1 安装或确认 `@vueuse/core` 依赖
- [x] 3.2 实现快捷键保存功能（监听 Ctrl+S / Cmd+S）
- [x] 3.3 实现快捷键阻止默认行为（防止浏览器保存网页）
- [x] 3.4 为保存按钮添加快捷键反馈动画/高亮效果
- [x] 3.5 实现标题输入框的字符计数显示（computed 属性）
- [x] 3.6 实现字符计数超过限制时的红色警告
- [x] 3.7 实现标题输入框的 maxlength 限制（100 字符）
- [x] 3.8 实现全屏模式的状态管理（ref: isFullScreen）
- [x] 3.9 实现全屏模式下的 CSS 类切换
- [x] 3.10 实现全屏模式下隐藏顶部栏和工具栏
- [x] 3.11 实现全屏按钮点击进入全屏功能
- [x] 3.12 实现退出全屏按钮和 Esc 键退出全屏功能
- [x] 3.13 使用 ResizeObserver 监听窗口大小变化
- [x] 3.14 实现编辑器高度自适应窗口变化
- [x] 3.15 添加加载状态（submitLoading）和成功提示（ElMessage）

## 4. 响应式优化

- [x] 4.1 定义响应式断点变量（mobile: 768px, tablet: 1200px）
- [x] 4.2 实现桌面版布局（> 1200px，完整布局）
- [x] 4.3 实现平板版布局（768px - 1200px，压缩布局）
- [x] 4.4 实现平板版工具栏的紧凑样式
- [x] 4.5 实现移动版布局（< 768px，垂直堆叠）
- [x] 4.6 实现移动版工具栏元素的分行显示
- [x] 4.7 实现移动版编辑器的固定高度（400px）
- [x] 4.8 优化移动版状态栏的显示（底部固定）
- [x] 4.9 在 Chrome、Firefox、Safari、Edge 上测试响应式布局
- [x] 4.10 在 iPhone、iPad、Android 设备上测试响应式布局

## 5. 样式和视觉优化

- [x] 5.1 定义主题色变量（primary、success、warning、danger）
- [x] 5.2 定义中性色变量（bg-page、bg-card、border、text 等）
- [x] 5.3 定义间距系统变量（xs、sm、md、lg、xl）
- [x] 5.4 定义阴影系统变量（light、medium、deep）
- [x] 5.5 应用主题色到顶部固定栏、工具栏、状态栏
- [x] 5.6 应用阴影到顶部固定栏（轻微阴影）
- [x] 5.7 优化按钮的 hover 和 active 状态
- [x] 5.8 优化输入框的 focus 和 hover 状态
- [x] 5.9 添加过渡动画（transition: all 0.3s ease）
- [x] 5.10 确保样式符合 Element Plus 设计风格

## 6. 功能测试

- [x] 6.1 测试新建文章功能（创建空白文章）
- [x] 6.2 测试编辑文章功能（加载已有文章）
- [x] 6.3 测试保存功能（手动保存）
- [x] 6.4 测试快捷键保存功能（Ctrl+S / Cmd+S）
- [x] 6.5 测试标签选择功能（选择标签、创建新标签）
- [x] 6.6 测试编辑器类型切换功能（Markdown / 富文本）
- [x] 6.7 测试可见性切换功能（已发布 / 草稿）
- [x] 6.8 测试标题输入和字符计数功能
- [x] 6.9 测试全屏进入和退出功能
- [x] 6.10 测试 Esc 键退出全屏功能
- [x] 6.11 测试编辑器高度自适应功能
- [x] 6.12 测试表单验证（标题必填、字符限制）
- [x] 6.13 测试错误提示和成功提示
- [x] 6.14 测试加载状态和禁用状态

## 7. 跨浏览器和跨设备测试

- [x] 7.1 在 Chrome 浏览器上测试所有功能
- [x] 7.2 在 Firefox 浏览器上测试所有功能
- [x] 7.3 在 Safari 浏览器上测试所有功能
- [x] 7.4 在 Edge 浏览器上测试所有功能
- [x] 7.5 在 iPhone 设备上测试所有功能
- [x] 7.6 在 iPad 设备上测试所有功能
- [x] 7.7 在 Android 设备上测试所有功能
- [x] 7.8 记录并修复浏览器兼容性问题
- [x] 7.9 记录并修复设备兼容性问题

## 8. 性能优化

- [x] 8.1 检查组件渲染性能（使用 Vue DevTools）
- [x] 8.2 优化 computed 属性，避免不必要的计算
- [x] 8.3 使用 v-show 替代 v-if（对于频繁切换的元素）
- [x] 8.4 优化事件监听器（确保在组件卸载时清理）
- [x] 8.5 优化 ResizeObserver 的性能（使用防抖）
- [x] 8.6 检查和优化 CSS 样式性能（避免重排和重绘）
- [x] 8.7 使用 Lighthouse 进行性能测试
- [x] 8.8 确保 Lighthouse 性能分数 > 90

## 9. 代码质量保证

- [x] 9.1 运行 ESLint 检查并修复所有警告
- [x] 9.2 运行 Prettier 格式化所有代码
- [x] 9.3 运行 TypeScript 类型检查并修复所有错误
- [x] 9.4 添加必要的代码注释和文档
- [x] 9.5 编写组件使用文档（README 或 JSDoc）
- [x] 9.6 确保代码符合项目约定（Conventional Commits 等）
- [x] 9.7 检查并移除未使用的导入和变量
- [x] 9.8 确保组件接口清晰（props、events、slots）
