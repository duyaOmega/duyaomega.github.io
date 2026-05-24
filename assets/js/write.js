(() => {
  const form = document.querySelector("#post-writer");
  const copyButton = document.querySelector("#copy-issue-body");
  const status = document.querySelector("#writer-status");

  if (!form) {
    return;
  }

  const issueUrl = "https://github.com/duyaOmega/duyaomega.github.io/issues/new";

  setDefaultDate();

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

  function setStatus(message) {
    if (!status) {
      return;
    }

    status.textContent = message;
  }
})();
