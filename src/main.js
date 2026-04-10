import './style.css'
import html2canvas from 'html2canvas'
import { MANAGERS, BLESSINGS } from './data.js'
import { buildGreetingCard } from './cardRenderer.js'

const state = {
  selectedMgr: null,  // Single manager selection
  selectedBlessing: null,  // Single blessing selection
}

const SIGNATURE_API_URL = import.meta.env.VITE_SIGNATURE_API_URL || '/api/signature.php'

function normalizeName (value) {
  return String(value || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function saveSignatureRecord ({ senderNameOrOrg, executiveName, blessingText }) {
  const payload = {
    sender_name_or_org: senderNameOrOrg,
    executive_name: normalizeName(executiveName),
    blessing_text: String(blessingText || '').trim(),
  }

  try {
    const res = await fetch(SIGNATURE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error('HTTP ' + res.status + ': ' + body)
    }
  } catch (err) {
    const isDevServer = location.port === '5173'
    if (isDevServer) {
      console.warn('Skipping DB save in Vite dev mode:', err)
      return
    }
    throw err
  }
}

// ── manager card builder ────────────────────────────────────
function buildMgrCard (m) {
  return `
    <div class="mgr-card" data-id="${m.id}" data-name="${m.name}">
      <div class="check-badge">✓</div>
      <div class="mgr-poster-wrap">
        <img
          class="mgr-poster-img"
          src="${m.image}"
          alt="${m.name}"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
        />
        <div class="mgr-avatar-fallback">
          <div class="mgr-avatar-inner">${m.initials}</div>
          <div class="mgr-fb-name">${m.name}</div>
          <div class="mgr-fb-pos">${m.position}</div>
        </div>
      </div>
      <!-- small label for deputy cards -->
      <div class="mgr-label">
        <span class="mgr-rank-badge">${m.rank}</span>
        <span class="mgr-name-label">${m.name}</span>
      </div>
      <!-- detail panel shown only for director card -->
      <div class="mgr-detail">
        <span class="mgr-detail-rank">${m.rank}</span>
        <div class="mgr-detail-name">${m.name}</div>
        <div class="mgr-detail-pos">${m.position}</div>
        <div class="mgr-detail-greeting">"${m.greeting}"</div>
      </div>
    </div>
  `
}

// ── render app ───────────────────────────────────────────────
document.querySelector('#app').innerHTML = `
  

  <div class="gold-border">
    <div class="card">

      <!-- Header -->
      <div class="header">
        <img src="/logo-rid2.png" alt="โลโก้กรมชลประทาน" class="rid-logo-img" />
        <div class="songkran-title">ร่วมสืบสานประเพณีสงกรานต์</div>
        <div class="org-name-center">กรมชลประทาน</div>
        <div class="header-desc">
          ขอเชิญชวนบุคลากรกรมชลประทาน และประชาชนทั่วไป<br>
          ร่วมส่งความสุขและคำอวยพร เนื่องในเทศกาลปีใหม่ไทย<br>
          แด่คณะผู้บริหารกรมชลประทาน
        </div>
        <div class="year-badge">🌺 วันสงกรานต์ ๒๕๖๙</div>
      </div>

      <!-- Two-column desktop layout -->
      <div class="app-layout">

        <!-- LEFT: Manager selection -->
        <div class="panel-left">
          <div class="section-label">เลือกผู้บริหารทีละคน</div>
          <div class="mgr-grid" id="mgrGrid">
            ${MANAGERS.map(m => buildMgrCard(m)).join('')}
          </div>
          <div class="sel-count" id="selCount">กรุณาเลือกผู้บริหาร</div>
        </div>

        <!-- RIGHT: Blessing + form + actions -->
        <div class="panel-right">
          <div class="section-label">① เลือกคำอวยพร (เลือก 1 ข้อ)</div>
          <div class="blessing-grid" id="blessingGrid">
            ${BLESSINGS.map(b => `
              <button class="blessing-btn" data-id="${b.id}" data-text="${b.text}">
                <span style="font-size:16px;display:block;margin-bottom:4px">${b.emoji}</span>${b.text}
              </button>
            `).join('')}
          </div>

          <div class="section-label" style="margin-top:.9rem">② ชื่อผู้ส่ง / หน่วยงาน (ไม่บังคับ)</div>
          <input class="from-input" id="fromInput" type="text" placeholder="เช่น กองส่งเสริมการมีส่วนร่วมของประชาชน" />

          <div class="btn-row" id="mainBtns" style="margin-top:1.2rem">
            <button class="btn btn-download" id="btnSave">⬇ บันทึกการ์ด</button>
          </div>

          <div class="success-box" id="successBox">
            <div class="success-icon">🎉</div>
            <div class="success-title">ส่งคำอวยพรสำเร็จ!</div>
            <div class="success-sub" id="successDetail"></div>
            <div class="btn-row" style="margin-top:1rem">
              <button class="btn btn-reset"    id="btnReset">🔄 อวยพรใหม่</button>
            </div>
          </div>
        </div>

      </div><!-- end app-layout -->
    </div>
  </div>
  <!-- Background music (HTML5 audio) -->
  <audio id="bgMusic" loop preload="auto">
    <source src="/1. THAI Songkran Song.mp3" type="audio/mpeg" />
  </audio>

  <!-- Music bar -->
  <div class="music-bar">
    <button class="btn-music" id="btnMusic" title="เล่น/หยุดเพลง">🎵</button>
    <span id="musicLabel">🎶 เพลงสงกรานต์ — คลิกเพื่อเล่น</span>
  </div>

  <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-spinner"></div>
    <div class="loading-text">กำลังสร้างการ์ดอวยพร...</div>
  </div>

  <!-- Card Preview Modal -->
  <div class="modal-overlay" id="cardModal" style="display:none">
    <div class="modal-content">
      <button class="modal-close" id="btnCloseModal">&times;</button>
      <div class="modal-header">✨ การ์ดอวยพร ✨</div>
      <div class="modal-card-preview" id="modalCardPreview"></div>
      <div class="modal-actions">
        <button class="btn btn-download" id="btnDownloadFromModal">⬇ บันทึกการ์ด PNG</button>
      </div>
    </div>
  </div>
`

// ── music player ─────────────────────────────────────────────
const audio = document.getElementById('bgMusic')
const btnMusic = document.getElementById('btnMusic')
const musicLabel = document.getElementById('musicLabel')
let musicPlaying = false
let pendingAutoPlay = false

function tryAutoPlayFromInteraction () {
  if (!pendingAutoPlay) return
  pendingAutoPlay = false
  startMusic()
  removeAutoPlayInteractionListeners()
}

function addAutoPlayInteractionListeners () {
  document.addEventListener('click', tryAutoPlayFromInteraction)
  document.addEventListener('touchstart', tryAutoPlayFromInteraction)
  document.addEventListener('keydown', tryAutoPlayFromInteraction)
}

function removeAutoPlayInteractionListeners () {
  document.removeEventListener('click', tryAutoPlayFromInteraction)
  document.removeEventListener('touchstart', tryAutoPlayFromInteraction)
  document.removeEventListener('keydown', tryAutoPlayFromInteraction)
}

function armAutoPlayOnFirstInteraction () {
  if (pendingAutoPlay) return
  pendingAutoPlay = true
  addAutoPlayInteractionListeners()
}

function startMusic () {
  audio.play().then(() => {
    pendingAutoPlay = false
    removeAutoPlayInteractionListeners()
    musicPlaying = true
    btnMusic.textContent = '⏸'
    btnMusic.classList.add('playing')
    musicLabel.textContent = '🎶 กำลังเล่นเพลงสงกรานต์...'
  }).catch(() => {
    armAutoPlayOnFirstInteraction()
  })
}

function stopMusic () {
  audio.pause()
  audio.currentTime = 0
  musicPlaying = false
  btnMusic.textContent = '🎵'
  btnMusic.classList.remove('playing')
  musicLabel.textContent = '🎶 เพลงสงกรานต์ — คลิกเพื่อเล่น'
}

// Always reset music to stopped state on reload/new page show.
window.addEventListener('load', startMusic)
window.addEventListener('pageshow', startMusic)
window.addEventListener('pagehide', stopMusic)
window.addEventListener('beforeunload', stopMusic)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopMusic()
})

