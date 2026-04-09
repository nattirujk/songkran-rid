import './style.css'
import html2canvas from 'html2canvas'
import { MANAGERS, BLESSINGS } from './data.js'
import { buildGreetingCard } from './cardRenderer.js'

const state = {
  selectedMgrs: new Set(),
  selectedBlessings: new Set(),
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
        <div class="year-badge">🌺 วันสงกรานต์ ๒๕๖๘</div>
      </div>

      <!-- Two-column desktop layout -->
      <div class="app-layout">

        <!-- LEFT: Manager selection -->
        <div class="panel-left">
          <div class="section-label">เลือกผู้บริหารเพื่อร่วมลงนามอวยพร</div>
          <div class="mgr-grid" id="mgrGrid">
            ${MANAGERS.map(m => buildMgrCard(m)).join('')}
          </div>
          <div class="sel-count" id="selCount">กรุณาเลือกผู้บริหารอย่างน้อย 1 ท่าน</div>
        </div>

        <!-- RIGHT: Blessing + form + actions -->
        <div class="panel-right">
          <div class="section-label">① เลือกคำอวยพร (เลือกได้หลายข้อ)</div>
          <div class="blessing-grid" id="blessingGrid">
            ${BLESSINGS.map(b => `
              <button class="blessing-btn" data-id="${b.id}" data-text="${b.text}">
                <span style="font-size:16px;display:block;margin-bottom:4px">${b.emoji}</span>${b.text}
              </button>
            `).join('')}
          </div>

          <div class="section-label" style="margin-top:.9rem">② ชื่อผู้ส่ง / หน่วยงาน (ไม่บังคับ)</div>
          <input class="from-input" id="fromInput" type="text" placeholder="เช่น กองส่งเสริมการมีส่วนร่วมของประชาชน" />

          <div class="preview-box" id="previewBox">
            <div class="preview-header">✨ ตัวอย่างคำอวยพร ✨</div>
            <div class="preview-to" id="previewTo"></div>
            <div class="preview-text" id="previewText"></div>
            <div class="preview-from" id="previewFrom"></div>
          </div>

          <div class="btn-row" id="mainBtns">
            <button class="btn btn-preview" id="btnPreview">👁 ดูตัวอย่าง</button>
          </div>
          <div class="btn-row" id="actionBtns" style="display:none">
            <button class="btn btn-send"     id="btnSend">📨 ยืนยันส่ง</button>
            <button class="btn btn-download" id="btnDownload">⬇ บันทึกการ์ด PNG</button>
          </div>

          <div class="success-box" id="successBox">
            <div class="success-icon">🎉</div>
            <div class="success-title">ส่งคำอวยพรสำเร็จ!</div>
            <div class="success-sub" id="successDetail"></div>
            <div class="btn-row" style="margin-top:1rem">
              <button class="btn btn-download" id="btnDownload2">⬇ บันทึกการ์ด PNG</button>
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
`

// ── music player ─────────────────────────────────────────────
const audio = document.getElementById('bgMusic')
const btnMusic = document.getElementById('btnMusic')
const musicLabel = document.getElementById('musicLabel')
let musicPlaying = false

function startMusic () {
  audio.play().then(() => {
    musicPlaying = true
    btnMusic.textContent = '⏸'
    btnMusic.classList.add('playing')
    musicLabel.textContent = '🎶 กำลังเล่นเพลงสงกรานต์...'
  }).catch(() => { })
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
window.addEventListener('load', stopMusic)
window.addEventListener('pageshow', stopMusic)

btnMusic.addEventListener('click', () => {
  musicPlaying ? stopMusic() : startMusic()
})

// Autoplay on first interaction
document.addEventListener('click', () => {
  if (!musicPlaying) startMusic()
}, { once: true })

// ── manager selection ────────────────────────────────────────
document.getElementById('mgrGrid').addEventListener('click', e => {
  const card = e.target.closest('.mgr-card')
  if (!card) return
  const { id } = card.dataset
  if (state.selectedMgrs.has(id)) {
    state.selectedMgrs.delete(id)
    card.classList.remove('selected')
  } else {
    state.selectedMgrs.add(id)
    card.classList.add('selected')
  }
  updateSelCount()
  hidePreview()
})

// ── blessing selection ───────────────────────────────────────
document.getElementById('blessingGrid').addEventListener('click', e => {
  const btn = e.target.closest('.blessing-btn')
  if (!btn) return
  const { id } = btn.dataset
  if (state.selectedBlessings.has(id)) {
    state.selectedBlessings.delete(id)
    btn.classList.remove('active')
  } else {
    state.selectedBlessings.add(id)
    btn.classList.add('active')
  }
  hidePreview()
})

document.getElementById('btnPreview').addEventListener('click', showPreview)
document.getElementById('btnSend').addEventListener('click', confirmSend)
document.getElementById('btnDownload').addEventListener('click', downloadCard)
document.getElementById('btnDownload2').addEventListener('click', downloadCard)
document.getElementById('btnReset').addEventListener('click', resetAll)

// ── helpers ──────────────────────────────────────────────────
function getSelectedManagers () {
  return MANAGERS.filter(m => state.selectedMgrs.has(m.id))
}

function getSelectedBlessingTexts () {
  return BLESSINGS
    .filter(b => state.selectedBlessings.has(b.id))
    .map(b => b.text)
}

function updateSelCount () {
  const names = getSelectedManagers().map(m => m.name)
  const el = document.getElementById('selCount')
  el.textContent = names.length
    ? '✅ เลือกแล้ว ' + names.length + ' ท่าน: ' + names.join(', ')
    : 'กรุณาเลือกผู้บริหารอย่างน้อย 1 ท่าน'
}

function hidePreview () {
  document.getElementById('previewBox').classList.remove('show')
  document.getElementById('actionBtns').style.display = 'none'
  document.getElementById('mainBtns').style.display = 'flex'
}

function showPreview () {
  const mgrs = getSelectedManagers()
  const blessings = getSelectedBlessingTexts()
  if (mgrs.length === 0) { alert('กรุณาเลือกผู้บริหารอย่างน้อย 1 ท่าน'); return }
  if (blessings.length === 0) { alert('กรุณาเลือกคำอวยพรหรือพิมพ์คำอวยพรของคุณ'); return }
  const fromText = document.getElementById('fromInput').value.trim()
  document.getElementById('previewTo').textContent =
    'เรียน ' + mgrs.map(m => m.name).join('  |  ')
  document.getElementById('previewText').textContent = blessings.join('\n')
  document.getElementById('previewFrom').textContent = fromText ? 'จาก: ' + fromText : ''
  document.getElementById('previewBox').classList.add('show')
  document.getElementById('mainBtns').style.display = 'none'
  document.getElementById('actionBtns').style.display = 'flex'
}

function confirmSend () {
  document.getElementById('previewBox').classList.remove('show')
  document.getElementById('actionBtns').style.display = 'none'
  document.getElementById('successBox').classList.add('show')
  const mgrs = getSelectedManagers()
  document.getElementById('successDetail').textContent =
    'ส่งถึง: ' + mgrs.map(m => m.name).join(', ') + ' — สุขสันต์วันสงกรานต์ปีใหม่ไทย 🌸'
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
    const cardEl = buildGreetingCard(mgrs, blessings, fromText)
    await document.fonts.ready
    await new Promise(r => setTimeout(r, 250))
    const canvas = await html2canvas(cardEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a3d5c',
      logging: false,
    })
    const link = document.createElement('a')
    const names = mgrs.map(m => m.name.replace(/\s/g, '_')).join('-')
    link.download = 'songkran_RID_' + names + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  } catch (err) {
    console.error(err)
    alert('เกิดข้อผิดพลาดในการสร้างการ์ด กรุณาลองใหม่')
  } finally {
    overlay.classList.remove('show')
  }
}

function resetAll () {
  state.selectedMgrs.clear()
  state.selectedBlessings.clear()
  document.querySelectorAll('.mgr-card').forEach(c => c.classList.remove('selected'))
  document.querySelectorAll('.blessing-btn').forEach(b => b.classList.remove('active'))
  document.getElementById('fromInput').value = ''
  document.getElementById('previewBox').classList.remove('show')
  document.getElementById('successBox').classList.remove('show')
  document.getElementById('actionBtns').style.display = 'none'
  document.getElementById('mainBtns').style.display = 'flex'
  updateSelCount()
}
