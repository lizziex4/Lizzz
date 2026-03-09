// 兩個視窗 + 對應的標題列（拖曳把手）
const dragTargets = [
  { win: document.getElementById('MainWindow'), bar: document.getElementById('MainTitleBar') },
  { win: document.getElementById('window2'),    bar: document.getElementById('TitleBar2') },
  { win: document.getElementById('window3'),    bar: document.getElementById('TitleBar3') },
  { win: document.getElementById('window4'),    bar: document.getElementById('TitleBar4') },
  { win: document.getElementById('window5'),    bar: document.getElementById('TitleBar5') },
  { win: document.getElementById('window6'),    bar: document.getElementById('TitleBar6') },
  { win: document.getElementById('window7'),    bar: document.getElementById('TitleBar7') },
  { win: document.getElementById('window8'),    bar: document.getElementById('TitleBar8') },
  { win: document.getElementById('window9'),    bar: document.getElementById('TitleBar9') },

];

// 目前正在拖哪一個視窗
let activeWindow = null;
let offsetX = 0;
let offsetY = 0;

// 讓被拖的視窗置頂（可選，但會更像桌面視窗）
let topZ = 2000;

// 對每個 title bar 綁定拖曳開始事件
dragTargets.forEach(({ win, bar }) => {
  if (!win || !bar) return;

  bar.addEventListener('mousedown', (e) => {
    e.preventDefault(); // 避免拖曳時選取到文字/圖片
    activeWindow = win;

    // 置頂
    win.style.zIndex = (++topZ).toString();

    // 記錄滑鼠相對於視窗左上角的偏移
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
  });
});

// 拖曳中：移動 activeWindow
document.addEventListener('mousemove', (e) => {
  if (!activeWindow) return;

  activeWindow.style.left = (e.clientX - offsetX) + 'px';
  activeWindow.style.top  = (e.clientY - offsetY) + 'px';
});

// 放開滑鼠：停止拖曳
document.addEventListener('mouseup', () => {
  activeWindow = null;
});


function setWindow3Page(src){
  const frame = document.getElementById('frame2');
  if (frame) frame.src = src;
}

// === Window open/close ===
function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.style.display = 'block';         // 顯示
  win.style.zIndex = (++topZ).toString(); // 置頂（沿用你原本的 topZ）
}

function closeWindow(win) {
  if (!win) return;
  win.style.display = 'none';          // 隱藏
}

// 綁定所有右上角 X：點了就關閉該視窗
document.querySelectorAll('.title-bar-controls button[aria-label="Close"]').forEach((btn) => {
  // 避免按 X 的時候被 title-bar 的 mousedown 當成拖曳起手
  btn.addEventListener('mousedown', (e) => e.stopPropagation());

  btn.addEventListener('click', () => {
    const win = btn.closest('.window');
    closeWindow(win);
  });
});



// 新增這個函式來控制主視窗 (frame1)
function setMainPage(src){
  const frame = document.getElementById('frame1');
  if (frame) frame.src = src;
}

// 保留你原本控制 Computer 視窗 (frame2) 的函式
function setWindow3Page(src){
  const frame = document.getElementById('frame2');
  if (frame) frame.src = src;
}