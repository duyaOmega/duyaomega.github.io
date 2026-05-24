# duyaomega.github.io

渡鸦的小窝，基于 Jekyll 和 GitHub Pages。

## 写文章

推荐使用站内写作页发布文章：

1. 打开 `/write/`。
2. 填写标题、分类、标签、摘要和正文。
3. 点击 `去 GitHub 发布`。
4. 在 GitHub 页面确认提交 issue。
5. GitHub Actions 会自动生成 `_posts/YYYY-MM-DD-slug-issue.md`，并部署 GitHub Pages。

也可以直接打开仓库的 `Issues` 页面，点击 `New issue`，选择 `发布文章` 表单。

文章分类目前有：

- `article`: 文学类
- `note`: 笔记类
- `other`: 其他

为了避免公开仓库里任何人都能发文，自动发布 workflow 只接受仓库 owner 创建、标题以 `[post]` 开头的 issue。

## 后台登录

后台使用 Decap CMS 的 GitHub backend。GitHub Pages 只能托管静态文件，所以登录需要额外配置一个 OAuth 认证代理，例如 Netlify OAuth provider 或自建 Decap CMS auth provider。

当前 `admin/config.yml` 先按 Netlify OAuth provider 的形式配置：

```yml
backend:
  name: github
  repo: duyaOmega/duyaomega.github.io
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
```

认证配置完成后，不需要手写代码即可在网页后台新增、编辑、发布文章。
