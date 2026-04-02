// ===== CONFIG =====
const SUPABASE_URL = "https://ikkzvpxpuetdqugqhfm.supabase.co";
const SUPABASE_KEY = "sb_publishable_YPnjOSZeFNW9H3HRheIGXQ_EwGhrEOM"; // dán key của bạn

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== WALLET =====
window.APP = {
  userWallet: null
};

window.addEventListener("DOMContentLoaded", async () => {
  let wallet = localStorage.getItem("wallet");

// thử reconnect Phantom trước
if (window.solana && window.solana.isPhantom) {
  try {
    const resp = await window.solana.connect({ onlyIfTrusted: true });
    if (resp.publicKey) {
      wallet = resp.publicKey.toString();
      localStorage.setItem("wallet", wallet);
    }
  } catch (e) {}
}

if (!wallet) return;

  window.APP.userWallet = wallet;

  const el = document.getElementById("wallet");
  if (el) {
    el.innerText = wallet.slice(0,4) + "..." + wallet.slice(-4);
  }

  await saveUser();
  loadLeaderboard();
  loadTasksUI();
});

// connect Phantom

// auto reconnect
let isWorking = false;

async function produce(btn) {
  if (!window.APP.userWallet) {
    alert("Connect wallet trước!");
    return;
  }

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", window.APP.userWallet)
    .single();

  if (!data) return;

  const now = Date.now();
  const last = new Date(data.last_work || 0).getTime();

  // ⏱ cooldown 60s
  if (now - last < 60000) {
    const remain = Math.ceil((60000 - (now - last)) / 1000);
    alert("Wait " + remain + "s");
    return;
  }

  let newPoint = data.points + 5;

  await supabaseClient
    .from("users")
    .update({
      points: newPoint,
      last_work: new Date().toISOString()
    })
    .eq("wallet", window.APP.userWallet);

  document.getElementById("points").innerText = newPoint;
  document.getElementById("points-nav").innerText = newPoint;

  btn.innerText = "+5";
  btn.disabled = true;

  setTimeout(() => {
    btn.innerText = "Produce $FDEV";
    btn.disabled = false;
  }, 3000);

  loadLeaderboard();
}

// ===== SAVE USER =====
async function saveUser() {
  if (!window.APP.userWallet) return;

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", window.APP.userWallet);

  if (!data || data.length === 0) {
    await supabaseClient.from("users").insert([
      {
        wallet: window.APP.userWallet,
        points: 0,
        name: "Guest"
      },
    ]);
  }
  if (data && data.length > 0) {
  document.getElementById("displayName").innerText = data[0].name || "Guest";
  document.getElementById("points").innerText = data[0].points;
  document.getElementById("points-nav").innerText = data[0].points;
}
}

async function saveName() {
  const name = document.getElementById("usernameInput").value.trim();

  if (name.length < 3) {
    alert("Tên phải >= 3 ký tự");
    return;
  }

  if (!window.APP.userWallet) {
    alert("Connect wallet trước!");
    return;
  }

  await supabaseClient
    .from("users")
    .update({ name: name })
    .eq("wallet", window.APP.userWallet);

  document.getElementById("displayName").innerText = name;
}

// ===== ADD POINT ====

// ===== LEADERBOARD =====
async function loadLeaderboard() {
  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .order("points", { ascending: false })
    .limit(10);

  let html = "";

  data.forEach((user, index) => {
    html += `
      <div>
        #${index + 1} - 
        ${user.name || user.wallet.slice(0,4)+"..."} 
        : ${user.points}
     </div>
    `;
  });

  const board = document.getElementById("leaderboard");
  if (board) board.innerHTML = html;
}

async function connectWallet() {
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();

      window.APP.userWallet = resp.publicKey.toString();
    } catch (err) {
      console.log(err);
      return;
    }
  } else {
    const url = window.location.href;
    window.location.href =
      "https://phantom.app/ul/browse/" + encodeURIComponent(url);
    return;
  }

  localStorage.setItem("wallet", window.APP.userWallet);

  const el = document.getElementById("wallet");
  if (el) {
    el.innerText =
      window.APP.userWallet.slice(0, 4) +
      "..." +
      window.APP.userWallet.slice(-4);
  }

  await saveUser();
  loadLeaderboard();
}

const TASKS = {
  twitter: { url: "https://x.com/factory_fdev", points: 10 },
  telegram: { url: "https://t.me/fdevfactory", points: 10 },
  retweet: { url: "https://x.com/factory_fdev", points: 20 }
};

async function startTask(btn, key) {
  const task = TASKS[key];

  window.open(task.url, "_blank");

  btn.disabled = true;
  btn.innerText = "Checking...";

  setTimeout(() => {
    btn.innerText = "Claim";
    btn.disabled = false;
    btn.onclick = () => claimTask(btn, key);
  }, 10000); // 10s
}

async function claimTask(btn, key) {
  const wallet = window.APP.userWallet;

  if (!wallet) {
    alert("Connect wallet trước!");
    return;
  }

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", wallet)
    .single();

  let tasks = data.tasks || {};

  const today = new Date().toDateString();

  // ❌ đã làm hôm nay rồi
  if (tasks[key] === today) {
    alert("Already claimed today");
    return;
  }

  let newPoint = data.points + TASKS[key].points;

  tasks[key] = today;

  await supabaseClient
    .from("users")
    .update({
      points: newPoint,
      tasks: tasks
    })
    .eq("wallet", wallet);

  document.getElementById("points").innerText = newPoint;
  document.getElementById("points-nav").innerText = newPoint;

  btn.innerText = "Done ✅";
  btn.disabled = true;

  loadLeaderboard();
}

async function loadTasksUI() {
  const wallet = window.APP.userWallet;
  if (!wallet) return;

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", wallet)
    .single();

  const tasks = data.tasks || {};
  const today = new Date().toDateString();

  document.querySelectorAll(".task").forEach((el) => {
    const text = el.innerText.toLowerCase();
    let key = "";

    if (text.includes("twitter")) key = "twitter";
    if (text.includes("telegram")) key = "telegram";
    if (text.includes("retweet")) key = "retweet";

    const btn = el.querySelector("button");

    if (tasks[key] === today) {
      btn.innerText = "Done ✅";
      btn.disabled = true;
    }
  });
}

function openGame(type){
  const container = document.getElementById("game-container");

  // clear trước
  container.innerHTML = "";

  if(type === "flappy"){
    container.innerHTML = `
      <iframe src="flappy.html"
        style="
          width:100%;
          max-width:400px;
          height:600px;
          border:none;
          border-radius:12px;
          display:block;
          margin:0 auto;
        ">
      </iframe>
    `;
  }

  if(type === "snake"){
    container.innerHTML = `
      <iframe src="snake.html"
        style="
          width:100%;
          max-width:800px;
          height:800px;
          border:none;
          border-radius:12px;
          display:block;
          margin:0 auto;
        ">
      </iframe>
    `;
  }

  container.scrollIntoView({ behavior: "smooth" });
}