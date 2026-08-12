const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const grid = document.getElementById("grid");
const pagerEl = document.getElementById("pager");

// ページ1〜3は既存の物理ファイル(index.html/page2.html/page3.html)のURLを維持する。
// 4ページ目以降はファイルを増やさず、index.html?page=Nで自動的に成立させる。
function pageHref(n) {
  if (n === 1) return "index.html";
  if (n === 2) return "page2.html";
  if (n === 3) return "page3.html";
  return `index.html?page=${n}`;
}

function resolveCurrentPage() {
  const queryPage = Number(new URLSearchParams(location.search).get("page"));
  if (Number.isFinite(queryPage) && queryPage > 0) return queryPage;
  return Number(document.body.dataset.page || 1);
}

function renderPager(page, totalPages) {
  if (!pagerEl) return;
  let html = "";
  if (page > 1) html += `<a href="${pageHref(page - 1)}">前へ</a>`;
  if (page < totalPages) html += `<a href="${pageHref(page + 1)}">次へ</a>`;
  pagerEl.innerHTML = html;
}

// 新システムが追加した作品(communityNoteを持つ)は「選択画像の1枚目+一言」のみのカードにする。
// images(選択順の配列)の先頭を一覧カードの画像として使う。枚数は固定しない。
// 既存30件は従来どおりのカードのまま変更しない。
function renderCard(item) {
  if (typeof item.communityNote === "string") {
    const firstImage = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : "";
    return `
      <a class="card card-new" href="detail.html?id=${encodeURIComponent(item.id)}">
        <img class="card-new-image" src="${escapeHtml(firstImage)}" alt="">
        <div class="card-new-body">
          <p class="card-new-note">${escapeHtml(item.communityNote)}</p>
          <span class="button">詳しく見る</span>
        </div>
      </a>
    `;
  }
  return `
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
  `;
}

fetch("data/items.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((items) => {
    const page = resolveCurrentPage();
    const totalPages = Math.max(1, Math.ceil(items.length / 10));
    const shown = items.slice((page - 1) * 10, page * 10);

    grid.innerHTML = shown.map(renderCard).join("");
    renderPager(page, totalPages);
  })
  .catch((error) => {
    console.error(error);
    grid.innerHTML = '<p class="error">作品情報を読み込めませんでした。ページを再読み込みしてください。</p>';
  });
