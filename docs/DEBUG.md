# ES-Client 调试文档

## 项目概述

ES-Client 是一个轻量、高效、安全的 Elasticsearch 桌面客户端，基于 Vue 3 + TypeScript + Vite 5 + Arco Design 构建。

## 环境要求

- **Node.js**: 建议使用 v18.x 或更高版本
- **包管理器**: pnpm（推荐）或 npm
- **操作系统**: Windows / macOS / Linux

## 快速开始

### 1. 配置 npm 镜像（国内用户推荐）

```bash
# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 或使用 nrm 管理镜像
npm install -g nrm
nrm use taobao
```

### 2. 安装依赖

```bash
# 使用 pnpm（推荐）
pnpm install

# 或使用 npm
npm install
```

### 3. 启动开发服务器

```bash
# 使用 pnpm
pnpm dev

# 或使用 npm
npm run dev
```

启动后，开发服务器将在本地运行，默认访问地址为：`http://localhost:5173`

> 注意：`--host` 参数已在脚本中配置，可以通过局域网 IP 访问

### 4. 构建项目

```bash
# 通用构建
pnpm build

# 构建 Edge 浏览器插件版本
pnpm build:edge

# 构建 Chrome 浏览器插件版本
pnpm build:chrome

# 构建 Firefox 浏览器插件版本
pnpm build:firefox
```

### 5. 预览构建结果

```bash
pnpm preview
```

## 项目结构

```
es-client/
├── docs/                    # 文档目录
├── public/                  # 静态资源
├── src/                     # 源代码
│   ├── algorithm/           # 算法相关
│   ├── assets/              # 资源文件
│   ├── components/          # 组件
│   ├── data/                # 数据定义
│   ├── domain/              # 领域模型
│   ├── entity/              # 实体定义
│   ├── enumeration/         # 枚举定义
│   ├── global/              # 全局配置
│   ├── icon/                # 图标组件
│   ├── module/              # 模块
│   ├── page/                # 页面
│   ├── App.vue              # 根组件
│   └── main.ts              # 入口文件
├── img/                     # 图片资源
├── .github/                 # GitHub 配置
├── .vscode/                 # VSCode 配置
├── env/                     # 环境变量配置
├── index.html               # HTML 入口
├── package.json             # 项目配置
├── tsconfig.json            # TypeScript 配置
└── vite.config.ts           # Vite 配置
```

## 开发模式说明

项目支持多种构建模式：

| 模式 | 命令 | 输出目录 | 说明 |
|------|------|----------|------|
| web | `pnpm dev` | - | 开发模式，用于本地调试 |
| edge | `pnpm build:edge` | `src-edge/es-client` | Edge 浏览器插件 |
| chrome | `pnpm build:chrome` | `src-chrome/es-client` | Chrome 浏览器插件 |
| firefox | `pnpm build:firefox` | `src-firefox/es-client` | Firefox 浏览器插件 |

## 技术栈

- **前端框架**: Vue 3.5+
- **构建工具**: Vite 5
- **UI 框架**: Arco Design Vue
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **编辑器**: Monaco Editor
- **本地存储**: Dexie (IndexedDB)
- **HTTP 客户端**: Axios

## 调试技巧

### 1. 使用 Vue DevTools

安装 Vue DevTools 浏览器扩展，可以方便地调试 Vue 组件状态。

### 2. 使用 vConsole

项目集成了 vConsole，可在移动端或特殊环境下使用。

### 3. 查看网络请求

使用浏览器开发者工具的 Network 面板查看与 Elasticsearch 的通信。

### 4. Monaco Editor 调试

编辑器相关代码位于 [`src/components/monaco-editor/`](src/components/monaco-editor/) 目录。

## 常见问题

### Q: 启动失败，提示端口被占用？

A: 修改 vite.config.ts 中的端口配置，或关闭占用端口的程序。

### Q: 依赖安装失败？

A: 尝试清除缓存后重新安装：
```bash
pnpm store prune
pnpm install
```

### Q: 如何连接本地 Elasticsearch？

A: 启动项目后，在界面中添加连接，输入 Elasticsearch 地址（如 `http://localhost:9200`）即可。

## 相关链接

- [官网](https://es-client.esion.xyz)
- [文档中心](https://es-client.esion.xyz/docs/app/es-client-open)
- [Gitee 仓库](https://gitee.com/qiaoshengda/es-client)
- [GitHub 仓库](https://github.com/q2316367743/es-client)