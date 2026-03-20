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