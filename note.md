---
layout: default
title: Note
permalink: /note/
hero_title: 笔记类
hero_description: 课程、技术、阅读和一些以后可能会感谢自己的记录。
---

<section class="content-panel paper">
  <h1>笔记</h1>

  <p>这里收录的是所有的笔记类文章。</p>

  <ul class="post-list">
    {% for post in site.categories.note %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
      </li>
    {% endfor %}
  </ul>
</section>
