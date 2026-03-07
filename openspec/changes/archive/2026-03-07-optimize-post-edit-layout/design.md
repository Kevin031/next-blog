# 设计文档：优化文章编辑页面布局

## 上下文

### 当前状态

当前文章编辑页面 (`admin-web/src/views/posts/edit.vue`) 采用垂直堆叠布局，使用 Element Plus 的 `ElRow` 和 `ElCol` 组件，所有字段统一使用 `span:18` 宽度。布局结构如下：

```
标题输入框 (span:18)
标签选择器 (span:18)
编辑器类型选择器 (span:18)
编辑器区域 (span:18, 固定高度 500px)
发布设置卡片 (包含可见性开关和保存按钮)
```

### 问题分析

1. **空间利用率低**：在大屏幕（1920px 宽度）上，使用 `span:18` 会导致左右各浪费 3 列宽度
2. **编辑器高度限制**：固定 500px 高度无法充分利用屏幕空间，长文档编辑需要频繁滚动
3. **操作按钮位置不佳**：保存按钮位于页面底部，编辑长文档时需要滚动到底部才能保存
4. **缺少快捷操作**：没有快捷键支持，效率较低
5. **响应式支持不足**：在不同设备上体验不一致

### 约束条件

- **数据库约束**：不增加任何数据库字段，仅使用现有字段（`title`、`tags`、`content_type`、`content`、`visible`）
- **API 约束**：不修改后端 API，使用现有接口
- **依赖约束**：使用现有技术栈（Vue 3、Element Plus、md-editor-v3），不新增依赖
- **向后兼容**：保持现有功能完整性，不破坏现有用户习惯

### 利益相关者

- **内容创作者**：需要流畅的写作体验
- **管理员**：需要高效的文章管理工具
- **开发者**：需要清晰的代码结构和扩展性

---

## 目标 / 非目标

### 目标

- [x] 优化编辑页面空间利用率，在大屏幕上充分利用宽度
- [x] 提高编辑器区域的高度利用率，支持自适应
- [x] 改善操作可见性，使常用操作始终可见
- [x] 添加快捷键支持，提高编辑效率
- [x] 提供全屏编辑模式，支持专注写作
- [x] 实现响应式设计，支持多设备访问
- [x] 预留扩展接口，支持未来功能添加

### 非目标

- [ ] 不增加数据库字段或修改 API 接口
- [ ] 不改变业务逻辑（如保存流程、权限控制）
- [ ] 不实现自动保存功能（属于未来扩展）
- [ ] 不修改 Markdown 编辑器的核心功能
- [ ] 不涉及移动端原生应用开发

---

## 决策

### 1. 布局架构：使用 Flexbox 替代 Element Plus Grid

**决策**：采用 Flexbox 布局替代现有的 `ElRow`/`ElCol` Grid 系统。

**理由**：
- Flexbox 更适合固定高度 + 自适应宽度的场景
- 避免复杂的 span 计算，简化代码
- 更容易实现固定栏（顶部、底部）+ 自适应中间区域的布局
- 响应式断点控制更灵活

**替代方案考虑**：

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| 继续使用 ElGrid | 保持现有技术栈一致 | 难以实现固定栏布局，span 计算复杂 | ❌ |
| 使用 CSS Grid | 布局能力强 | 浏览器兼容性，学习成本 | ❌ |
| 使用 Flexbox | 灵活，适合响应式，代码简洁 | 需要自定义样式 | ✅ |

**实现要点**：
```vue
<template>
  <div class="post-edit-layout">
    <div class="top-bar">...</div>
    <div class="toolbar">...</div>
    <div class="editor-container">
      <ArtMarkdownEditor />
    </div>
    <div class="status-bar">...</div>
  </div>
</template>

<style scoped>
.post-edit-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-bar, .toolbar, .status-bar {
  flex-shrink: 0;
}

.editor-container {
  flex-grow: 1;
  overflow: auto;
  min-height: 600px;
}
</style>
```

---

### 2. 组件拆分策略：创建独立的布局组件

**决策**：将布局拆分为 4 个独立组件，每个组件负责特定功能区域。

**理由**：
- 关注点分离，提高代码可维护性
- 便于测试和复用
- 支持独立优化和扩展
- 降低 `edit.vue` 的复杂度

**组件划分**：

