(function () {
  "use strict";

  var MEDIA_ID = "1464673965";
  var PROXIES = [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest=",
  ];
  var PAGE_SIZE = 20;

  var playlist = [];
  var currentBvid = null;
  var expanded = false;

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function apiUrl(pn) {
    return (
      "https://api.bilibili.com/x/v3/fav/resource/list?media_id=" +
      MEDIA_ID +
      "&pn=" +
      pn +
      "&ps=" +
      PAGE_SIZE
    );
  }

  function fetchWithProxy(url, proxyIdx) {
    if (proxyIdx >= PROXIES.length)
      return Promise.reject(new Error("All proxies failed"));
    return fetch(PROXIES[proxyIdx] + encodeURIComponent(url)).then(
      function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      }
    ).catch(function () {
      return fetchWithProxy(url, proxyIdx + 1);
    });
  }

  function fetchPage(pn) {
    return fetchWithProxy(apiUrl(pn), 0).then(function (d) {
      if (d.code !== 0 || !d.data || !d.data.medias)
        return { items: [], total: 0 };
      return {
        items: d.data.medias.map(function (m) {
          return {
            bvid: m.bvid,
            title: m.title,
            cover: m.cover,
            duration: m.duration,
            artist: m.upper ? m.upper.name : "",
          };
        }),
        total: d.data.info ? d.data.info.media_count : 0,
      };
    });
  }

  function fetchAll() {
    return fetchPage(1)
      .then(function (first) {
        playlist = first.items;
        renderList();
        var totalPages = Math.ceil(first.total / PAGE_SIZE);
        var chain = Promise.resolve();
        for (var pn = 2; pn <= totalPages; pn++) {
          chain = chain
            .then(function (p) {
              return function () {
                return fetchPage(p);
              };
            }(pn))
            .then(function (data) {
              playlist = playlist.concat(data.items);
              renderList();
            });
        }
        return chain;
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
            fetchAll();
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

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
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
