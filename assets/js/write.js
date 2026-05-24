(() => {
  const form = document.querySelector("#post-writer");
  const bodyInput = document.querySelector("#post-body");
  const preview = document.querySelector("#post-preview");
  const editor = document.querySelector("#writer-editor");
  const resizer = document.querySelector("#writer-resizer");
  const existingPostSelect = document.querySelector("#existing-post");
  const loadExistingButton = document.querySelector("#load-existing-post");
  const copyButton = document.querySelector("#copy-issue-body");
  const status = document.querySelector("#writer-status");

  if (!form) {
    return;
  }

  const issueUrl = "https://github.com/duyaOmega/duyaomega.github.io/issues/new";
  const rawBaseUrl = "https://raw.githubusercontent.com/duyaOmega/duyaomega.github.io/main/";

  setDefaultDate();
  populateExistingPosts();
  setupResizableEditor();
  updatePreview();

  bodyInput?.addEventListener("input", updatePreview);
  loadExistingButton?.addEventListener("click", loadSelectedPost);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    const data = readForm();
    const url = new URL(issueUrl);
    url.searchParams.set("title", `[post] ${data.title}`);
    url.searchParams.set("labels", "publish-post");
    url.searchParams.set("body", buildIssueBody(data));

    window.location.href = url.toString();
  });

  copyButton?.addEventListener("click", async () => {
    const data = readForm();
    const body = buildIssueBody(data);

    try {
      await navigator.clipboard.writeText(body);
      setStatus("已复制，可粘贴到 GitHub issue。");
    } catch {
      setStatus("复制失败，可以手动选中正文复制。");
    }
  });

  function readForm() {
    const data = new FormData(form);

    return {
      title: value(data, "title"),
      category: value(data, "category") || "article",
      tags: value(data, "tags"),
      excerpt: value(data, "excerpt"),
      date: value(data, "date"),
      slug: value(data, "slug"),
      postPath: value(data, "postPath"),
      body: value(data, "body"),
    };
  }

  function value(data, key) {
    return String(data.get(key) || "").trim();
  }

  function setDefaultDate() {
    const dateInput = form.querySelector("#post-date");

    if (!dateInput || dateInput.value) {
      return;
    }

    const now = new Date();
    const offset = now.getTimezoneOffset() * 60 * 1000;
    dateInput.value = new Date(now.getTime() - offset).toISOString().slice(0, 10);
  }

  function buildIssueBody(data) {
    return [
      "### 标题",
      data.title || "_No response_",
      "",
      "### 分类",
      data.category || "_No response_",
      "",
      "### 标签",
      data.tags || "_No response_",
      "",
      "### 摘要",
      data.excerpt || "_No response_",
      "",
      "### 发布日期",
      data.date || "_No response_",
      "",
      "### 自定义链接名",
      data.slug || "_No response_",
      "",
      "### 原文章路径",
      data.postPath || "_No response_",
      "",
      "### 正文",
      data.body || "_No response_",
    ].join("\n");
  }

  function updatePreview() {
    if (!bodyInput || !preview) {
      return;
    }

    preview.innerHTML = renderMarkdown(bodyInput.value);
    typesetMath(preview);
  }

  function renderMarkdown(markdown) {
    const lines = markdown.replace(/\r\n/g, "\n").split("\n");
    const html = [];
    let paragraph = [];
    let listType = "";
    let codeFence = false;
    let codeLines = [];
    let quoteLines = [];

    for (const line of lines) {
      if (line.trim().startsWith("```")) {
        flushParagraph();
        flushList();
        flushQuote();

        if (codeFence) {
          html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
          codeLines = [];
          codeFence = false;
        } else {
          codeFence = true;
        }

        continue;
      }

      if (codeFence) {
        codeLines.push(line);
        continue;
      }

      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph();
        flushList();
        flushQuote();
        continue;
      }

      const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);

      if (heading) {
        flushParagraph();
        flushList();
        flushQuote();
        html.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
        continue;
      }

      if (trimmed.startsWith(">")) {
        flushParagraph();
        flushList();
        quoteLines.push(trimmed.replace(/^>\s?/, ""));
        continue;
      }

      const unordered = /^[-*]\s+(.+)$/.exec(trimmed);
      const ordered = /^\d+\.\s+(.+)$/.exec(trimmed);

      if (unordered || ordered) {
        flushParagraph();
        flushQuote();
        const nextType = unordered ? "ul" : "ol";

        if (listType && listType !== nextType) {
          flushList();
        }

        listType = nextType;
        html.push(`<li>${inlineMarkdown((unordered || ordered)[1])}</li>`);
        continue;
      }

      flushList();
      flushQuote();
      paragraph.push(trimmed);
    }

    flushParagraph();
    flushList();
    flushQuote();

    if (codeFence) {
      html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
    }

    return html.join("\n");

    function flushParagraph() {
      if (!paragraph.length) {
        return;
      }

      html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }

    function flushList() {
      if (!listType) {
        return;
      }

      for (let i = html.length - 1; i >= 0; i -= 1) {
        if (!html[i].startsWith("<li>")) {
          const items = html.splice(i + 1).join("\n");
          html.push(`<${listType}>\n${items}\n</${listType}>`);
          listType = "";
          return;
        }
      }

      const items = html.splice(0).join("\n");
      html.push(`<${listType}>\n${items}\n</${listType}>`);
      listType = "";
    }

    function flushQuote() {
      if (!quoteLines.length) {
        return;
      }

      html.push(`<blockquote>${quoteLines.map((quote) => `<p>${inlineMarkdown(quote)}</p>`).join("")}</blockquote>`);
      quoteLines = [];
    }
  }

  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  }

  async function populateExistingPosts() {
    if (!existingPostSelect) {
      return;
    }

    try {
      const response = await fetch("/posts.json", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to load posts: ${response.status}`);
      }

      const posts = await response.json();

      for (const post of posts) {
        const option = document.createElement("option");
        option.value = post.path;
        option.textContent = `${post.date} - ${post.title}`;
        option.dataset.url = post.url || "";
        existingPostSelect.append(option);
      }
    } catch {
      setStatus("未能加载文章列表；仍可新建文章。");
    }
  }

  async function loadSelectedPost() {
    if (!existingPostSelect?.value) {
      clearExistingPost();
      setStatus("已切换为新建文章。");
      return;
    }

    try {
      setStatus("正在加载文章...");
      const postPath = existingPostSelect.value;
      const response = await fetch(`${rawBaseUrl}${postPath}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to load post: ${response.status}`);
      }

      const source = await response.text();
      const parsed = parsePostSource(source);

      setInput("post-title", parsed.frontMatter.title || "");
      setInput("post-category", firstValue(parsed.frontMatter.categories) || "article");
      setInput("post-date", normalizeDateValue(parsed.frontMatter.date));
      setInput("post-tags", arrayValue(parsed.frontMatter.tags).join(", "));
      setInput("post-excerpt", parsed.frontMatter.excerpt || "");
      setInput("post-slug", slugFromPath(postPath));
      setInput("post-path", postPath);

      if (bodyInput) {
        bodyInput.value = parsed.body;
      }

      updatePreview();
      setStatus("文章已加载。修改后提交会覆盖原文件。");
    } catch {
      setStatus("加载失败，可以刷新页面后再试。");
    }
  }

  function clearExistingPost() {
    setInput("post-path", "");
  }

  function setInput(id, nextValue) {
    const input = document.querySelector(`#${id}`);

    if (input) {
      input.value = nextValue;
    }
  }

  function parsePostSource(source) {
    const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(source);

    if (!match) {
      return { frontMatter: {}, body: source.trim() };
    }

    return {
      frontMatter: parseYamlSubset(match[1]),
      body: match[2].trim(),
    };
  }

  function parseYamlSubset(source) {
    const data = {};
    const lines = source.split("\n");

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const pair = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);

      if (!pair) {
        continue;
      }

      const key = pair[1];
      const raw = pair[2].trim();

      if (!raw) {
        data[key] = "";
      } else if (raw.startsWith("[") && raw.endsWith("]")) {
        data[key] = raw
          .slice(1, -1)
          .split(",")
          .map((item) => cleanYamlValue(item))
          .filter(Boolean);
      } else {
        data[key] = cleanYamlValue(raw);
      }
    }

    return data;
  }

  function cleanYamlValue(value) {
    const trimmed = value.trim();

    if (
      (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1).replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
    }

    return trimmed;
  }

  function arrayValue(value) {
    if (Array.isArray(value)) {
      return value;
    }

    if (!value) {
      return [];
    }

    return String(value).split(/\s+/).filter(Boolean);
  }

  function firstValue(value) {
    if (Array.isArray(value)) {
      return value[0] || "";
    }

    return String(value || "").split(/\s+/)[0] || "";
  }

  function normalizeDateValue(value) {
    return String(value || "").slice(0, 10);
  }

  function slugFromPath(postPath) {
    return postPath
      .split("/")
      .pop()
      .replace(/^\d{4}-\d{2}-\d{2}-/, "")
      .replace(/\.md$/, "");
  }

  function setupResizableEditor() {
    if (!editor || !resizer) {
      return;
    }

    const saved = localStorage.getItem("writer-split");

    if (saved) {
      editor.style.setProperty("--editor-left", saved);
    }

    const move = (clientX) => {
      const rect = editor.getBoundingClientRect();
      const percent = ((clientX - rect.left) / rect.width) * 100;
      const clamped = Math.min(72, Math.max(28, percent));
      const value = `${clamped.toFixed(1)}%`;
      editor.style.setProperty("--editor-left", value);
      localStorage.setItem("writer-split", value);
    };

    resizer.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      resizer.setPointerCapture(event.pointerId);

      const onMove = (moveEvent) => move(moveEvent.clientX);
      const onUp = () => {
        resizer.removeEventListener("pointermove", onMove);
        resizer.removeEventListener("pointerup", onUp);
        resizer.removeEventListener("pointercancel", onUp);
      };

      resizer.addEventListener("pointermove", onMove);
      resizer.addEventListener("pointerup", onUp);
      resizer.addEventListener("pointercancel", onUp);
    });
  }

  function typesetMath(element) {
    if (!window.MathJax?.typesetPromise) {
      return;
    }

    window.MathJax.typesetPromise([element]).catch(() => {});
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setStatus(message) {
    if (!status) {
      return;
    }

    status.textContent = message;
  }
})();
