// ===== CONFIG =====
const SUPABASE_URL = "https://ikkzvpxpuetdqugqhfm.supabase.co";
const SUPABASE_KEY = "sb_publishable_YPnjOSZeFNW9H3HRheIGXQ_EwGhrEOM"; // dán key của bạn

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== WALLET =====
let userWallet = null;

// connect Phantom
async function connectWallet() {
  try {
    const resp = await window.solana.connect();
    userWallet = resp.publicKey.toString();

    localStorage.setItem("wallet", userWallet);

    document.getElementById("wallet").innerText =
      userWallet.slice(0, 4) + "..." + userWallet.slice(-4);

    await saveUser();
    loadLeaderboard();
  } catch (err) {
    alert("Chưa cài Phantom!");
  }
}

// auto reconnect
window.onload = async () => {
  if (localStorage.getItem("wallet")) {
    userWallet = localStorage.getItem("wallet");
    document.getElementById("wallet").innerText =
      userWallet.slice(0, 4) + "..." + userWallet.slice(-4);

    await saveUser();
    loadLeaderboard();
  }
};

// ===== SAVE USER =====
async function saveUser() {
  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", userWallet);

  if (data.length === 0) {
    await supabaseClient.from("users").insert([
      {
        wallet: userWallet,
        points: 0,
      },
    ]);
  }
}

// ===== ADD POINT =====
async function addPoint() {
  if (!userWallet) {
    alert("Connect wallet trước!");
    return;
  }

  const { data } = await supabaseClient
    .from("users")
    .select("*")
    .eq("wallet", userWallet)
    .single();

  let newPoint = data.points + 1;

  await supabaseClient
    .from("users")
    .update({ points: newPoint })
    .eq("wallet", userWallet);

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

  document.getElementById("leaderboard").innerHTML = html;
}

async function connectWallet() {
  if (!window.solana || !window.solana.isPhantom) {
    alert("Cài Phantom trước nha 😅");
    return;
  }

  try {
    const resp = await window.solana.connect();
    userWallet = resp.publicKey.toString();

    localStorage.setItem("wallet", userWallet);

    document.getElementById("wallet").innerText =
      userWallet.slice(0, 4) + "..." + userWallet.slice(-4);

    await saveUser();
    loadLeaderboard();
  } catch (err) {
    console.log(err);
  }
}