// Változók inicializálása
let reader = new Chatbox.default();
reader.readargs = {
    colors: [
        a1lib.mixcolor(255, 255, 255), // Fehér szöveg (általános)
        a1lib.mixcolor(127, 169, 255), // Kék rendszerüzenet (néha ez a pickup szöveg színe)
        a1lib.mixcolor(255, 0, 0)      // Piros (ha esetleg stun/fail üzenet piros lenne)
    ]
};

// Állapot tárolása
var state = {
    success: 0,
    fail: 0
};

// Betöltéskor fusson le
window.onload = function () {
    // Ellenőrizzük, hogy van-e Alt1
    if (window.alt1) {
        alt1.identifyAppUrl("./appconfig.json");
    } else {
        console.log("Alt1 nem található (böngésző mód)");
    }

    // Korábbi adatok visszatöltése (ha van mentve)
    loadState();
    updateUI();

    // Chat keresés indítása
    startChatReader();
};

function startChatReader() {
    // Megpróbáljuk megtalálni a chatboxot
    if (!reader.pos) {
        var pos = reader.find();
        if (pos) {
            console.log("Chatbox megtalálva!");
            // Ha megvan, indítjuk a figyelést (600ms = 1 game tick)
            setInterval(readChat, 600);
        } else {
            console.log("Chatbox keresése...");
            // Ha nincs meg, próbáljuk újra 1 mp múlva
            setTimeout(startChatReader, 1000);
        }
    }
}

function readChat() {
    var lines = reader.read();
    
    // Ha nincs új sor, kilépünk
    if (!lines) return;

    for (var i = 0; i < lines.length; i++) {
        var text = lines[i].text;

        // --- LOGIKA ITT KEZDŐDIK ---
        
        // 1. SIKERTELEN (Fail)
        // Üzenet: "You fail to pick the ...'s pocket."
        if (text.indexOf("fail to pick") > -1) {
            state.fail++;
            saveState();
            updateUI();
        }
        
        // 2. SIKERES (Success)
        // Üzenet: "You pick the ...'s pocket."
        // Fontos: Az "else if" kell, mert a "fail to pick"-ben is benne van a "pick" szó!
        else if (text.indexOf("pick the") > -1 && text.indexOf("pocket") > -1) {
            state.success++;
            saveState();
            updateUI();
        }
    }
}

// UI Frissítése
function updateUI() {
    // Ezeknek az ID-knak kell szerepelnie a HTML-ben!
    var successEl = document.getElementById('success-count');
    var failEl = document.getElementById('fail-count');
    
    // XP/Hr vagy Success rate számítás (opcionális extra)
    var total = state.success + state.fail;
    var rate = total > 0 ? Math.round((state.success / total) * 100) : 0;

    if (successEl) successEl.innerText = state.success; // + ` (${rate}%)`; ha akarod a százalékot
    if (failEl) failEl.innerText = state.fail;
}

// Mentés a böngésző memóriájába (localStorage)
function saveState() {
    localStorage.setItem('thieving_tracker_state', JSON.stringify(state));
}

// Betöltés
function loadState() {
    var saved = localStorage.getItem('thieving_tracker_state');
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error("Hiba a mentés betöltésekor", e);
        }
    }
}

// Reset gomb funkció (ezt kösd be a gombodra a HTML-ben: onclick="resetTracker()")
function resetTracker() {
    state.success = 0;
    state.fail = 0;
    saveState();
    updateUI();
}
