let gameSeq = [];
let userSeq = [];
let btns = ["red", "blue", "green", "yellow"];

let started = false;
let canClick = false;
let level = 0;

let h3 = document.querySelector("h3");


// ================= AUDIO SYSTEM =================

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration = 0.2, type = "sine") {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);

    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        audioCtx.currentTime + duration
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}


// Color button sounds

function playColorSound(color) {
    let frequencies = {
        red: 261.63,
        blue: 329.63,
        green: 392.00,
        yellow: 523.25
    };

    playTone(frequencies[color], 0.2, "sine");
}


// Danger sound
function playWrongSound() {
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }

    let now = audioCtx.currentTime;

    // 💥 Initial DHADAM impact
    playTone(80, 0.5, "square");

    // 🔊 5-second rumbling danger effect
    let oscillator = audioCtx.createOscillator();
    let gainNode = audioCtx.createGain();

    oscillator.type = "sawtooth";

    oscillator.frequency.setValueAtTime(120, now + 0.1);

    oscillator.frequency.exponentialRampToValueAtTime(
        30,
        now + 5
    );

    gainNode.gain.setValueAtTime(0.4, now + 0.1);

    gainNode.gain.exponentialRampToValueAtTime(
        0.001,
        now + 5
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start(now + 0.1);
    oscillator.stop(now + 5);
}


// ================= GAME START =================

document.addEventListener("keypress", function () {
    if (started === false) {
        console.log("Game is started");

        started = true;
        levelUp();
    }
});

let startBtn = document.querySelector("#startBtn");

startBtn.addEventListener("click", function () {
    if (started === false) {
        started = true;
        startBtn.style.display = "none";
        levelUp();
    }
});

// ================= BUTTON FLASH =================

function btnFlash(btn) {
    btn.classList.add("flash");

    setTimeout(function () {
        btn.classList.remove("flash");
    }, 150);
}


// ================= LEVEL UP =================

function levelUp() {
    userSeq = [];
    level++;

    h3.innerText = `Level ${level}`;

    canClick = false;

    // Generate random color

    let randomIdx = Math.floor(Math.random() * btns.length);
    let randomColor = btns[randomIdx];

    gameSeq.push(randomColor);

    console.log("Game Sequence:", gameSeq);

    // Play complete sequence

    let i = 0;

    let interval = setInterval(function () {
        let color = gameSeq[i];

        let randomBtn = document.querySelector(`.${color}`);

        btnFlash(randomBtn);
        playColorSound(color);

        i++;

        if (i >= gameSeq.length) {
            clearInterval(interval);

            setTimeout(function () {
                canClick = true;
            }, 200);
        }
    }, 400);
}


// ================= CHECK ANSWER =================

function checkAns(idx) {
    if (userSeq[idx] === gameSeq[idx]) {

        if (userSeq.length === gameSeq.length) {
            canClick = false;

            setTimeout(function () {
                levelUp();
            }, 600);
        }

    } else {
    playWrongSound();

    h3.innerHTML =
        `Game Over! Your score was <b>${level}</b>
        <br>Press any key to start.`;

    // Simon circle niche jayega
    let game = document.querySelector(".game");

    game.classList.add("wrong");

    setTimeout(function () {
        game.classList.remove("wrong");
    }, 500);

    document.querySelector("body").style.backgroundColor = "red";

    setTimeout(function () {
        document.querySelector("body").style.backgroundColor = "black";
    }, 200);

    reset();
}
}


// ================= USER BUTTON PRESS =================

function btnPress() {
    if (started === false || canClick === false) {
        return;
    }

    let btn = this;

    btnFlash(btn);

    let userColor = btn.getAttribute("id");

    playColorSound(userColor);

    userSeq.push(userColor);

    checkAns(userSeq.length - 1);
}


// ================= BUTTON EVENT LISTENERS =================

let allBtn = document.querySelectorAll(".btn");

for (let btn of allBtn) {
    btn.addEventListener("click", btnPress);
}


// ================= RESET GAME =================

function reset() {
    started = false;
    canClick = false;

    gameSeq = [];
    userSeq = [];

    level = 0;
}
document.addEventListener("click", function () {
    if (started === false) {
        started = true;
        levelUp();
    }
}, { once: true });