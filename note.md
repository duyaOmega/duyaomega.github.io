---
layout: default
title: Note
---

# 笔记

这里收录的是所有的笔记类文章

<ul>
  {% for post in site.categories.note %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <small>{{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>