```
PostEditLayout (容器组件)
├── PostEditTopBar (顶部固定栏)
│   ├── BackButton (返回按钮)
│   ├── TitleInput (标题输入框，带字符计数)
│   └── SaveButton (保存按钮)
├── PostEditToolbar (工具栏)
│   ├── TagSelector (标签选择器)
│   └── EditorTypeSwitcher (编辑器类型切换器)
├── PostEditEditorContainer (编辑器容器)
│   ├── ArtMarkdownEditor (Markdown 编辑器)
│   ├── ArtWangEditor (富文本编辑器)
│   └── FullScreenToggle (全屏切换按钮)
└── PostEditStatusBar (状态栏)
    ├── VisibilityToggle (可见性切换)
    └── ShortcutsHint (快捷键提示)
```

**替代方案考虑**：

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| 单一组件 | 简单直接 | 代码量大，难以维护 | ❌ |
| 独立组件 | 可维护性高，易扩展 | 初期工作量较大 | ✅ |
| 混合方案 | 平衡复杂度和灵活性 | 架构不清晰 | ❌ |

---

### 3. 状态管理：继续使用 Composition API，不引入 Pinia Store

**决策**：使用 Vue 3 Composition API 的 `ref` 和 `computed` 管理本地状态，不引入 Pinia Store。

**理由**：
- 编辑页面的状态主要是表单数据，生命周期仅限于该页面
- 不需要跨页面共享状态
- 避免不必要的复杂度和性能开销
- 保持与现有代码风格一致

**替代方案考虑**：

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| 使用 Pinia Store | 状态持久化，跨页面共享 | 复杂度高，过设计 | ❌ |
| Composition API | 简单直接，性能好 | 无法持久化状态 | ✅ |
| Vuex | 与现有项目技术栈不一致 | 已被 Pinia 取代 | ❌ |

**实现要点**：
```typescript
const formData = ref({
  title: '',
  content: '',
  visible: true,
  tagIds: [],
  content_type: undefined
})

const isFullScreen = ref(false)

const charCount = computed(() => formData.value.title.length)
const isOverLimit = computed(() => charCount.value > 100)
```

---

### 4. 全屏实现：使用 CSS 类切换 + ResizeObserver

**决策**：通过 CSS 类切换实现全屏模式，使用 ResizeObserver 监听窗口变化。

**理由**：
- 纯前端实现，不依赖浏览器全屏 API（避免权限问题）
- 状态管理简单，通过布尔值控制
- 响应式支持，自动适应窗口变化
- 退出全屏时保持编辑器状态

**替代方案考虑**：

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| 浏览器 Fullscreen API | 真正的全屏体验 | 需要用户授权，兼容性问题 | ❌ |
| CSS 类切换 | 实现简单，兼容性好 | 非真正的全屏 | ✅ |
| Modal 弹窗 | 真正的覆盖 | 失去上下文，用户体验差 | ❌ |

**实现要点**：
```vue
<template>
  <div :class="['post-edit-layout', { 'fullscreen': isFullScreen }]">
    <!-- 在全屏模式下隐藏顶部栏和工具栏 -->
    <div class="top-bar" v-show="!isFullScreen">...</div>
    <div class="toolbar" v-show="!isFullScreen">...</div>
    <div class="editor-container">...</div>
    <div class="status-bar" v-show="!isFullScreen">...</div>
    <button v-show="isFullScreen" @click="exitFullScreen">退出全屏</button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isFullScreen = ref(false)
let resizeObserver = null

onMounted(() => {
  resizeObserver = new ResizeObserver(() => {
    // 窗口大小变化时的处理
  })
  resizeObserver.observe(document.querySelector('.post-edit-layout'))
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
})
</script>

<style scoped>
.post-edit-layout.fullscreen .top-bar,
.post-edit-layout.fullscreen .toolbar,
.post-edit-layout.fullscreen .status-bar {
  display: none;
}

.post-edit-layout.fullscreen .editor-container {
  height: 100vh;
  min-height: 100vh;
}
</style>
```

---

### 5. 快捷键实现：使用 VueUse 的 useEventListener

**决策**：使用 `@vueuse/core` 的 `useEventListener` 监听键盘事件，实现快捷键保存。

**理由**：
- VueUse 已经是项目依赖，无需新增库
- API 简洁，自动处理事件清理
- 支持组合式 API，与现有代码风格一致
- 支持键盘修饰符（Ctrl、Cmd、Shift）

**替代方案考虑**：

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| 原生 addEventListener | 零依赖 | 需要手动清理，代码冗长 | ❌ |
| VueUse useEventListener | API 简洁，自动清理 | 需要了解 VueUse API | ✅ |
| 第三方快捷键库 | 功能丰富 | 增加依赖，过设计 | ❌ |

