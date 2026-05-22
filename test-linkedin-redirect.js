async function test() {
  const url = "https://www.linkedin.com/jobs/view/3928123049/";
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    console.log("Final URL:", res.url);
    console.log("Redirected:", res.redirected);
  } catch (err) {
    console.log("Error:", err.message);
  }
}

test();
