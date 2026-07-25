"""Fetch Bilibili favorites playlist and save as static JSON."""
import json
import urllib.request
import os

MEDIA_ID = "1464673965"
PAGE_SIZE = 20
OUTPUT = os.path.join(os.path.dirname(__file__), "..", "..", "assets", "playlist.json")

def fetch_page(pn):
    url = (
        f"https://api.bilibili.com/x/v3/fav/resource/list"
        f"?media_id={MEDIA_ID}&pn={pn}&ps={PAGE_SIZE}"
    )
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())

def main():
    first = fetch_page(1)
    if first.get("code") != 0:
        raise RuntimeError(f"API error: {first}")

    info = first["data"]["info"]
    total = info["media_count"]
    title = info["title"]
    pages = (total + PAGE_SIZE - 1) // PAGE_SIZE

    songs = []
    for pn in range(1, pages + 1):
        if pn > 1:
            data = fetch_page(pn)
            if data.get("code") != 0:
                continue
            medias = data["data"]["medias"] or []
        else:
            medias = first["data"]["medias"] or []
        for m in medias:
            songs.append({
                "bvid": m["bvid"],
                "title": m["title"],
                "cover": m["cover"],
                "duration": m["duration"],
                "artist": m.get("upper", {}).get("name", ""),
            })

    out = {"title": title, "count": len(songs), "songs": songs}
    os.makedirs(os.path.dirname(os.path.abspath(OUTPUT)), exist_ok=True)
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False)
    print(f"Saved {len(songs)} songs to {OUTPUT}")

if __name__ == "__main__":
    main()
