---
layout: default
title: Other
permalink: /other/
hero_title: 其他
hero_description: 暂时还没有被归入文学或笔记的内容。
---

<section class="content-panel paper">
  <h1>其他</h1>

  <p>这里收录暂时不适合放进文学类或笔记类的文章。</p>

  <ul class="post-list">
    {% for post in site.categories.other %}
      <li>
        <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
        <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
      </li>
    {% endfor %}
  </ul>
</section>
