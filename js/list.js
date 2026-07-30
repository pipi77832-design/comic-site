const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const grid = document.getElementById("grid");

fetch("data/items.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((items) => {
    const page = Number(document.body.dataset.page || 1);
    const shown = items.slice((page - 1) * 10, page * 10);

    grid.innerHTML = shown.map((item) => `
      <article class="card">
        <div class="card-number" aria-hidden="true">${String(item.id).padStart(2, "0")}</div>
        <div class="card-body">
          <h2>${escapeHtml(item.title)}</h2>
          <p class="creator">${escapeHtml(item.creators)}</p>
          <dl class="card-facts">
            <div><dt>出版社</dt><dd>${escapeHtml(item.publisher)}</dd></div>
            <div><dt>掲載</dt><dd>${escapeHtml(item.medium)}</dd></div>
            <div><dt>状況</dt><dd>${escapeHtml(item.status)}</dd></div>
            <div><dt>単行本</dt><dd>${escapeHtml(item.volumes)}</dd></div>
          </dl>
          <a class="button" href="detail.html?id=${encodeURIComponent(item.id)}">詳しい情報</a>
        </div>
      </article>
    `).join("");
  })
  .catch((error) => {
    console.error(error);
    grid.innerHTML = '<p class="error">作品情報を読み込めませんでした。ページを再読み込みしてください。</p>';
  });
