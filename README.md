# duyaomega.github.io

渡鸦的小窝，基于 Jekyll 和 GitHub Pages。

## 写文章

上线后访问 `/admin/` 进入内容后台。文章会保存到 `_posts`，图片会保存到 `assets/uploads`，推送到 `main` 后 GitHub Actions 会自动重新部署。

文章分类目前有：

- `article`: 文学类
- `note`: 笔记类
- `other`: 其他

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
