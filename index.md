---
layout: default
title: 渡鸦的小窝
hero_title: 渡鸦的小窝
hero_description: 笔记、文学写作和各种乱七八糟的东西。你愿意倾听我的絮语吗？
---

<div class="home-grid">
  <section class="content-panel paper">
    <h2>我是谁</h2>
    <ul>
      <li>你可以称呼我为 渡鸦/迷迭鸦/duya/RavenX/<del>猫娘/犬娘/迷迭香小姐的狗</del></li>
      <li>北京大学信科在读鼠鼠，大概会走 cs 专业</li>
      <li>b 站非著名 up/低质量小说产出者/（前）笑话公众号运营者</li>
    </ul>

    <h2>这里有什么</h2>
    <ul>
      <li>质量低劣的我的小说</li>
      <li>各种各样的杂文（或许吧）</li>
      <li>一部分自觉较有用的笔记。由于图片格式等原因，从 Obsidian 迁移笔记比较麻烦，所以暂时搁置了，等以后有空再说吧</li>
    </ul>

    <div class="category-grid">
      <a class="category-card" href="{{ '/article/' | relative_url }}">
        <strong>文学类</strong>
        <span>小说、随笔和一些不太安分的文字</span>
      </a>
      <a class="category-card" href="{{ '/note/' | relative_url }}">
        <strong>笔记类</strong>
        <span>课程、技术、阅读与零散记录</span>
      </a>
      <a class="category-card" href="{{ '/other/' | relative_url }}">
        <strong>其他</strong>
        <span>暂时还没有被妥善归档的内容</span>
      </a>
    </div>

    <h2>全部文章</h2>
    <ul class="post-list">
      {% for post in site.posts %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          <time datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%Y-%m-%d" }}</time>
        </li>
      {% endfor %}
    </ul>

    <p>喜欢您来！</p>
  </section>

  <aside class="side-panel paper">
    <div class="side-section">
      <p class="side-title">小窝索引</p>
      <p>这里存放笔记、文学写作和各种乱七八糟的东西。在这里，看见我。</p>
    </div>
    <div class="side-section">
      <p class="side-title">最近更新</p>
      <ul>
        {% for post in site.posts limit: 5 %}
          <li><a href="{{ post.url | relative_url }}">{{ post.title }}</a></li>
        {% endfor %}
      </ul>
    </div>
    <div class="side-section">
      <p class="side-title">其他页面</p>
      <ul>
        <li><a href="https://space.bilibili.com/1061632265">Bilibili</a></li>
        <li><a href="https://github.com/duyaomega">GitHub</a></li>
        <li><a href="{{ '/write/' | relative_url }}">写文章</a></li>
      </ul>
    </div>
  </aside>
</div>
