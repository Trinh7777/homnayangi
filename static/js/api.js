// Gọi API backend Python
export async function spin(mode) {
  const res = await fetch("/api/spin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Lỗi máy chủ, thử lại nhé!");
    err.remaining_seconds = data.remaining_seconds;
    throw err;
  }
  return data;
}
