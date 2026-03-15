---
layout: default
title: Article
---

# 文字

这里收录的是所有的文学类作品

<ul>
  {% for post in site.categories.article %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <small>{{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>