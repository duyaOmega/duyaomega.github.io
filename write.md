---
layout: default
title: 写文章
permalink: /write/
hero_title: 写文章
hero_description: 在这里整理标题、分类、标签和正文，然后交给 GitHub 完成安全发布。
---

<section class="content-panel paper writer-panel">
  <form class="writer-form" id="post-writer">
    <div class="writer-field">
      <label for="existing-post">编辑已有文章</label>
      <div class="writer-load-row">
        <select id="existing-post" name="existingPost">
          <option value="">新建文章</option>
        </select>
        <button class="writer-button secondary" type="button" id="load-existing-post">加载</button>
      </div>
      <input id="post-path" name="postPath" type="hidden">
    </div>

    <div class="writer-field">
      <label for="post-title">标题</label>
      <input id="post-title" name="title" type="text" placeholder="例如：望断清波无双鲤" required>
    </div>

    <div class="writer-row">
      <div class="writer-field">
        <label for="post-category">分类</label>
        <select id="post-category" name="category" required>
          <option value="article">文学类</option>
          <option value="note">笔记类</option>
          <option value="other">其他</option>
        </select>
      </div>

      <div class="writer-field">
        <label for="post-date">发布日期</label>
        <input id="post-date" name="date" type="date">
      </div>
    </div>

    <div class="writer-row">
      <div class="writer-field">
        <label for="post-tags">标签</label>
        <input id="post-tags" name="tags" type="text" placeholder="novel, campus, note">
      </div>

      <div class="writer-field">
        <label for="post-slug">自定义链接名</label>
        <input id="post-slug" name="slug" type="text" placeholder="my-new-post">
      </div>
    </div>

    <div class="writer-field">
      <label for="post-excerpt">摘要</label>
      <textarea id="post-excerpt" name="excerpt" rows="3" placeholder="简短介绍这篇文章。"></textarea>
    </div>

    <div class="writer-editor" id="writer-editor">
      <div class="writer-pane writer-source-pane">
        <label for="post-body">正文</label>
        <textarea id="post-body" name="body" rows="18" placeholder="在这里写正文，支持 Markdown。" required></textarea>
      </div>

      <button class="writer-resizer" type="button" id="writer-resizer" aria-label="拖动调整编辑和预览宽度"></button>

      <div class="writer-pane writer-preview-pane">
        <label for="post-preview">预览</label>
        <div class="writer-preview post-content" id="post-preview" aria-live="polite"></div>
      </div>
    </div>

    <div class="writer-actions">
      <button class="writer-button" type="submit">去 GitHub 发布</button>
      <button class="writer-button secondary" type="button" id="copy-issue-body">复制 Issue 内容</button>
      <span class="writer-status" id="writer-status" role="status"></span>
    </div>
  </form>
</section>

<script src="{{ '/assets/js/write.js' | relative_url }}"></script>
