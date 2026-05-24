(() => {
  const button = document.querySelector("[data-theme-toggle]");
  const root = document.documentElement;

  if (!button) {
    return;
  }

  updateButton();

  button.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("blog-theme", next);
    updateButton();
  });

  function updateButton() {
    const isDark = root.dataset.theme === "dark";
    button.textContent = isDark ? "日" : "夜";
    button.setAttribute("aria-label", isDark ? "切换到日间模式" : "切换到夜间模式");
  }
})();
