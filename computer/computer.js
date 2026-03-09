(() => {
  let appState = { goal: 40000, history: [] };
  let pendingSave = null; 

  function formatNTD(n) {
    const safe = Number.isFinite(n) ? n : 0;
    return "NT$ " + Math.round(safe).toLocaleString("en-US");
  }

  function calc(state) {
    const goal = Math.max(0, Number(state.goal) || 0);
    const saved = state.history.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const remaining = Math.max(goal - saved, 0);
    const progress = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;
    return { goal, saved, remaining, progress };
  }

  function latestEntryText(history) {
    if (!history.length) return "No entries yet.";
    const last = history[history.length - 1];
    const amount = formatNTD(last.amount || 0);
    const note = String(last.note || "").trim(); 
    const dateStr = last.date ? new Date(last.date).toLocaleDateString("en-US") : "";
    return note
      ? `${amount} - ${note} (${dateStr})`
      : `${amount} (${dateStr})`;
  }

  function render() {
    const { goal, saved, remaining, progress } = calc(appState);

    const goalEl = document.getElementById("goalValue");
    const savedEl = document.getElementById("savedValue");
    const remainingEl = document.getElementById("remainingValue");
    const progressEl = document.getElementById("progressValue");
    const fillEl = document.getElementById("progressFill");
    const latestEl = document.getElementById("latestEntry");

    if (goalEl) goalEl.textContent = formatNTD(goal);
    if (savedEl) savedEl.textContent = formatNTD(saved);
    if (remainingEl) remainingEl.textContent = formatNTD(remaining);
    if (progressEl) progressEl.textContent = `${progress.toFixed(1)}%`;
    if (fillEl) {
      fillEl.style.width = "0%"; 
      setTimeout(() => {
        fillEl.style.width = `${progress}%`; 
      }, 100);
    }
    
    if (latestEl) {
      latestEl.textContent = appState.history.length === 0 ? "No entries yet." : latestEntryText(appState.history);
    }

    const bankSavedEl = document.getElementById("bankSavedValue");
    const bankRemEl = document.getElementById("bankRemainingValue");
    if (bankSavedEl) bankSavedEl.textContent = formatNTD(saved);
    if (bankRemEl) bankRemEl.textContent = formatNTD(remaining);

    const historyListEl = document.getElementById("historyList");
    const historySummaryEl = document.getElementById("historySummary");

    if (historySummaryEl) {
      historySummaryEl.textContent = `Total entries: ${appState.history.length}`;
    }

    if (historyListEl) {
      historyListEl.innerHTML = "";
      const reversedHistory = [...appState.history].reverse();
      
      reversedHistory.forEach(entry => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "history_item";
        const dateStr = entry.date ? new Date(entry.date).toLocaleDateString("en-US") : "";

        itemDiv.innerHTML = `
          <img src="https://i.postimg.cc/pdwMkrcH/IMG-2076.webp" class="history_gif" alt="">
          <div class="date">${dateStr}</div>
          <div class="amt">${formatNTD(entry.amount)}</div>
          <div class="note">${String(entry.note || "")}</div>
        `;
        historyListEl.appendChild(itemDiv);
      });
    }
  }

  function hideModal() {
    const modal = document.getElementById("customModal");
    if (modal) modal.style.display = "none";
  }

  // 建立全域的 Loading 遮罩邏輯
  function showLoading() {
    let loader = document.getElementById("globalLoader");
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "globalLoader";
      // 灰色半透明背景，置中顯示白色 Loading 字樣
      // 將背景改為 75% 不透明度的淺粉白色，文字改為深粉紅色
      loader.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255, 240, 250, 0.75); z-index:9999; display:flex; justify-content:center; align-items:center; color:#a36270; font-size:24px; font-weight:bold; letter-spacing:2px; font-family:'PixelOperator', monospace;";
      loader.textContent = "Loading...";
      document.body.appendChild(loader);
    }
    loader.style.display = "flex";
  }

  function hideLoading() {
    const loader = document.getElementById("globalLoader");
    if (loader) loader.style.display = "none";
  }

  window.bankReadCallback = function(data) {
    if (Array.isArray(data)) {
      appState.history = data;
      render();
    }
    hideLoading(); // 資料讀取完畢，隱藏遮罩
  };

  function fetchCloudData() {
    showLoading(); // 發起請求前，顯示遮罩
    
    const scriptURL = "https://script.google.com/macros/s/AKfycbyzr7cxthof5yA5NfyhyFsGonWywQbSTUc7slm2-QfbF2uPBW2vOX-eibrdhF815X0W/exec"; 
    const script = document.createElement("script");
    
    script.src = `${scriptURL}?action=read&t=${Date.now()}&callback=bankReadCallback`;
    
    script.onload = () => script.remove();
    script.onerror = () => {
      script.remove();
      hideLoading(); // 若網路發生錯誤，也要將遮罩隱藏以免畫面卡死
    };
    
    document.body.appendChild(script);
  }

  window.bankWriteCallback = function(result) {
    const saveBtn = document.getElementById("SaveBtn");
    if (saveBtn) {
      saveBtn.textContent = "Save";
      saveBtn.disabled = false;
    }

    const modal = document.getElementById("customModal");
    const titleEl = document.getElementById("modalTitle");
    const msgEl = document.getElementById("modalMessage");

    if (result.status === "success") {
      if (pendingSave) {
        appState.history.push(pendingSave);
        render(); 

        const amountInput = document.getElementById("amountInput");
        const noteInput = document.getElementById("noteInput");
        const passwordInput = document.getElementById("passwordInput");
        if (amountInput) amountInput.value = "";
        if (noteInput) noteInput.value = "";
        if (passwordInput) passwordInput.value = "";

        pendingSave = null; 
      }

      if (modal && titleEl && msgEl) {
        titleEl.textContent = "Success";
        msgEl.textContent = "ଘ(੭ˊ꒳ˋ)੭✧ saved!"; 
        modal.style.display = "flex"; 
      } else {
        alert("ଘ(੭ˊ꒳ˋ)੭✧ saved!");
      }
    } else {
      if (modal && titleEl && msgEl) {
        titleEl.textContent = "Error";
        msgEl.textContent = result.message; 
        modal.style.display = "flex";
      } else {
        alert(result.message);
      }
    }
  };

  function handleSave() {
    const amountInput = document.getElementById("amountInput");
    const dateInput = document.getElementById("dateInput");
    const noteInput = document.getElementById("noteInput");
    const passwordInput = document.getElementById("passwordInput");
    const saveBtn = document.getElementById("SaveBtn");

    const amount = Number(amountInput.value);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    const date = dateInput.value || new Date().toISOString().split("T")[0];
    const note = noteInput.value.trim();
    const password = passwordInput.value;

    pendingSave = {
      amount: amount,
      date: date,
      note: note
    };

    if (saveBtn) {
      saveBtn.textContent = "Saving...";
      saveBtn.disabled = true;
    }

    const scriptURL = "https://script.google.com/macros/s/AKfycbyzr7cxthof5yA5NfyhyFsGonWywQbSTUc7slm2-QfbF2uPBW2vOX-eibrdhF815X0W/exec"; 
    
    const script = document.createElement("script");
    script.src = `${scriptURL}?action=write&amount=${encodeURIComponent(amount)}&date=${encodeURIComponent(date)}&note=${encodeURIComponent(note)}&password=${encodeURIComponent(password)}&callback=bankWriteCallback`;

    script.onload = () => script.remove();
    script.onerror = () => {
      script.remove();
      if (saveBtn) {
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
      alert("Network error. Please check your connection.");
    };

    document.body.appendChild(script);

    setTimeout(() => {
      if (saveBtn && saveBtn.disabled) {
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
    }, 15000); 
  }

  document.addEventListener("DOMContentLoaded", () => {
    // 初次載入時不需要先執行 render 產生 No entries，由 fetchCloudData 蓋上 Loading 即可
    fetchCloudData();

    const modalCloseBtn = document.getElementById("modalCloseBtn");
    const modalOkBtn = document.getElementById("modalOkBtn");
    if (modalCloseBtn) modalCloseBtn.addEventListener("click", hideModal);
    if (modalOkBtn) modalOkBtn.addEventListener("click", hideModal);

    const saveBtn = document.getElementById("SaveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", handleSave);

      const dateInput = document.getElementById("dateInput");
      if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split("T")[0];
      }
    }
  });
})();