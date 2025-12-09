// Alt1 alkalmazás azonosítása
if (window.alt1) {
    alt1.identifyAppUrl("./appconfig.json");
}

// Változók beállítása
var reader = new ChatBoxReader();
reader.readargs = {
    colors: [
        a1lib.mixcolor(255, 255, 255), // Fehér szöveg (sima chat)
        a1lib.mixcolor(127, 169, 255), // Kék rendszerüzenet
        a1lib.mixcolor(255, 0, 0)      // Piros (ha a fail üzenet piros lenne)
    ]
};

// Állapot tároló (State)
var state = {
    success: 0,
    fail: 0
};

// --- INDÍTÁS ---
window.onload = function () {
    // 1. Korábbi mentés betöltése
    loadState();
    updateUI();

    // 2. Chatbox keresése
    findChat();
};

function findChat() {
    if (!reader.pos) {
        var pos = reader.find();
        if (pos) {
            console.log("Chatbox megtalálva!");
            // Ha megvan, indítjuk a figyelést (600ms = 1 game tick)
            // Az eredeti kód bonyolult időzítője helyett ez stabilabb:
            setInterval(readChat, 600);
        } else {
            console.log("Chatbox keresése...");
            setTimeout(findChat, 1000);
        }
    }
}

// --- FŐ LOGIKA ---
function readChat() {
    var lines = reader.read();
    
    // Ha nincs új sor, kilépünk
    if (!lines) return;

    for (var i = 0; i < lines.length; i++) {
        var text = lines[i].text;

        // Eredeti bonyolult "CheckLine" helyett egyszerűsített keresés:
        
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

// --- UI FRISSÍTÉS ---
// Az eredeti bonyolult "buildTable" helyett csak a számokat írjuk át
function updateUI() {
    // Ha léteznek az elemek a HTML-ben, frissítjük őket
    var successEl = document.getElementById('success-count');
    var failEl = document.getElementById('fail-count');
    
    if (successEl) successEl.innerText = state.success;
    if (failEl) failEl.innerText = state.fail;
}

// --- MENTÉS KEZELÉS ---
function saveState() {
    // LocalStorage használata, hogy ne vesszen el frissítéskor
    localStorage.setItem('thieving_tracker_state', JSON.stringify(state));
}

function loadState() {
    var saved = localStorage.getItem('thieving_tracker_state');
    if (saved) {
        try {
            state = JSON.parse(saved);
        } catch (e) {
            console.error("Hiba a mentés betöltésekor", e);
            // Ha hibás a mentés, alaphelyzetbe állítjuk
            state = { success: 0, fail: 0 };
        }
    }
}

// --- NULLÁZÁS ---
// Ezt a függvényt hívja meg a "Reset" gomb a HTML-ben
function resetTracker() {
    state.success = 0;
    state.fail = 0;
    saveState();
    updateUI();
}