btnMusic.addEventListener('click', () => {
  musicPlaying ? stopMusic() : startMusic()
})

// ── manager selection ────────────────────────────────────────
document.getElementById('mgrGrid').addEventListener('click', e => {
  const card = e.target.closest('.mgr-card')
  if (!card) return
  const { id } = card.dataset
  // Toggle: click again to deselect
  if (state.selectedMgr === id) {
    state.selectedMgr = null
    card.classList.remove('selected')
    document.querySelectorAll('.mgr-card').forEach(c => {
      c.classList.remove('blurred')
    })
  } else {
    document.querySelectorAll('.mgr-card').forEach(c => {
      c.classList.remove('selected', 'blurred')
    })
    state.selectedMgr = id
    card.classList.add('selected')
    // Add blur to all other cards
    document.querySelectorAll('.mgr-card').forEach(c => {
      if (c.dataset.id !== id) c.classList.add('blurred')
    })
  }
  updateSelCount()
  hidePreview()
  if (state.selectedMgr) focusBlessingStep()
})

// ── blessing selection ───────────────────────────────────────
document.getElementById('blessingGrid').addEventListener('click', e => {
  const btn = e.target.closest('.blessing-btn')
  if (!btn) return
  const { id } = btn.dataset
  // Toggle: click again to deselect
  if (state.selectedBlessing === id) {
    state.selectedBlessing = null
    btn.classList.remove('active')
  } else {
    document.querySelectorAll('.blessing-btn').forEach(b => {
      b.classList.remove('active')
    })
    state.selectedBlessing = id
    btn.classList.add('active')
  }
  hidePreview()
})

