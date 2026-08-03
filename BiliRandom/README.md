# BiliRandom

打破 B站信息茧房的纯静态随机探索工具。

## ✨ 功能一览

| 类型 | 图标 | 数据来源 | 跳转链接 |
|---|---|---|---|
| 视频 | 🎬 | 综合搜索 / 分区最新 / 排行榜 | `bilibili.com/video/BV...` |
| 专栏 | 📝 | 最新投稿 + 搜索兜底 | `bilibili.com/read/cv...` |
| 相簿 | 🖼️ | 热门列表 + 搜索兜底 | `h.bilibili.com/...` |
| 番剧 | 🎞️ | 番剧/影视双接口互备 | `bangumi/play/ss...` |
| 影视 | 🎥 | 影视搜索 + 番剧兜底 | `bangumi/play/ep...` |
| 音频 | 🎵 | 音频搜索 | `bilibili.com/audio/au...` |
| 话题 | 🔥 | 话题搜索 + 搜索兜底 | `bilibili.com/topic/...` |
| 动态 | 💬 | 动态搜索 | `t.bilibili.com/...` |
| 用户 | 👤 | 用户搜索 | `space.bilibili.com/...` |
| 直播间 | 🏠 | 直播推荐 | `live.bilibili.com/...` |
| 主播 | 🎤 | 主播搜索 + 直播兜底 | `space.bilibili.com/...` |

## 🎨 设计特点

- **Logo 渐变**：固定左上胖次蓝 → 右下少女粉，不可更改
- **统一颜色系统**：11 种类型各有专属色，Tab / Tag / 圆环 / 按钮 / 阴影 / 统计点全部联动
- **深浅色三态**：浅色 / 深色 / 跟随系统
- **二级分区全覆盖**：动画/音乐/游戏/科技/鬼畜/生活/知识/影视/美食
- **筛选器默认展开**：排序 / 时长 / 分区 / 子分区 / 时间 / 来源
- **批量随机**：1-20 条
- **历史记录**：本地保存 50 条，带类型色点

## 🚀 部署指南

### 第一步：部署 Cloudflare Worker 反代

1. 注册 [workers.cloudflare.com](https://workers.cloudflare.com/)（免费）
2. 安装 Wrangler CLI：`npm install -g wrangler`
3. 登录：`wrangler login`
4. 把 `worker.js` 和 `wrangler.toml` 放到同一目录
5. 部署：`wrangler deploy`
6. 记下你的 Worker 地址，类似：
   ```
   https://bilirandom-proxy.<你的子域>.workers.dev
   ```

### 第二步：填入反代地址

打开 `BiliRandom.html`，找到第 465 行附近：

```javascript
var PROXY = ''; // 例如 'https://your-worker.your-subdomain.workers.dev'
```

改成你的 Worker 地址（**保留引号**）：

```javascript
var PROXY = 'https://bilirandom-proxy.<你的子域>.workers.dev';
```

### 第三步：部署到 GitHub Pages

1. 在 [github.com](https://github.com/) 新建仓库，名：`<用户名>.github.io`
2. 把改好的 `BiliRandom.html` 上传，重命名为 `index.html`
3. Settings → Pages → Source 选 `main` 分支 → Save
4. 等 1-3 分钟，访问 `https://<用户名>.github.io/`

### 只在本机用（不部署）

```bash
# 任选其一
npx serve .
python3 -m http.server 8080
```

装 VS Code 的 Live Server 插件 → 右键 HTML → Open with Live Server

## 📁 文件说明

| 文件 | 用途 |
|---|---|
| `BiliRandom.html` | 主程序，单文件，浏览器直接打开 |
| `worker.js` | Cloudflare Worker 反代脚本（带 60 秒边缘缓存） |
| `wrangler.toml` | Worker 部署配置 |
| `README.md` | 本文件 |

## 💰 成本

| 服务 | 套餐 | 额度 | 本项目消耗 |
|---|---|---|---|
| Cloudflare Workers | Free | 10 万次/天 | 单人日均几十次，远不到上限 |
| GitHub Pages | Free | 1 GB 存储 + 100 GB/月带宽 | 几十 KB 静态文件，可忽略 |

**结论：永久免费。**

## ⚠️ 免责声明

本项目与哔哩哔哩官方无任何隶属关系，仅使用公开 API 获取公开数据。
品牌色值为 B站公开配色方案，相关知识产权归哔哩哔哩所有。
详见页面底部「免责声明」折叠面板。
