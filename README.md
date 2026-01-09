<p align="center">
<a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
</p>

<p align="center">
<img src="./public/logo.png" alt="ES-Client Logo" width="120">
</p>

<h1 align="center">ES-Client (Enhanced Edition)</h1>

<p align="center"><strong>更纯净、更直观、更强大的 Elasticsearch 桌面客户端</strong></p>
<p align="center">
  <em>基于 v3.2.2 版本深度优化与增强 | 专为高效开发而生</em>
</p>

---

## 🌟 增强版特性 (What's New)

本项目 fork 自优秀的 [ES-Client](https://gitee.com/qiaoshengda/es-client)，并在其基础上进行了以下深度定制与优化，致力于提供更加流畅和纯净的开发体验：

### 1. 🛡️ 纯净隐私体验
* **移除追踪**: 彻底移除了页面记录用户操作行为的锚点及 `/send` 接口，确保您的操作数据不仅安全，而且完全私有。无论是内网环境还是敏感数据操作，都无需担心任何隐性上报。

### 2. 🖥️ 现代化 UI 重构
* **顶部索引导航**: 移除了原版左侧占用大量水平空间的索引与别名列表，改为更为现代的 **顶部索引快速选择器**。
* **全局搜索体验**: 顶部集成强大的搜索框，键入即可快速定位索引。这一改变极大释放了屏幕空间，让数据展示区域更宽阔，视觉更清爽，操作路径更短。

### 3. 🧠 智能数据浏览
* **Query 智能补全**: 在数据浏览页面的 **MUST** / **SHOULD** / **MUST_NOT** 区域构建查询条件时，新增 **字段自动补全与选择** 功能。
* **告别记忆**: 不再需要反复查阅 Mapping 或记忆复杂的字段名，输入前缀即可获得精准提示，构建复杂查询从未如此丝滑。

### 4. 📊 增强型自定义表头
* **字段可视化**: 自定义表头设置页面现已支持 **显示字段类型**，是 Keyword 还是 Text，是 Long 还是 Date，图标化展示一目了然。
* **表头搜索**: 面对大宽表成百上千的字段，新增 **快速搜索过滤** 功能，让您能迅速找到并勾选关注的列，轻松定制专属的数据视图。

---

## 💡 传承核心功能

我们完美保留了原版 ES-Client 的所有优秀基因，依然是您熟悉的那个轻量级神器：

* ✅ **轻量高效**: 无需部署服务，无团队依赖，开箱即用，单机运行。
* ✅ **可视化管理**: 索引创建、Mapping 设置、ILM 生命周期策略一站式图形化配置。
* ✅ **安全操作**: 支持 `_update_by_query` / `_delete_by_query`，提供 **操作预览 + 实时进度条 + 随时取消** 三重保障，彻底杜绝误删风险。
* ✅ **深度诊断**: 内置慢查询分析面板，集成 Explain 与 Profile 可视化，快速定位未索引字段、分片不均或脚本性能瓶颈。
* ✅ **数据导出**: 支持流式导出 CSV / Excel / JSON，断点续导，大任务不卡顿。

## 📥 安装与构建

### 浏览器插件
查看 [Releases](../../releases) 页面下载最新构建的插件包：
* **Edge**: 下载 `es-client-edge-v*.zip`，在 `edge://extensions` 页面开启开发者模式 -> 加载解压的扩展。
* **Firefox**: 下载 `es-client-firefox-v*.zip`，在 `about:debugging` -> 此 Firefox -> 临时载入附加组件。

### 源码构建
如果您希望自己从源码构建：

```bash
# 安装依赖
pnpm install

# 构建 Edge 插件 (输出至 src-edge/es-client)
pnpm build:edge

# 构建 Firefox 插件 (输出至 src-firefox/es-client)
pnpm build:firefox
```

## 🙏 致谢 (Acknowledgements)

本项目是站在巨人的肩膀上进行的微小探索。特别感谢原作者 **[Esion](https://gitee.com/qiaoshengda)** (qiaoshengda) 开发了如此优秀的 `es-client` 项目，为社区提供了极大的便利。

原项目地址：
* Gitee: [https://gitee.com/qiaoshengda/es-client](https://gitee.com/qiaoshengda/es-client)
* GitHub: [https://github.com/q2316367743/es-client](https://github.com/q2316367743/es-client)

如果您喜欢这个增强版，也请不吝给原项目点一个 Star ⭐️。

---

<p align="center">
Made with ❤️ for Elasticsearch Developers
</p>
