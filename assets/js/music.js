(function () {
  "use strict";

  var playlist = [];
  var playlistTitle = "音乐播放器";
  var currentBvid = null;
  var expanded = false;

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function loadPlaylist() {
    return fetch("/assets/playlist.json")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        playlistTitle = data.title || playlistTitle;
        playlist = data.songs || [];
        var heading = document.querySelector(".mp-heading");
        if (heading) heading.textContent = playlistTitle;
        renderList();
      })
      .catch(function () {
        var list = document.getElementById("mp-list");
        if (list)
          list.innerHTML =
            '<div class="mp-empty">加载失败，<a href="javascript:void(0)" id="mp-retry">点击重试</a></div>';
        var retry = document.getElementById("mp-retry");
        if (retry)
          retry.addEventListener("click", function () {
            list.innerHTML =
              '<div class="mp-loading">加载中…</div>';
            loadPlaylist();
          });
      });
  }

  function renderList() {
    var list = document.getElementById("mp-list");
    if (!list) return;
    if (playlist.length === 0) {
      list.innerHTML = '<div class="mp-empty">暂无歌曲</div>';
      return;
    }
    var html = "";
    for (var i = 0; i < playlist.length; i++) {
      var s = playlist[i];
      var active = s.bvid === currentBvid ? " active" : "";
      html +=
        '<div class="mp-item' +
        active +
        '" data-bvid="' +
        s.bvid +
        '">' +
        '<img class="mp-thumb" src="' +
        s.cover +
        '@80w_80h" alt="" loading="lazy">' +
        '<div class="mp-info">' +
        '<div class="mp-title">' +
        esc(s.title) +
        "</div>" +
        '<div class="mp-artist">' +
        esc(s.artist) +
        " · " +
        fmt(s.duration) +
        "</div>" +
        "</div>" +
        "</div>";
    }
    list.innerHTML = html;
    var items = list.querySelectorAll(".mp-item");
    for (var j = 0; j < items.length; j++) {
      items[j].addEventListener("click", function () {
        playSong(this.getAttribute("data-bvid"));
      });
    }
  }

  function playSong(bvid) {
    currentBvid = bvid;
    var frame = document.getElementById("mp-frame");
    var now = document.getElementById("mp-now");
    if (frame) {
      frame.src =
        "//player.bilibili.com/player.html?bvid=" +
        bvid +
        "&autoplay=1&high_quality=1";
      frame.style.display = "block";
    }
    if (now) {
      for (var i = 0; i < playlist.length; i++) {
        if (playlist[i].bvid === bvid) {
          now.textContent = playlist[i].title;
          now.classList.add("playing");
          break;
        }
      }
    }
    renderList();
  }

  function buildUI() {
    var root = document.getElementById("bilibili-player");
    if (!root) return;
    root.innerHTML =
      '<button class="mp-fab" id="mp-fab" aria-label="音乐播放器">' +
      '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>' +
      "</button>" +
      '<div class="mp-panel" id="mp-panel">' +
      '<div class="mp-header">' +
      '<span class="mp-heading">音乐播放器</span>' +
      '<button class="mp-close" id="mp-close" aria-label="关闭">&times;</button>' +
      "</div>" +
      '<div class="mp-player-area">' +
      '<div class="mp-now" id="mp-now">点击歌曲开始播放</div>' +
      '<iframe class="mp-frame" id="mp-frame" allowfullscreen allow="autoplay" frameborder="0" style="display:none"></iframe>' +
      "</div>" +
      '<div class="mp-list" id="mp-list">' +
      '<div class="mp-loading">加载中…</div>' +
      "</div>" +
      "</div>";

    document
      .getElementById("mp-fab")
      .addEventListener("click", toggle);
    document
      .getElementById("mp-close")
      .addEventListener("click", toggle);
    loadPlaylist();
  }

  function toggle() {
    expanded = !expanded;
    var panel = document.getElementById("mp-panel");
    var fab = document.getElementById("mp-fab");
    if (panel) panel.classList.toggle("open", expanded);
    if (fab) fab.classList.toggle("active", expanded);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildUI);
  } else {
    buildUI();
  }
})();
