(function () {
  "use strict";

  var MEDIA_ID = "1464673965";
  var PROXY = "https://api.allorigins.win/raw?url=";
  var API_BASE =
    "https://api.bilibili.com/x/v3/fav/resource/list?media_id=" +
    MEDIA_ID +
    "&pn=1&ps=20";

  var playlist = [];
  var currentBvid = null;
  var expanded = false;

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function fetchPage(pn) {
    var url =
      PROXY +
      encodeURIComponent(
        "https://api.bilibili.com/x/v3/fav/resource/list?media_id=" +
          MEDIA_ID +
          "&pn=" +
          pn +
          "&ps=20"
      );
    return fetch(url)
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (d.code !== 0 || !d.data || !d.data.medias) return [];
        return d.data.medias.map(function (m) {
          return {
            bvid: m.bvid,
            title: m.title,
            cover: m.cover,
            duration: m.duration,
            artist: m.upper ? m.upper.name : "",
          };
        });
      });
  }

  function fetchAll() {
    return fetchPage(1).then(function (first) {
      playlist = first;
      renderList();
      return fetchPage(2).then(function (p2) {
        playlist = playlist.concat(p2);
        renderList();
        return fetchPage(3).then(function (p3) {
          playlist = playlist.concat(p3);
          renderList();
          return fetchPage(4).then(function (p4) {
            playlist = playlist.concat(p4);
            renderList();
            return fetchPage(5).then(function (p5) {
              playlist = playlist.concat(p5);
              renderList();
              return fetchPage(6).then(function (p6) {
                playlist = playlist.concat(p6);
                renderList();
              });
            });
          });
        });
      });
    });
  }

  function renderList() {
    var list = document.getElementById("mp-list");
    if (!list) return;
    if (playlist.length === 0) {
      list.innerHTML =
        '<div class="mp-empty">暂无歌曲</div>';
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

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function playSong(bvid) {
    currentBvid = bvid;
    var frame = document.getElementById("mp-frame");
    if (frame) {
      frame.src =
        "//player.bilibili.com/player.html?bvid=" +
        bvid +
        "&autoplay=1&high_quality=1";
      frame.style.display = "block";
    }
    renderList();
    var now = document.getElementById("mp-now-title");
    for (var i = 0; i < playlist.length; i++) {
      if (playlist[i].bvid === bvid) {
        if (now) now.textContent = playlist[i].title;
        break;
      }
    }
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
      '<span class="mp-heading">赛博渡鸦会梦见虚拟歌姬吗</span>' +
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
    fetchAll();
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
