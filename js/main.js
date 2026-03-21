const reveals = document.querySelectorAll(".reveal");

function revealOnScroll(){

for(let i=0;i<reveals.length;i++){

const windowHeight = window.innerHeight;

const revealTop = reveals[i].getBoundingClientRect().top;

const revealPoint = 100;

if(revealTop < windowHeight - revealPoint){

reveals[i].classList.add("active");

}

}

}

window.addEventListener("scroll", revealOnScroll);

function formatNumber(num){

if(num >= 1000000000){
return (num/1000000000).toFixed(1)+"B";
}

if(num >= 1000000){
return (num/1000000).toFixed(1)+"M";
}

if(num >= 1000){
return (num/1000).toFixed(1)+"K";
}

return num;
}

async function loadPrice(){

const url="https://api.dexscreener.com/latest/dex/tokens/CONTRACT ADDRESS";

try{

const res=await fetch(url);
const data=await res.json();

if(!data.pairs || data.pairs.length===0) return;

const pair=data.pairs[0];

const price=parseFloat(pair.priceUsd);

const mc=parseFloat(pair.fdv);

document.getElementById("price").innerText="$"+price.toFixed(6);

document.getElementById("mc").innerText="$"+formatNumber(mc);

}catch(e){

console.log(e);

}

}

loadPrice();
setInterval(loadPrice,10000);

function copyContract() {
    const contract = document
        .getElementById("contract-address")
        .getAttribute("data-full");

    const btn = document.getElementById("copy-btn");

    navigator.clipboard.writeText(contract);

    btn.innerText = "Copied ✓";
    btn.style.background = "#ffae00"; // giữ vàng
    btn.style.color = "#000";
    btn.style.boxShadow = "0 0 20px #22c55e"; // glow xanh báo thành công
    btn.style.transform = "scale(1.1)";

    setTimeout(() => {
        btn.innerText = "Copy";
        btn.style.background = "#ffae00"; // giữ vàng luôn
        btn.style.color = "#000";
        btn.style.boxShadow = "0 0 10px rgba(255,174,0,0.6)";
        btn.style.transform = "scale(1)";
    }, 1500);
}

let points = parseInt(localStorage.getItem("points")) || 0;

const pointsEl = document.getElementById("points");
if (pointsEl) {
  pointsEl.innerText = points;
}

// COIN
function spawnCoin() {
  const container = document.getElementById("coin-container");
  if (!container) return;

  const coin = document.createElement("div");
  coin.className = "coin";
  coin.innerText = "💰";

  coin.style.left = Math.random() * window.innerWidth + "px";
  coin.style.bottom = "0px";

  container.appendChild(coin);

  setTimeout(() => coin.remove(), 1000);
}

const TASKS = {
  twitter: {
    url: "https://twitter.com/yourlink",
    points: 10
  },
  telegram: {
    url: "https://t.me/yourgroup",
    points: 10
  },
  retweet: {
    url: "https://twitter.com/yourpost",
    points: 20
  }
};

// load trạng thái cũ
let completedTasks = JSON.parse(localStorage.getItem("tasks")) || {};

updateUI();

// bắt đầu task
function startTask(btn, taskKey) {
  const task = TASKS[taskKey];
  if (completedTasks[taskKey]) return;

  localStorage.setItem("task_" + taskKey, "started");

  window.open(task.url, "_blank");

  btn.disabled = true;

  const delay = Math.floor(Math.random() * 5000) + 10000; // 10–15s
  let timeLeft = Math.floor(delay / 1000);

  btn.innerText = "Checking... " + timeLeft + "s";

  const countdown = setInterval(() => {
    timeLeft--;
    btn.innerText = "Checking... " + timeLeft + "s";

    if (timeLeft <= 0) {
      clearInterval(countdown);
    }
  }, 1000);

  setTimeout(() => {
    btn.innerText = "Claim Reward";
    btn.disabled = false;
    btn.onclick = () => claimTask(btn, taskKey);
  }, delay);
}

// claim task
function claimTask(btn, taskKey) {
  if (completedTasks[taskKey]) return;

  const task = TASKS[taskKey];

  completedTasks[taskKey] = true;
  points += task.points;

  localStorage.setItem("tasks", JSON.stringify(completedTasks));
  localStorage.setItem("points", points);

  btn.innerText = "Done ✅ +" + task.points;
  btn.disabled = true;

  updateUI();
}

// update UI khi load lại

let canWork = true;

function produce(btn) {
  if (!canWork) return;

  canWork = false;

  // 🎲 random reward
  const reward = Math.random() < 0.2 ? 20 : 5;
  points += reward;

  localStorage.setItem("points", points);
  updateUI();

  // 💰 hiệu ứng coin
  for (let i = 0; i < 5; i++) {
    spawnCoin();
  }

  // 💥 hiện reward
  btn.innerText = "+ " + reward;

  // ⏱ cooldown
  let timeLeft = 60;
  btn.disabled = true;

  const interval = setInterval(() => {
    btn.innerText = "Wait " + timeLeft + "s";
    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(interval);
      btn.innerText = "Produce $FDEV";
      btn.disabled = false;
      canWork = true;
    }
  }, 1000);
}

// ===== USER NAME SYSTEM =====
function saveName() {
  const name = document.getElementById("usernameInput").value.trim();

  if (name.length < 3) {
    alert("Tên phải >= 3 ký tự");
    return;
  }

  localStorage.setItem("username", name);
  loadName();
}

function loadName() {
  const name = localStorage.getItem("username") || "Guest";
  document.getElementById("displayName").innerText = name;
}

// load khi vào web
loadName();

function updateUI() {
  document.querySelectorAll(".task").forEach((el) => {
    const text = el.innerText.toLowerCase();

    let key = "";
    if (text.includes("twitter")) key = "twitter";
    if (text.includes("telegram")) key = "telegram";
    if (text.includes("retweet")) key = "retweet";

    const btn = el.querySelector("button");
    const started = localStorage.getItem("task_" + key);

    if (completedTasks[key]) {
      btn.innerText = "Done ✅";
      btn.disabled = true;
    } else if (started) {
      btn.innerText = "Claim Reward";
      btn.disabled = false;
      btn.onclick = () => claimTask(btn, key);
    } else {
      btn.innerText = "Start";
      btn.disabled = false;
      btn.onclick = () => startTask(btn, key);
    }
  });

  document.getElementById("points").innerText = points;
}

function generateLeaderboard() {
  const name = localStorage.getItem("username") || "YOU";

  html += `<p style="color:orange">👉 ${name} - ${points} pts</p>`;
}

generateLeaderboard();
setInterval(generateLeaderboard, 10000);