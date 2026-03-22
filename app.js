// ===== CONFIG =====
const SUPABASE_URL = "https://ikkzvpxpuetdqugqhfm.supabase.co";
const SUPABASE_KEY = "sb_publishable_YPnjOSZeFNW9H3HRheIGXQ_EwGhrEOM"; // dán key của bạn

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

window.addEventListener("DOMContentLoaded", async () => {
  const wallet = localStorage.getItem("wallet");

  if (!wallet) return;

  window.APP.userWallet = wallet;

  const el = document.getElementById("wallet");
  if (el) {
    el.innerText = wallet.slice(0,4) + "..." + wallet.slice(-4);
  }

  await saveUser();
  loadLeaderboard();
});

// ===== WALLET =====
window.APP = {
  userWallet: null
};

// connect Phantom

// auto reconnect
async function produce(btn) {
  if (!window.APP.userWallet) {
    alert("Connect wallet trước!");
    return;
  let isWorking = false;
  if (isWorking) return;
  isWorking = true;
  }

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", window.APP.userWallet)
    .single();

  let reward = Math.random() < 0.2 ? 20 : 5;
  let newPoint = data.points + reward;

  await supabaseClient
    .from("users")
    .update({ points: newPoint })
    .eq("wallet", window.APP.userWallet);

  document.getElementById("points").innerText = newPoint;
  document.getElementById("points-nav").innerText = newPoint;

  btn.innerText = "+ " + reward;
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
  // ✅ nếu có Phantom (PC hoặc app browser)
  if (window.solana && window.solana.isPhantom) {
    try {
      const resp = await window.solana.connect();
      window.APP.userWallet = resp.publicKey.toString();
    } catch (err) {
      console.log(err);
      return;
    }
  } else {
    // 📱 MOBILE → mở Phantom app
    const url = window.location.href;
    window.location.href =
      "https://phantom.app/ul/browse/" + encodeURIComponent(url);
    return;
  }

  // save
  localStorage.setItem("wallet", window.APP.userWallet);

  // UI
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

setTimeout(() => {
  btn.innerText = "Produce $FDEV";
  btn.disabled = false;
  isWorking = false;
}, 3000);