**实现要点**：
```typescript
import { useEventListener } from '@vueuse/core'

const savePost = async () => {
  // 保存逻辑
}

onMounted(() => {
  useEventListener(document, 'keydown', (e) => {
    // Ctrl+S 或 Cmd+S
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      savePost()
    }
    // Esc 退出全屏
    if (e.key === 'Escape' && isFullScreen.value) {
      exitFullScreen()
    }
  })
})
```

---

### 6. 响应式断点：使用 CSS Media Queries + Tailwind 或自定义断点

**决策**：使用 CSS Media Queries 定义响应式断点，采用移动优先策略。

**理由**：
- 不依赖前端框架的响应式库
- CSS 级别的响应式，性能最优
- 易于调试和维护
- 与 Element Plus 的响应式系统兼容

**断点定义**：

```scss
// 响应式断点
$breakpoint-mobile: 768px;
$breakpoint-tablet: 1200px;

// 移动优先
.post-edit-layout {
  // 移动端默认样式

  @media (min-width: $breakpoint-mobile) {
    // 平板及以上样式
  }

  @media (min-width: $breakpoint-tablet) {
    // 桌面样式
  }
}
```

**替代方案考虑**：

| 方案 | 优点 | 缺点 | 选择 |
|------|------|------|------|
| CSS Media Queries | 原生支持，性能好 | 需要手写媒体查询 | ✅ |
| Element Plus Hidden/Show | 与框架一致 | 功能有限，不灵活 | ❌ |
| Tailwind CSS | 类名丰富 | 需要引入框架，增加复杂度 | ❌ |

---

### 7. 扩展接口：使用 Vue 插槽（Slots）

**决策**：在工具栏和状态栏组件中提供具名插槽，支持未来功能扩展。

**理由**：
- Vue 原生特性，无需额外库
- 灵活性高，可以插入任意组件
- 不会影响现有布局
- 符合 Vue 的组件设计模式

**实现要点**：

```vue
<!-- PostEditToolbar.vue -->
<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <slot name="left">
        <TagSelector v-model="tags" />
      </slot>
    </div>
    <div class="toolbar-center">
      <slot name="center">
        <!-- 未来可在此插入组件，如 AuthorInput -->
      </slot>
    </div>
    <div class="toolbar-right">
      <slot name="right">
        <EditorTypeSwitcher v-model="contentType" />
      </slot>
    </div>
  </div>
</template>
```

**使用示例（未来扩展）**：

```vue
<!-- 未来可以添加作者输入框 -->
<PostEditToolbar>
  <template #center>
    <AuthorInput v-model="formData.author" />
  </template>
</PostEditToolbar>
```

---

## 风险 / 权衡

### 风险 1：布局重构可能影响现有用户体验

**描述**：从垂直堆叠改为分层布局，用户需要适应新的界面结构，可能导致短期困惑。

**缓解措施**：
- 保持核心功能不变（保存、标签、编辑器类型）
- 提供清晰的操作提示和引导
- 逐步推出，收集用户反馈
- 考虑提供"经典布局"选项作为备选

---

### 风险 2：响应式设计在不同设备上的兼容性

**描述**：新的响应式布局在特定设备或浏览器上可能显示异常。

**缓解措施**：
- 在主流设备上进行测试（iPhone、iPad、Android、各种桌面浏览器）
- 使用渐进增强策略，确保核心功能在低端设备上可用
- 提供降级方案（如移动端简化交互）
- 添加设备检测和优雅降级

---

### 风险 3：全屏模式下的数据同步问题

**描述**：全屏模式下，如果表单数据管理不当，可能导致数据丢失或不同步。

**缓解措施**：
- 使用单一数据源（ref），全屏模式只改变显示样式
- 全屏切换前后进行数据校验
- 提供保存提示，防止意外丢失
- 考虑实现本地存储缓存（未来扩展）

---

### 风险 4：快捷键与浏览器快捷键冲突

**描述**：`Ctrl+S` 等快捷键可能与浏览器或系统快捷键冲突。

**缓解措施**：
- 在事件处理中使用 `e.preventDefault()` 阻止默认行为
- 测试主流浏览器的兼容性
- 提供快捷键开关选项，允许用户自定义
- 在首次使用时提供快捷键说明

---

### 风险 5：组件拆分导致的复杂度增加

**描述**：过度拆分组件可能导致代码复杂度上升，维护成本增加。

**缓解措施**：
- 遵循"按职责拆分"原则，不过度拆分
- 保持组件接口简洁，props 和 events 最小化
- 编写清晰的组件文档和注释
- 定期重构，消除重复代码

