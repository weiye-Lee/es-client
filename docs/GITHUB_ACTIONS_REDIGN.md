# GitHub Actions 重新设计方案

## 当前问题分析

### 1. pnpm 版本不匹配
- **问题**: CI 使用 pnpm v8，但项目使用 pnpm v9 (lockfile v9.0)
- **错误**: `ERR_PNPM_NO_LOCKFILE`
- **解决方案**: 将 pnpm 版本升级到 v9

### 2. 打包路径和方式错误
- **问题**: Vite 配置输出到 `src-chrome/es-client/` 等目录，但 workflow 打包的是 `src-chrome/`
- **问题**: 直接打包文件夹会导致 zip 中包含目录层级
- **解决方案**: 
  - 正确识别构建输出目录
  - 使用 `cd dist-dir && zip -r ../extension.zip .` 方式打包

## 新的工作流设计

### 1. CI 工作流 (build.yml)
用于每次推送/PR时验证构建

```yaml
name: Build

on:
  push:
    branches: [ main, master, develop ]
  pull_request:
    branches: [ main, master, develop ]

jobs:
  build:
    name: 构建浏览器扩展
    runs-on: ubuntu-latest
    
    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 设置 pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.5.1'
          cache: 'pnpm'

      - name: 安装依赖
        run: pnpm install --frozen-lockfile

      - name: 构建 Chrome 扩展
        run: pnpm build:chrome

      - name: 构建 Edge 扩展
        run: pnpm build:edge

      - name: 构建 Firefox 扩展
        run: pnpm build:firefox

      - name: 上传构建产物
        uses: actions/upload-artifact@v4
        with:
          name: browser-extensions
          path: |
            src-chrome/
            src-edge/
            src-firefox/
          retention-days: 7
```

### 2. CD 工作流 (release.yml)
用于发布新版本

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    name: 发布浏览器扩展
    runs-on: ubuntu-latest
    
    steps:
      - name: 检出代码
        uses: actions/checkout@v4

      - name: 设置 pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.5.1'
          cache: 'pnpm'

      - name: 安装依赖
        run: pnpm install --frozen-lockfile

      - name: 构建 Chrome 扩展
        run: pnpm build:chrome

      - name: 构建 Edge 扩展
        run: pnpm build:edge

      - name: 构建 Firefox 扩展
        run: pnpm build:firefox

      - name: 打包 Chrome 扩展
        run: |
          cd src-chrome/es-client
          zip -r ../../es-client-chrome.zip .

      - name: 打包 Edge 扩展
        run: |
          cd src-edge/es-client
          zip -r ../../es-client-edge.zip .

      - name: 打包 Firefox 扩展
        run: |
          cd src-firefox/es-client
          zip -r ../../es-client-firefox.zip .

      - name: 获取版本号
        id: package-version
        uses: martinbeentjes/npm-get-version-action@v1.3.1

      - name: 创建 GitHub Release
        uses: ncipollo/release-action@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          draft: true
          prerelease: false
          tag: ${{ github.ref_name }}
          name: ${{ github.ref_name }}
          artifacts: |
            es-client-chrome.zip
            es-client-edge.zip
            es-client-firefox.zip
          body: |
            ## 变更日志
            
            ## 如何使用 es-client
            ### 浏览器扩展
            * [Chrome 扩展 .zip](https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/es-client-chrome.zip)
            * [Edge 扩展 .zip](https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/es-client-edge.zip)
            * [Firefox 扩展 .zip](https://github.com/${{ github.repository }}/releases/download/${{ github.ref_name }}/es-client-firefox.zip)
            * [Google Chrome](https://chromewebstore.google.com/detail/es-client/pkhmgepniefdigphghbolofjgbnhnhfd)
            * [Mozilla Firefox](https://addons.mozilla.org/zh-CN/firefox/addon/es-client/)
            * [Microsoft Edge](https://microsoftedge.microsoft.com/addons/detail/esclient/aonamamifdfigcflbeokdndfappnmogo)
            ### 其他方式
            * [uTools插件](https://u.tools/plugins/detail/es-client/)
            * [主页](https://es-client.esion.xyz)