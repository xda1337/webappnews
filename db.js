// db.js - Pengganti Backend untuk GitHub/Vercel
const DB_NAME = "hansfx_db";

// Ambil data dari LocalStorage
function getData() {
    let data = localStorage.getItem(DB_NAME);
    if (!data) {
        // Data awal jika masih kosong (mirip isi journal.json kamu)
        const init = {
            profile: { name: "HansFX", password: "123" },
            trades: [],
            logs: []
        };
        saveData(init);
        return init;
    }
    return JSON.parse(data);
}

// Simpan data ke LocalStorage
function saveData(data) {
    localStorage.setItem(DB_NAME, JSON.stringify(data));
}

// Fungsi pembantu untuk cek login di setiap halaman
function checkAuth() {
    if (sessionStorage.getItem("isLoggedIn") !== "true") {
        window.location.href = "login.html";
    }
}