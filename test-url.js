async function isUrlReachable(url) {
  if (!url || !url.startsWith("http")) return false;
  
  // 1. Try HEAD request first (fastest)
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    console.log("HEAD status:", res.status);
    if (res.status < 500) return true;
  } catch (err) {
    console.log("HEAD error:", err.message);
  }

  // 2. Try GET request fallback with Range header
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Range": "bytes=0-0",
      },
    });
    console.log("GET status:", res.status);
    return res.status < 500;
  } catch (err) {
    console.log("GET error:", err.message);
    return false;
  }
}

const testUrl = "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQENYa5d1DnC6Lt3xtPOfWuLDb5vjvoam65GpRGNfrvqG7t4RMZuS9VcvI6wpJxd4lztGo-MUM5CjNySJEtQZslbBtw0zkr9e3calW0JpYketWdBfuLkg17urRCSTzZVXlf0Y2gZgshPv_WVehmUduqnT7LoQ1gvNjVy93aB";

isUrlReachable(testUrl).then(res => console.log("Result:", res));
