const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);

const detail = document.getElementById("detail");
const id = Number(new URLSearchParams(location.search).get("id"));

const renderRow = (label, value) => value
  ? `<div class="detail-row"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`
  : "";

fetch("data/items.json")
  .then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then((items) => {
    const item = items.find((entry) => entry.id === id);

    if (!item) {
      document.title = "作品が見つかりません｜コミックガイド";
      detail.innerHTML = `
        <section class="not-found">
          <h1>作品が見つかりません</h1>
          <p>一覧ページから作品を選び直してください。</p>
          <a class="button" href="index.html">一覧へ戻る</a>
        </section>`;
      return;
    }

    // 新システムが追加した作品(communityNoteを持つ)は「1枚目を大きく+2枚目以降を下に並べる+こちらから+リンクURL」のみを表示する。
    // 画像枚数は固定しない(1枚だけの場合は大きい画像のみ)。どの画像をタップしても同じリンクURLへ遷移する。
    // 既存30件は従来どおりの詳細描画のまま変更しない。
    if (typeof item.communityNote === "string") {
      const images = Array.isArray(item.images) ? item.images : [];
      const affiliateUrl = item.affiliateUrl || "";
      const subImagesHtml =
        images.length > 1
          ? `<div class="detail-new-subimages">${images
              .slice(1)
              .map(
                (img) =>
                  `<a class="detail-new-subimage-link" href="${escapeHtml(affiliateUrl)}"><img class="detail-new-subimage" src="${escapeHtml(img)}" alt=""></a>`,
              )
              .join("")}</div>`
          : "";
      detail.innerHTML = `
        <a class="back-link" href="javascript:history.back()">← 一覧へ戻る</a>
        <article class="detail-card">
          <a class="detail-new-image-link" href="${escapeHtml(affiliateUrl)}">
            <img class="detail-new-image" src="${escapeHtml(images[0] || "")}" alt="">
          </a>
          ${subImagesHtml}
          <p class="detail-new-label">こちらから👇🏻</p>
          <a class="detail-new-link" href="${escapeHtml(affiliateUrl)}">${escapeHtml(affiliateUrl)}</a>
        </article>`;
      return;
    }

    const sourceUrl = /^https:\/\//.test(item.sourceUrl || "") ? item.sourceUrl : "";
    document.title = `${item.title}｜コミックガイド`;

    detail.innerHTML = `
      <a class="back-link" href="javascript:history.back()">← 一覧へ戻る</a>
      <article class="detail-card">
        <p class="detail-kicker">作品情報</p>
        <h1>${escapeHtml(item.title)}</h1>
        <p class="detail-creator">${escapeHtml(item.creators)}</p>

        <dl class="detail-facts">
          ${renderRow("出版社", item.publisher)}
          ${renderRow("掲載媒体", item.medium)}
          ${renderRow("連載期間", item.period)}
          ${renderRow("連載状況", item.status)}
          ${renderRow("単行本", item.volumes)}
          ${renderRow("映像化", item.adaptation)}
          ${renderRow("情報確認日", item.checkedAt)}
        </dl>

        ${sourceUrl ? `<a class="source-button" href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.sourceLabel)}で確認</a>` : ""}
        <p class="source-note">巻数や連載状況は確認日時点の情報です。最新情報は上の公式ページで確認してください。</p>
      </article>`;
  })
  .catch((error) => {
    console.error(error);
    detail.innerHTML = `
      <section class="not-found">
        <h1>作品情報を読み込めませんでした</h1>
        <p>ページを再読み込みしてください。</p>
        <a class="button" href="index.html">一覧へ戻る</a>
      </section>`;
  });
