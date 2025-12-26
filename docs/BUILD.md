# ES-Client 打包指南

## 项目概述

ES-Client 是一个基于 Vue 3 + TypeScript + Vite 构建的 Elasticsearch 客户端，支持多种部署方式：

1. **Web 应用**：可部署到服务器，作为独立网站运行
2. **浏览器插件**：支持 Chrome、Edge、Firefox 浏览器插件形式

## 环境要求

- Node.js >= 18.x
- npm 或 pnpm

## 打包方式

### 1. Web 应用打包

#### 构建命令
```bash
# 使用 npm
npm run build

# 或使用 pnpm
pnpm build
```

#### 输出位置
- 输出目录：`dist/`
- 包含：HTML、CSS、JS 等静态文件

#### 部署方式
将 `dist/` 目录下的文件部署到 Web 服务器（如 Nginx、Apache）即可。

### 2. 浏览器插件打包

项目支持三种浏览器插件版本：

#### Chrome 插件
```bash
npm run build:chrome
# 或
pnpm build:chrome
```

#### Edge 插件
```bash
npm run build:edge
# 或
pnpm build:edge
```

#### Firefox 插件
```bash
npm run build:firefox
# 或
pnpm build:firefox
```

#### 输出位置
- Chrome：`src-chrome/es-client/`
- Edge：`src-edge/es-client/`
- Firefox：`src-firefox/es-client/`

每个输出目录包含：
- `index.html` - 主页面
- `assets/` - 静态资源（JS、CSS、字体等）
- `manifest.json` - 插件配置文件

### 3. 插件安装方式

#### Chrome/Edge 安装
1. 打开浏览器，访问 `chrome://extensions/` (Chrome) 或 `edge://extensions/` (Edge)
2. 开启"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择对应的输出目录：
   - Chrome：`src-chrome/`
   - Edge：`src-edge/`

#### Firefox 安装
1. 打开 Firefox，访问 `about:debugging`
2. 点击"此 Firefox" → "临时加载附加组件"
3. 选择 `src-firefox/manifest.json` 文件

### 4. 发布到应用商店

#### Chrome Web Store
1. 压缩 `src-chrome/` 目录为 ZIP 文件
2. 访问 [Chrome Web Store 开发者控制台](https://chrome.google.com/webstore/devconsole/)
3. 上传 ZIP 文件并填写相关信息

#### Microsoft Edge Add-ons
1. 压缩 `src-edge/` 目录为 ZIP 文件
2. 访问 [Microsoft Edge 开发者控制台](https://partner.microsoft.com/dashboard/microsoftedge/)
3. 上传 ZIP 文件并填写相关信息

#### Firefox Add-ons
1. 压缩 `src-firefox/` 目录为 ZIP 文件
2. 访问 [Firefox Add-ons 开发者中心](https://addons.mozilla.org/developers/)
3. 上传 ZIP 文件并填写相关信息

## 技术细节

### 构建配置
- 使用 Vite 作为构建工具
- 根据 `mode` 参数切换输出目录和配置
- Chrome/Edge 使用 Manifest V3
- Firefox 使用 Manifest V2

### 插件特性
- **Manifest V3** (Chrome/Edge): 现代插件架构，支持 Service Worker
- **Manifest V2** (Firefox): 兼容性更好的旧版架构
- 权限配置：主机权限 `*://*/` 用于访问 Elasticsearch API

### 文件结构
```
src-chrome/
├── es-client/          # 构建输出
│   ├── index.html
│   ├── assets/
│   └── ...
├── manifest.json       # 插件配置
├── icons/             # 插件图标
└── src/               # 插件后台脚本等
```

## 注意事项

1. **版本号**：确保 `manifest.json` 中的版本号与 `package.json` 保持一致
2. **图标**：插件需要准备不同尺寸的图标文件
3. **权限**：根据需要调整 `manifest.json` 中的权限配置
4. **测试**：在发布前务必在目标浏览器中测试插件功能
5. **更新**：插件更新时需要重新构建并重新加载

## 故障排除

### 构建失败
- 检查 Node.js 版本是否 >= 18
- 确认依赖已正确安装：`npm install`
- 查看构建错误信息并修复

### 插件无法加载
- 检查 `manifest.json` 格式是否正确
- 确认输出目录结构完整
- 查看浏览器开发者工具的错误信息

### 网络请求失败
- 检查插件权限配置
- 确认 Elasticsearch 服务允许跨域访问</content>
<parameter name="filePath">e:\Users\weiye\VSCODE\es-client\docs\BUILD.md