---

### 权衡 1：固定高度 vs 滚动页面

**描述**：编辑器区域使用固定高度（min-height: 600px）vs 让整个页面可滚动。

**决策**：采用固定高度 + 编辑器内部滚动。

**理由**：
- 保持顶部栏和工具栏始终可见
- 编辑器滚动更符合写作场景
- 避免页面整体滚动导致的视觉跳跃

---

### 权衡 2：字符计数实时显示 vs 提交时验证

**描述**：标题字符计数实时显示 vs 只在提交时验证。

**决策**：采用实时计数 + 提交验证双重保障。

**理由**：
- 实时反馈提升用户体验
- 提交时验证确保数据完整性
- 符合现代 UX 最佳实践

---

### 权衡 3：纯前端全屏 vs 浏览器全屏 API

**描述**：CSS 类切换实现全屏 vs 使用浏览器的 Fullscreen API。

**决策**：采用 CSS 类切换。

**理由**：
- 避免用户授权弹窗的干扰
- 兼容性更好
- 实现简单，维护成本低

---

## 迁移计划

### 阶段 1：组件创建（1-2 天）

- [ ] 创建 `PostEditTopBar` 组件
- [ ] 创建 `PostEditToolbar` 组件
- [ ] 创建 `PostEditStatusBar` 组件
- [ ] 创建 `FullScreenToggle` 组件
- [ ] 更新 `PostEditLayout` 容器组件

### 阶段 2：布局重构（1-2 天）

- [ ] 重构 `edit.vue` 的布局结构
- [ ] 实现四层布局（顶部栏、工具栏、编辑器、状态栏）
- [ ] 实现 Flexbox 响应式布局
- [ ] 调整样式和间距

### 阶段 3：交互功能实现（2-3 天）

- [ ] 实现快捷键保存功能（Ctrl+S / Cmd+S）
- [ ] 实现标题字符计数显示
- [ ] 实现全屏编辑模式
- [ ] 实现编辑器高度自适应
- [ ] 添加加载状态和成功提示

### 阶段 4：响应式优化（1-2 天）

- [ ] 实现桌面版布局（> 1200px）
- [ ] 实现平板版布局（768px - 1200px）
- [ ] 实现移动版布局（< 768px）
- [ ] 跨设备测试和调试

### 阶段 5：测试和优化（1-2 天）

- [ ] 功能测试（新建文章、编辑文章、保存、发布）
- [ ] 跨浏览器测试（Chrome、Firefox、Safari、Edge）
- [ ] 跨设备测试（桌面、平板、手机）
- [ ] 性能优化（加载速度、渲染性能）
- [ ] UX 优化（动画、反馈、提示）

### 阶段 6：部署和监控（1 天）

- [ ] Code Review 和合并
- [ ] 部署到测试环境
- [ ] 用户验收测试（UAT）
- [ ] 部署到生产环境
- [ ] 监控和收集反馈

### 回滚策略

如果新布局出现问题，可以：
1. 快速回滚到旧的 `edit.vue` 代码
2. 通过 feature flag 控制新旧布局切换
3. 提供"切换回经典布局"的选项给用户

---

## 开放问题

### 问题 1：是否需要实现自动保存功能？

**状态**：待定

**背景**：自动保存可以防止数据丢失，但增加了复杂度和服务器负载。

**考虑因素**：
- 用户需求和反馈
- 技术实现复杂度
- 服务器性能影响
- 与手动保存的交互冲突

**决策时机**：在首次部署后根据用户反馈决定

---

### 问题 2：是否需要支持拖拽调整布局？

**状态**：待定

**背景**：部分用户可能希望自定义工具栏位置或隐藏某些元素。

**考虑因素**：
- 开发成本 vs 用户收益
- 布局复杂度增加
- 用户体验一致性

**决策时机**：未来扩展阶段评估

---

### 问题 3：是否需要实现离线编辑功能？

**状态**：待定

**背景**：离线编辑可以支持断网场景，但需要实现数据同步机制。

**考虑因素**：
- 用户实际需求
- 技术实现复杂度（Service Worker、IndexedDB）
- 冲突解决策略

**决策时机**：需要进一步调研和用户调研

---

### 问题 4：是否需要支持 Markdown 的实时预览独立窗口？

**状态**：待定

**背景**：双屏用户可能希望在一个屏幕上编辑，另一个屏幕上预览。

**考虑因素**：
- 用户群体规模
- 实现复杂度（弹窗、状态同步）
- 与现有实时预览功能的重叠

**决策时机**：根据用户反馈评估
