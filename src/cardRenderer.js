
/**
 * Build or update the hidden #greetingCard element used for html2canvas export.
 * @param {object[]} managers   - full manager objects from MANAGERS
 * @param {string[]} blessingTexts
 * @param {string}   fromText
 */
export function buildGreetingCard (managers, blessingTexts, fromText) {
  let el = document.getElementById('greetingCard')
  if (!el) {
    el = document.createElement('div')
    el.id = 'greetingCard'
    document.body.appendChild(el)
  }

  const toLine = managers.length
    ? 'เรียน ' + managers.map(m => m.name + ' ' + m.position).join('<br>')
    : ''

  const blessingLine = blessingTexts.join('\n')

  // Build manager photo thumbnails for the card
  const mgrsHtml = managers.map(m => `
    <div style="text-align:center;margin:0 10px;">
      <div style="
        width:80px;height:80px;border-radius:50%;
        background:linear-gradient(135deg,#0077b6,#00897b);
        border:3px solid #d4af37;
        display:flex;align-items:center;justify-content:center;
        margin:0 auto 6px;overflow:hidden;position:relative;
      ">
        <img
          src="${m.image}" alt="${m.name}"
          style="width:100%;height:100%;object-fit:cover;border-radius:50%;"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div style="
          display:none;width:100%;height:100%;
          align-items:center;justify-content:center;
          font-size:16px;font-weight:800;color:#fff;
          border-radius:50%;
        ">${m.initials}</div>
      </div>
      <div style="font-size:11px;color:#b2ebf2;font-weight:600;">${m.rank}</div>
      <div style="font-size:13px;color:#fff;font-weight:700;line-height:1.35;">${m.name}</div>
    </div>
  `).join('')

  el.innerHTML = `
    <div class="gc-border"></div>
    <div class="gc-inner"></div>
    <div class="gc-corner tl"></div>
    <div class="gc-corner tr"></div>
    <div class="gc-corner bl"></div>
    <div class="gc-corner br"></div>

    <div class="gc-content">
      <div class="gc-logo-row">
        <div class="gc-logo-icon">
          <img src="/logo-rid2.png" alt="RID" style="width:52px;height:52px;object-fit:contain;" />
        </div>
        <div>
          <div class="gc-org-name">กรมชลประทาน</div>
          <div class="gc-org-sub">Royal Irrigation Department</div>
        </div>
        <div style="margin-left:auto;font-size:2rem;letter-spacing:.5rem;">🌸🌼🌺</div>
      </div>

      <div class="gc-title">สืบสานสงกรานต์</div>
      <div class="gc-year">🌸 วันสงกรานต์ ๒๕๖๘  •  Songkran 2025 🌸</div>
      <div class="gc-flowers">🌸🌼🌺🌼🌸</div>

      <hr class="gc-divider" />

      <!-- Manager thumbnails -->
      <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-bottom:24px;">
        ${mgrsHtml}
      </div>

      <div class="gc-blessing">${blessingLine.replace(/\n/g, '<br>')}</div>

      <div class="gc-from">
        ${fromText ? 'จาก: ' + fromText + '<br>' : ''}
        ด้วยความระลึกถึงและนับถืออย่างสูง<br>
        คณะเจ้าหน้าที่กรมชลประทาน 🌺
      </div>
    </div>
  `

  return el
}
