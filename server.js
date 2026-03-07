const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public')); // Menampilkan file HTML di folder public

// Path file database JSON
// Menggunakan path.join agar kompatibel dengan sistem Linux di Render
const DATA_FILE = path.join(__dirname, 'journal.json');

// Helper: Ambil data
const getData = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const init = { 
                profile: { name: "HansFX", password: "123" }, 
                trades: [], 
                logs: [] 
            };
            fs.writeFileSync(DATA_FILE, JSON.stringify(init, null, 2));
            return init;
        }
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        console.error("Error reading data:", error);
        return { profile: { name: "HansFX", password: "123" }, trades: [], logs: [] };
    }
};

// Helper: Simpan data
const saveData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Error saving data:", error);
    }
};

// --- API ROUTES ---

app.get('journal.json', (req, res) => {
    res.json(getData());
});

// 1. Simpan Transaksi Trade
app.post('/api/trades', (req, res) => {
    const db = getData();
    const t = req.body;
    
    const newTrade = {
        id: Number(t.id) || Date.now(), 
        date: t.date || new Date().toISOString(), 
        pair: (t.pair || "UNKNOWN").toUpperCase(),
        type: t.type || "BUY",
        lot: parseFloat(t.lot) || 0,
        entry: parseFloat(t.entry) || 0,
        sl: parseFloat(t.sl) || 0,
        tp: parseFloat(t.tp) || 0,
        swap: parseFloat(t.swap) || 0,
        komisi: parseFloat(t.komisi) || 0,
        close: parseFloat(t.close) || 0
    };

    db.trades.push(newTrade);
    saveData(db);
    res.json({ success: true });
});

// 2. Hapus Transaksi Trade
app.delete('/api/trades/:id', (req, res) => {
    const db = getData();
    const targetId = Number(req.params.id);
    
    const initialCount = db.trades.length;
    db.trades = db.trades.filter(t => Number(t.id) !== targetId);
    
    if (db.trades.length < initialCount) {
        saveData(db);
        res.json({ success: true, message: "Trade deleted" });
    } else {
        res.status(404).json({ success: false, message: "ID not found" });
    }
});

// 3. Simpan Saldo (Deposit/Withdraw)
app.post('/api/balance', (req, res) => {
    const db = getData();
    const log = {
        id: Date.now(),
        date: req.body.date || new Date().toISOString(),
        type: req.body.type, 
        amount: parseFloat(req.body.amount) || 0
    };
    db.logs.push(log);
    saveData(db);
    res.json({ success: true });
});

// 4. Hapus Log Saldo
app.delete('/api/balance/:id', (req, res) => {
    const db = getData();
    const targetId = Number(req.params.id);
    
    const initialCount = db.logs.length;
    db.logs = db.logs.filter(l => Number(l.id) !== targetId);
    
    if (db.logs.length < initialCount) {
        saveData(db);
        res.json({ success: true, message: "Log deleted" });
    } else {
        res.status(404).json({ success: false, message: "ID not found" });
    }
});

// 5. Update Password
app.post('/api/update-password', (req, res) => {
    const db = getData();
    const newPassword = req.body.password;

    if (newPassword) {
        db.profile.password = newPassword;
        saveData(db);
        res.json({ success: true, message: "Password updated" });
    } else {
        res.status(400).json({ success: false, message: "Missing password field" });
    }
});

// --- SERVER LISTEN ---
// PENTING: process.env.PORT digunakan agar bisa jalan di hosting (Render/Heroku/dll)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`SERVER RUNNING ON PORT: ${PORT}`);
});