document.getElementById('btnSave').addEventListener('click', showCardModal)
document.getElementById('btnCloseModal').addEventListener('click', closeCardModal)
document.getElementById('btnDownloadFromModal').addEventListener('click', downloadCard)
document.getElementById('btnReset').addEventListener('click', resetAll)

// ── helpers ──────────────────────────────────────────────────
function getSelectedManagers () {
  return state.selectedMgr ? MANAGERS.filter(m => m.id === state.selectedMgr) : []
}

function getSelectedBlessingTexts () {
  return state.selectedBlessing ? BLESSINGS.filter(b => b.id === state.selectedBlessing).map(b => b.text) : []
}

function updateSelCount () {
  const names = getSelectedManagers().map(m => m.name)
  const el = document.getElementById('selCount')
  el.textContent = names.length
    ? '✅ เลือกแล้ว: ' + names[0]
    : 'กรุณาเลือกผู้บริหาร'
}

function hidePreview () {
  closeCardModal()
}

function focusBlessingStep () {
  const blessingGrid = document.getElementById('blessingGrid')
  if (!blessingGrid) return

  blessingGrid.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const firstBlessingBtn = blessingGrid.querySelector('.blessing-btn')
  if (firstBlessingBtn) {
    requestAnimationFrame(() => firstBlessingBtn.focus())
  }
}

function showCardModal () {
  const mgrs = getSelectedManagers()
  const blessings = getSelectedBlessingTexts()
  if (mgrs.length === 0) { alert('กรุณาเลือกผู้บริหารอย่างน้อย 1 ท่าน'); return }
  if (blessings.length === 0) { alert('กรุณาเลือกคำอวยพร'); return }
  const mgr = mgrs[0]
  const fromText = document.getElementById('fromInput').value.trim()
  const previewWrap = document.getElementById('modalCardPreview')
  previewWrap.innerHTML = `
    <div class="modal-greet-card">
      <div class="modal-greet-header">คำอวยพรที่ท่านเลือก</div>
      <div class="modal-greet-body">
        <div class="modal-greet-photo-wrap">
          <img
            class="modal-greet-photo"
            src="${mgr.image}"
            alt="${mgr.name}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
          />
          <div class="modal-greet-photo-fallback">${mgr.initials}</div>
        </div>
        <div class="modal-greet-text">
          <div class="modal-greet-to">ขออวยพร ${mgr.rank} ${mgr.name}</div>
          <div class="modal-greet-message">${blessings.join('<br>')}</div>
          <div class="modal-greet-from">${fromText ? 'จาก: ' + fromText : ''}</div>
        </div>
      </div>
    </div>
  `
  document.getElementById('cardModal').style.display = 'flex'
}

function closeCardModal () {
  document.getElementById('cardModal').style.display = 'none'
  document.getElementById('modalCardPreview').innerHTML = ''
}

async function downloadCard () {
  const mgrs = getSelectedManagers()
  const blessings = getSelectedBlessingTexts()
  if (mgrs.length === 0 || blessings.length === 0) {
    alert('กรุณาเลือกผู้บริหารและคำอวยพรก่อนบันทึก')
    return
  }
  const fromText = document.getElementById('fromInput').value.trim()
  const overlay = document.getElementById('loadingOverlay')
  overlay.classList.add('show')
  try {
    await saveSignatureRecord({
      senderNameOrOrg: fromText,
      executiveName: mgrs[0].name,
      blessingText: blessings[0],
    })

    const cardEl = buildGreetingCard(mgrs, blessings, fromText)
    await document.fonts.ready
    await new Promise(r => setTimeout(r, 250))
    const canvas = await html2canvas(cardEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    })

    const link = document.createElement('a')
    const names = mgrs.map(m => m.name.replace(/\s/g, '_')).join('-')
    link.download = 'songkran_RID_' + names + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
    // Close modal and reset form for next greeting
    closeCardModal()
    resetAll()
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการสร้างการ์ด กรุณาลองใหม่')
  } finally {
    overlay.classList.remove('show')
  }
}

function resetAll () {
  state.selectedMgr = null
  state.selectedBlessing = null
  document.querySelectorAll('.mgr-card').forEach(c => c.classList.remove('selected', 'blurred'))
  document.querySelectorAll('.blessing-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('fromInput').value = ''
  closeCardModal()
  document.getElementById('successBox').classList.remove('show')
  document.getElementById('mainBtns').style.display = 'flex'
  updateSelCount()
}
