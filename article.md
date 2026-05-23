---
layout: default
title: Article
permalink: /article/
hero_title: 文学类
hero_description: 小说、随笔，以及一些适合在夜里慢慢读完的文字。
---

<section class="content-panel paper">
  <h1>文字</h1>

  <p>这里收录的是所有的文学类作品。</p>

  <ul class="post-list">
    {% for post in site.categories.article %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
      </li>
    {% endfor %}
  </ul>
</section>
