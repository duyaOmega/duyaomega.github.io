---
layout: default
title: Other
---

# 其他

这里收录暂时不适合放进文学类或笔记类的文章。

<ul>
  {% for post in site.categories.other %}
    <li>
      <a href="{{ post.url }}">{{ post.title }}</a>
      <small>{{ post.date | date: "%Y-%m-%d" }}</small>
    </li>
  {% endfor %}
</ul>
