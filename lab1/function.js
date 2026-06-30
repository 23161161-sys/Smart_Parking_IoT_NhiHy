// --- 1. ĐỒNG HỒ HỆ THỐNG TRỰC TUYẾN ---
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    document.getElementById('digital-clock').innerHTML = `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
}
setInterval(updateClock, 1000);
updateClock();

// --- 2. HÀM GHI NHẬT KÝ (LOG) ---
function addLog(message, type = 'system') {
    const logContainer = document.getElementById("logContainer");
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
    const newLog = document.createElement("div");
    newLog.className = `log-item ${type}`;
    newLog.innerHTML = `[${timeStr}] ${message}`;
    logContainer.appendChild(newLog);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// --- 3. HÀM KÍCH HOẠT HỆ THỐNG BÁO ĐỘNG AN NINH (XÂM NHẬP GIAN LẬN) ---
let alarmTimer = null;
function triggerSecurityAlarm() {
    let statusBlock = document.getElementById("systemStatusBlock");
    let statusText = document.getElementById("statusText");
    
    statusBlock.classList.add("alarm-active");
    statusText.innerHTML = "CẢNH BÁO XÂM NHẬP";
    
    if (alarmTimer) clearTimeout(alarmTimer);
    alarmTimer = setTimeout(() => {
        if(!document.body.classList.contains("fire-emergency")) {
            statusBlock.classList.remove("alarm-active");
            statusText.innerHTML = "HỆ THỐNG LIVE";
        }
    }, 5000);
}

// --- 4. KHỞI TẠO CÁC BIẾN LOGIC (CỜ) CỦA HỆ THỐNG ĐÃ NÂNG CẤP ---
let isBarieVaoOpen = false; // Theo dõi barie vào đang đóng hay mở
let isBarieRaOpen = false;  // Theo dõi barie ra đang đóng hay mở

let initialLoad = { P1: true, P2: true, P3: true, P4: true, P5: true, BarieVao: true, BarieRa: true, PCCC: true };
let previousStates = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, BarieVao: -1, BarieRa: -1 };
let currentParkingSlots = { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0 }; 
const TONG_SO_CHO = 5; 
let isFireAlarming = false; 

// --- 5. HÀM TỰ ĐỘNG TÍNH TOÁN & ĐỒNG BỘ THỐNG KÊ + BẢNG LED ---
function autoCalculateAndSync() {
    let soXeHienTai = 0;
    for (let i = 1; i <= TONG_SO_CHO; i++) {
        if (currentParkingSlots["P" + i] === 1) {
            soXeHienTai++;
        }
    }
    let choTrongHienTai = TONG_SO_CHO - soXeHienTai;
    
    document.getElementById("tongcho").innerHTML = TONG_SO_CHO;
    document.getElementById("soxe").innerHTML = soXeHienTai;
    document.getElementById("chotrong").innerHTML = choTrongHienTai;
    
    let ledElement = document.getElementById("ledText");
    if (isFireAlarming) {
        ledElement.innerHTML = "⚠️ SỰ CỐ HOẢ HOẠN! SƠ TÁN KHẨN CẤP ⚠️";
        ledElement.className = "led-text fire";
    } else if (choTrongHienTai === 0) {
        ledElement.innerHTML = "BÃI XE ĐẦY - FULL SLOT";
        ledElement.className = "led-text full";
    } else {
        ledElement.innerHTML = `XIN CHÀO! CÒN TRỐNG: ${choTrongHienTai} CHỖ`;
        ledElement.className = "led-text";
    }
    
    let isAnyInitialLoading = Object.values(initialLoad).some(status => status === true);
    if (!isAnyInitialLoading) {
        firebase.database().ref("Tong cho").set(TONG_SO_CHO);
        firebase.database().ref("So xe").set(soXeHienTai);
        firebase.database().ref("Cho trong").set(choTrongHienTai);
    }
}

// --- 6. LẮNG NGHE SỰ KIỆN REALTIME TỪ FIREBASE ---
// ================= LẮNG NGHE REALTIME BARIE VÀO Ở CẤP TOÀN CỤC =================
firebase.database().ref("BarieVao").on("value", (snap) => {
    let value = snap.val();
    let btnOpen = document.getElementById("btnOpenVao");
    let btnClose = document.getElementById("btnCloseVao");
    let img = document.getElementById("barieVaoImg");
    let txt = document.getElementById("barieVaoStatus");
    
    if (value == 1) {
        isBarieVaoOpen = true;
        if(txt) { txt.innerHTML = "MỞ"; txt.style.color = "#2ecc71"; }
        if(img) img.src = "image/barieopen.png";
        if(btnOpen) btnOpen.disabled = true; 
        if(btnClose) btnClose.disabled = false;
        if (!initialLoad.BarieVao && previousStates.BarieVao !== 1) addLog("Hệ thống: Barie làn VÀO đã MỞ.", "action");
    } else {
        isBarieVaoOpen = false;
        if(txt) { txt.innerHTML = "ĐÓNG"; txt.style.color = "#e74c3c"; }
        if(img) img.src = "image/barieclose.png";
        if(btnOpen) btnOpen.disabled = false; 
        if(btnClose) btnClose.disabled = true;
        if (!initialLoad.BarieVao && previousStates.BarieVao !== 0) addLog("Hệ thống: Barie làn VÀO đã ĐÓNG.", "action");
    }
    previousStates.BarieVao = value; initialLoad.BarieVao = false;
    autoCalculateAndSync();
});

// ================= LẮNG NGHE REALTIME BARIE RA Ở CẤP TOÀN CỤC =================
firebase.database().ref("BarieRa").on("value", (snap) => {
    let value = snap.val();
    let btnOpen = document.getElementById("btnOpenRa");
    let btnClose = document.getElementById("btnCloseRa");
    let img = document.getElementById("barieRaImg");
    let txt = document.getElementById("barieRaStatus");
    
    if (value == 1) {
        isBarieRaOpen = true;
        if(txt) { txt.innerHTML = "MỞ"; txt.style.color = "#2ecc71"; }
        if(img) img.src = "image/barieopen.png";
        if(btnOpen) btnOpen.disabled = true; 
        if(btnClose) btnClose.disabled = false;
        if (!initialLoad.BarieRa && previousStates.BarieRa !== 1) addLog("Hệ thống: Barie làn RA đã MỞ.", "action");
    } else {
        isBarieRaOpen = false;
        if(txt) { txt.innerHTML = "ĐÓNG"; txt.style.color = "#e74c3c"; }
        if(img) img.src = "image/barieclose.png";
        if(btnOpen) btnOpen.disabled = false; 
        if(btnClose) btnClose.disabled = true;
        if (!initialLoad.BarieRa && previousStates.BarieRa !== 0) addLog("Hệ thống: Barie làn RA đã ĐÓNG.", "action");
    }
    previousStates.BarieRa = value; initialLoad.BarieRa = false;
    autoCalculateAndSync();
});

// ================= LẮNG NGHE REALTIME 5 VỊ TRÍ ĐỖ XE (BẢN KHÓA CỨNG) =================
for (let i = 1; i <= TONG_SO_CHO; i++) {
    firebase.database().ref("Vi tri/P" + i).on("value", (snap) => {
        let slot = document.getElementById("P" + i);
        let currentState = Number(snap.val());
        
        if (currentState === 1) { // == XE VÀO Ô ĐỖ ==
            // Nếu xe vào khi Barie vào đang ĐÓNG -> Hú còi & ÉP NGƯỢC dữ liệu về 0
            if (!initialLoad["P" + i] && previousStates["P" + i] === 0 && isBarieVaoOpen === false) {
                addLog(`Hệ thống từ chối: Xe cố tình vào vị trí P${i} khi Barie VÀO đang đóng!`, 'alarm');
                triggerSecurityAlarm();
                firebase.database().ref("Vi tri/P" + i).set(0); 
                return; // Thoát hàm luôn, không cập nhật xe lên giao diện
            }
            
            if(slot) {
                slot.className = "slot coxe";
                slot.innerHTML = `<img src="image/car.png" alt="Xe"><span>P${i}</span>`;
            }
            currentParkingSlots["P" + i] = 1;
            if (!initialLoad["P" + i] && previousStates["P" + i] === 0) {
                addLog(`Phát hiện xe vào bãi đỗ tại vị trí P${i}.`, 'car-in');
            }
        } 
        else { // == XE RỜI Ô ĐỖ ==
            // Nếu xe rời ô khi Barie ra đang ĐÓNG -> Hú còi & ÉP NGƯỢC dữ liệu về 1
            if (!initialLoad["P" + i] && previousStates["P" + i] === 1 && isBarieRaOpen === false) {
                addLog(`Hệ thống từ chối: Xe cố tình rời vị trí P${i} khi Barie RA đang đóng!`, 'alarm');
                triggerSecurityAlarm();
                firebase.database().ref("Vi tri/P" + i).set(1); 
                return; // Thoát hàm luôn, giữ nguyên trạng thái xe cũ trên UI
            }
            
            if(slot) {
                slot.className = "slot trong";
                slot.innerHTML = `<span>P${i}</span>`;
            }
            currentParkingSlots["P" + i] = 0;
            if (!initialLoad["P" + i] && previousStates["P" + i] === 1) {
                addLog(`Vị trí P${i} đã trống (Xe đã rời bãi).`, 'car-out');
            }
        }
        
        previousStates["P" + i] = currentState;
        initialLoad["P" + i] = false;
        autoCalculateAndSync();
    });
}

// ================= LẮNG NGHE REALTIME DỮ LIỆU PCCC MÔI TRƯỜNG =================
firebase.database().ref("Moi truong").on("value", (snap) => {
    let data = snap.val();
    if (!data) {
        initialLoad.PCCC = false;
        return;
    }

    let temp = data["Nhiet do"] || 28;
    let smoke = data["Khoi"] || 0;
    let buzzer = data["Coi hu"] || 0;
    let sprinkler = data["Voi phun"] || 0;

    let tempClass = ""; 
    if (temp > 50) {
        tempClass = "fa-shake"; 
    }
    
    if(document.getElementById("txtTemp")) {
        document.getElementById("txtTemp").innerHTML = `
            <img src="image/nhietke.png" class="${tempClass}" style="width: 25px; margin-right: 8px; vertical-align: middle;">
            <span>${temp} °C</span>
        `;
    }
    
    let lblSmoke = document.getElementById("txtSmoke");
    if(lblSmoke) {
        if(smoke === 1) {
            lblSmoke.innerHTML = "PHÁT HIỆN KHÓI!";
            lblSmoke.className = "pccc-value status-danger";
        } else {
            lblSmoke.innerHTML = "AN TOÀN";
            lblSmoke.className = "pccc-value status-safe";
        }
    }

    let sirenAudio = document.getElementById("fireSiren");
    
    if (buzzer === 1) {
        if(document.getElementById("txtBuzzer")) {
            document.getElementById("txtBuzzer").innerHTML = `<img src="image/chuong.gif" class="fa-shake" style="width: 100%; height: 75px; object-fit: contain; margin-top: 8px;">`;
            document.getElementById("txtBuzzer").className = "pccc-value status-danger";
        }
        if(sirenAudio) {
            sirenAudio.play().catch(error => {
                console.log("Trình duyệt chặn tự động phát âm thanh...");
            });
        }
    } else {
        if(document.getElementById("txtBuzzer")) {
            document.getElementById("txtBuzzer").innerHTML = "TẮT";
            document.getElementById("txtBuzzer").className = "pccc-value";
        }
        if(sirenAudio) {
            sirenAudio.pause();
            sirenAudio.currentTime = 0;
        }
    }

    if (sprinkler === 1) {
        if(document.getElementById("txtSprinkler")) {
            document.getElementById("txtSprinkler").innerHTML = `<img src="image/nuoc.gif" style="width: 100%; height: 75px; object-fit: contain; margin-top: 8px;">`;
            document.getElementById("txtSprinkler").className = "pccc-value status-on";
        }
    } else {
        if(document.getElementById("txtSprinkler")) {
            document.getElementById("txtSprinkler").innerHTML = "TẮT";
            document.getElementById("txtSprinkler").className = "pccc-value";
        }
    }

    // --- LOGIC KÍCH HOẠT KỊCH BẢN BÁO CHÁY KHẨN CẤP TỰ ĐỘNG ---
    if (smoke === 1 || temp > 50) {
        if (!isFireAlarming) {
            isFireAlarming = true; 
            
            document.body.classList.add("fire-emergency");
            if(document.getElementById("systemStatusBlock")) document.getElementById("systemStatusBlock").classList.add("alarm-active");
            if(document.getElementById("statusText")) document.getElementById("statusText").innerHTML = "⚠️ HOẢ HOẠN KHẨN CẤP ⚠️";
            
            addLog("BÁO ĐỘNG ĐỎ: Phát hiện sự cố cháy hầm xe! Kích hoạt cứu hỏa tự động!", "alarm");
            
            firebase.database().ref("BarieVao").set(0);               
            firebase.database().ref("BarieRa").set(1);                 
            firebase.database().ref("Moi truong/Coi hu").set(1);       
            firebase.database().ref("Moi truong/Voi phun").set(1);     
        }
    } else {
        if (isFireAlarming) {
            isFireAlarming = false; 
            
            document.body.classList.remove("fire-emergency");
            if(document.getElementById("systemStatusBlock")) document.getElementById("systemStatusBlock").classList.remove("alarm-active");
            if(document.getElementById("statusText")) document.getElementById("statusText").innerHTML = "HỆ THỐNG LIVE";
            addLog("Hệ thống PCCC: Sự cố dập tắt hoàn toàn. Môi trường an toàn trở lại.", "system");
            
            firebase.database().ref("BarieVao").set(0); 
            firebase.database().ref("BarieRa").set(0); 
            firebase.database().ref("Moi truong/Coi hu").set(0);       
            firebase.database().ref("Moi truong/Voi phun").set(0);     
        }
    }

    initialLoad.PCCC = false;
    autoCalculateAndSync();
});

// ================= SỰ KIỆN CLICK ĐIỀU KHIỂN ĐỘC LẬP 2 BARIE =================
document.getElementById("btnOpenVao")?.addEventListener("click", () => {
    firebase.database().ref("BarieVao").set(1);
    addLog("Admin chủ động MỞ Barie làn VÀO.", "info");
});
document.getElementById("btnCloseVao")?.addEventListener("click", () => {
    firebase.database().ref("BarieVao").set(0);
    addLog("Admin chủ động ĐÓNG Barie làn VÀO.", "info");
});

document.getElementById("btnOpenRa")?.addEventListener("click", () => {
    firebase.database().ref("BarieRa").set(1);
    addLog("Admin chủ động MỞ Barie làn RA.", "info");
});
document.getElementById("btnCloseRa")?.addEventListener("click", () => {
    firebase.database().ref("BarieRa").set(0);
    addLog("Admin chủ động ĐÓNG Barie làn RA.", "info");
});