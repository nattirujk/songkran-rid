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
    el.className = 'gc-card-root'
    document.body.appendChild(el)
  }
  el.classList.add('gc-card-root')

  const toLine = managers.length
    ? 'เรียน ' + managers.map(m => m.name + ' ' + m.position).join('<br>')
    : ''

  const blessingLine = blessingTexts.join('\n')

  // Build manager blocks for the card (photo left, text right)
  const mgrsHtml = managers.map(m => `
    <div style="
      display:flex;align-items:center;gap:16px;
      background:rgba(11, 58, 103, .35);
      border:1.5px solid rgba(212,175,55,.45);
      border-radius:16px;
      padding:12px 14px;
      min-width:520px;
      max-width:720px;
    ">
      <div style="
        width:180px;height:auto;aspect-ratio:600/842;border-radius:16px;
        background:linear-gradient(135deg,#0a4d85,#1382bf);
        border:3px solid #9f7420;
        display:flex;align-items:center;justify-content:center;
        overflow:hidden;position:relative;flex-shrink:0;
      ">
        <img
          src="${m.imageCard || m.image}" alt="${m.name}"
          style="width:100%;height:100%;object-fit:contain;border-radius:16px;background:#0a4d85;"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div style="
          display:none;width:100%;height:100%;
          align-items:center;justify-content:center;
          font-size:22px;font-weight:800;color:#fff;
          border-radius:16px;
        ">${m.initials}</div>
      </div>
      <div style="
        text-align:left;
        color:#f6dd95;
        font-size:22px;
        font-weight:700;
        line-height:1.5;
      ">"ขออวยพร" ${m.rank} ${m.name}<br>${blessingLine.replace(/\n/g, '<br>')}
      ${fromText ? `<div style="width:100%;text-align:right;color:#f5d88b;font-size:18px;margin-top:8px;">จาก: ${fromText} 🌺</div>` : ''}
      </div>
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
          <img src="/logo-rid2.png" alt="RID" class="gc-logo-image" />
        </div>
        <div>
          <div class="gc-org-name">กรมชลประทาน</div>
          <div class="gc-org-sub">Royal Irrigation Department</div>
        </div>
        <div style="margin-left:auto;font-size:2rem;letter-spacing:.5rem;">🌸🌼🌺</div>
      </div>
      <div class="gc-year">🌸 สืบสานวันสงกรานต์ ๒๕๖๙  •  Songkran 2026 🌸</div>
    
      <!-- Manager thumbnails -->
      <div style="display:flex;justify-content:center;flex-wrap:wrap;gap:12px;margin-bottom:24px;">
        ${mgrsHtml}
      </div>

    </div>
  `

  return el
}
