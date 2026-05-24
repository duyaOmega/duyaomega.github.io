(() => {
  const form = document.querySelector("#post-writer");
  const bodyInput = document.querySelector("#post-body");
  const preview = document.querySelector("#post-preview");
  const copyButton = document.querySelector("#copy-issue-body");
  const status = document.querySelector("#writer-status");

  if (!form) {
    return;
  }

  const issueUrl = "https://github.com/duyaOmega/duyaomega.github.io/issues/new";

  setDefaultDate();
  updatePreview();

  bodyInput?.addEventListener("input", updatePreview);

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
      "### 正文",
      data.body || "_No response_",
    ].join("\n");
  }

  function updatePreview() {
    if (!bodyInput || !preview) {
      return;
    }

    preview.innerHTML = renderMarkdown(bodyInput.value);
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
