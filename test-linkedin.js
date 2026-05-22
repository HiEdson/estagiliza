async function test() {
  const url = "https://www.linkedin.com/jobs/view/3928123049/";
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    console.log("HEAD Status:", res.status);
  } catch (err) {
    console.log("HEAD Error:", err.message);
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    console.log("GET Status:", res.status);
  } catch (err) {
    console.log("GET Error:", err.message);
  }
}

test();
