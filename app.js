// ===== CONFIG =====
const SUPABASE_URL = "https://ikkzvpxpuetdqugqhfm.supabase.co";
const SUPABASE_KEY = "sb_publishable_YPnjOSZeFNW9H3HRheIGXQ_EwGhrEOM"; // dán key của bạn

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== WALLET =====
window.APP = {
  userWallet: null
};

// connect Phantom

// auto reconnect
window.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("wallet")) {
    window.APP.userWallet = localStorage.getItem("wallet");

    const el = document.getElementById("wallet");

    if (el && window.APP.userWallet) {
      el.innerText =
        window.APP.userWallet.slice(0, 4) +
        "..." +
        window.APP.userWallet.slice(-4);
    }

    await saveUser();
    loadLeaderboard();
  }
});

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
      },
    ]);
  }
}

// ===== ADD POINT =====
async function addPoint() {
  if (!window.APP.userWallet) {
    alert("Connect wallet trước!");
    return;
  }

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", window.APP.userWallet)
    .single();

  let newPoint = data.points + 1;

  await supabaseClient
    .from("users")
    .update({ points: newPoint })
    .eq("wallet", window.APP.userWallet);

  document.getElementById("points").innerText = newPoint;
  document.getElementById("points-nav").innerText = newPoint;
  loadLeaderboard();
}

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
        #${index + 1} - ${user.wallet.slice(0,4)}...${user.wallet.slice(-4)} : ${user.points}
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