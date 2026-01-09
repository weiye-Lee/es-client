<p align="center">
<a href="./README.md">简体中文</a> | <a href="./README.en.md">English</a>
</p>

<p align="center">
<img src="./public/logo.png" alt="ES-Client Logo" width="120">
</p>

<h1 align="center">ES-Client (Enhanced Edition)</h1>

<p align="center"><strong>A Cleaner, More Intuitive, and Powerful Elasticsearch Desktop Client</strong></p>
<p align="center">
  <em>Deeply Optimized & Enhanced based on v3.2.2 | Built for Efficient Development</em>
</p>

---

##  What's New in Enhanced Edition

This project is a fork of the excellent [ES-Client](https://gitee.com/qiaoshengda/es-client). We have deeply customized and optimized it to provide a smoother and purer development experience:

### 1.  Purely Private & Clean
* **No Tracking**: We have completely removed user behavior tracking anchors and the `/send` interface. Your operational data is secure and totally private. Whether in an intranet environment or handling sensitive data, you don't need to worry about any implicit data reporting.

### 2.  Modernized UI
* **Top Index Navigation**: Replaced the original left-sidebar index/alias list (which took up horizontal space) with a modern **Top Index Quick Selector**.
* **Global Search Experience**: Integrated a powerful search bar at the top for quick index location. This change frees up screen space, providing a wider view for data and a shorter operation path.

### 3.  Smart Data Browsing
* **Query Intelligent Completion**: Added **Field Auto-completion & Selection** when building query conditions in the **MUST** / **SHOULD** / **MUST_NOT** areas of the Data Browse page.
* **No More Memorizing**: Forget about checking Mappings repeatedly or memorizing complex field names. Just type a prefix to get precise hints, making complex query construction smoother than ever.

### 4.  Enhanced Custom Headers
* **Field Visualization**: The custom header settings page now supports **Field Type Display**. Icons clearly show if a field is Keyword, Text, Long, or Date.
* **Header Search**: Facing thousands of fields in a wide table? The new **Quick Search Filter** lets you rapidly find and check the columns you care about, easily customizing your exclusive data view.

---

##  Core Features Inherited

We perfectly retained all the excellent genes of the original ES-Client, keeping it the lightweight tool you know:

*  **Lightweight & Efficient**: No server deployment, no team dependencies, out-of-the-box, standalone.
*  **Visual Management**: One-stop graphical configuration for Index Creation, Mapping Settings, and ILM Lifecycle Policies.
*  **Safe Operations**: Supports `_update_by_query` / `_delete_by_query` with **Operation Preview + Real-time Progress Bar + Cancellation**, eliminating accidental deletion risks.
*  **Deep Diagnostics**: Built-in Slow Query Analysis Panel, integrated Explain & Profile visualization to quickly locate non-indexed fields, uneven shards, or script bottlenecks.
*  **Data Export**: Supports streaming export to CSV / Excel / JSON, with resume capability and no lag for large tasks.

##  Installation & Build

### Browser Extensions
Check the [Releases](../../releases) page to download the latest extension packages:
* **Edge**: Download `es-client-edge-v*.zip`, go to `edge://extensions`, enable Developer Mode -> Load Unpacked (or drag & drop).
* **Firefox**: Download `es-client-firefox-v*.zip`, go to `about:debugging` -> This Firefox -> Load Temporary Add-on.

### Build from Source
If you wish to build from source yourself:

```bash
# Install dependencies
pnpm install

# Build Edge Extension (output to src-edge/es-client)
pnpm build:edge

# Build Firefox Extension (output to src-firefox/es-client)
pnpm build:firefox
```

##  Acknowledgements

This project is a small exploration standing on the shoulders of giants. Special thanks to the original author **[Esion](https://gitee.com/qiaoshengda)** (qiaoshengda) for developing such an excellent `es-client` project, which has provided great convenience to the community.

Original Project:
* Gitee: [https://gitee.com/qiaoshengda/es-client](https://gitee.com/qiaoshengda/es-client)
* GitHub: [https://github.com/q2316367743/es-client](https://github.com/q2316367743/es-client)

If you like this Enhanced Edition, please also consider giving the original project a Star .

---

<p align="center">
Made with  for Elasticsearch Developers
</p>
