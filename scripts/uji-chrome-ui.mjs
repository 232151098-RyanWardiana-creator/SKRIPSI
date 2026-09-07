import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const USER_DATA_DIR = path.join(process.env.LOCALAPPDATA || "C:\\Temp", "lkpd-chrome-test-" + Date.now());

const browser = spawn(CHROME_PATH, [
  "--headless=new",
  "--remote-debugging-port=9240",
  `--user-data-dir=${USER_DATA_DIR}`,
  "--disable-gpu",
  "--no-first-run",
  "about:blank",
]);

async function waitPort(port) {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return await res.json();
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Chrome port not ready");
}

try {
  await waitPort(9240);
  console.log("1. Chrome headless siap.");

  // Buat target tab baru langsung ke http://127.0.0.1:3100/dashboard-siswa
  const newTabRes = await fetch("http://127.0.0.1:9240/json/new?http://127.0.0.1:3100/dashboard-siswa", { method: "PUT" });
  const tab = await newTabRes.json();
  console.log("2. Tab dibuka:", tab.url);

  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let reqId = 1;
  const pending = new Map();
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = reqId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });

  const evalJs = async (expr) => {
    const res = await send("Runtime.evaluate", {
      expression: expr,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval error: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");

  console.log("3. Menunggu React me-mount form...");
  let formDitemukan = false;
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 500));
    const loc = await evalJs("window.location.href");
    const teks = await evalJs("document.body ? document.body.innerText : ''");
    if (teks && (teks.includes("Masuk ke Kelas") || teks.includes("Kode kelas") || teks.includes("Contoh: VIIA"))) {
      console.log(`   Form ditemukan di detik ke-${(i * 0.5).toFixed(1)}!`);
      formDitemukan = true;
      break;
    }
  }

  if (!formDitemukan) {
    const isi = await evalJs("document.body ? document.body.innerText : 'null'");
    console.log("Form belum muncul. Isi layar saat ini:\n", isi);
  } else {
    console.log("4. Memasukkan kode kelas SIMULASI-01...");
    await evalJs(`(() => {
      const input = document.querySelector('input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'SIMULASI-01');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    })()`);

    await new Promise((r) => setTimeout(r, 400));
    await evalJs(`(() => {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    })()`);

    console.log("5. Menunggu daftar siswa kelas...");
    let namaMuncul = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const teks = await evalJs("document.body.innerText");
      if (teks.includes("Aisyah Nurhaliza") || teks.includes("Pilih namamu")) {
        console.log("   Daftar siswa kelas muncul!");
        namaMuncul = true;
        break;
      }
    }
    if (!namaMuncul) {
      console.log("Daftar belum muncul. Teks layar:", await evalJs("document.body.innerText"));
    }

    console.log("6. Mengklik siswa Aisyah Nurhaliza...");
    await evalJs(`(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const aisyah = btns.find(b => b.innerText.includes('Aisyah Nurhaliza'));
      aisyah.click();
    })()`);

    console.log("7. Menunggu form PIN...");
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 300));
      const teks = await evalJs("document.body.innerText");
      if (teks.includes("PIN") || teks.includes("Masukkan PIN")) {
        console.log("   Form PIN muncul!");
        break;
      }
    }

    console.log("8. Memasukkan PIN 1234 dan submit...");
    await evalJs(`(() => {
      const inputPin = document.querySelector('input[type=\"password\"], input[inputmode=\"numeric\"], input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(inputPin, '1234');
      inputPin.dispatchEvent(new Event('input', { bubbles: true }));
      inputPin.dispatchEvent(new Event('change', { bubbles: true }));
      const form = inputPin.closest('form');
      form.requestSubmit();
    })()`);

    console.log("9. Menunggu Dashboard Siswa memuat data Aisyah...");
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const teks = await evalJs("document.body.innerText");
      if (teks.includes("Halo, Aisyah Nurhaliza") || teks.includes("Lembar LKPD Siswa")) {
        console.log("   DASHBOARD SISWA BERHASIL DIMUAT!");
        break;
      }
    }

    const hasilTeks = await evalJs("document.body.innerText");
    console.log("\n=== RINGKASAN TAMPILAN DASHBOARD SISWA ===");
    console.log(hasilTeks);

    // Cek cookies di Chrome
    const { cookies } = await send("Network.getCookies");
    const cookieSiswa = cookies.find((c) => c.name === "lkpd_siswa");
    console.log("\n=== STATUS COOKIE OTENTIKASI SISWA ===");
    console.log("Cookie lkpd_siswa :", cookieSiswa ? "VALID & AKTIF" : "TIDAK ADA");
    console.log("httpOnly          :", cookieSiswa?.httpOnly);
    console.log("Secure            :", cookieSiswa?.secure);
    console.log("Path              :", cookieSiswa?.path);
  }

  ws.close();
} catch (e) {
  console.error("Error:", e);
} finally {
  browser.kill();
  try {
    fs.rmSync(USER_DATA_DIR, { recursive: true, force: true });
  } catch {}
}
