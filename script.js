const participantsInput = document.querySelector("#participants");
const winnerCountOutput = document.querySelector("#winnerCount");
const decreaseButton = document.querySelector("#decreaseButton");
const increaseButton = document.querySelector("#increaseButton");
const drawButton = document.querySelector("#drawButton");
const resetButton = document.querySelector("#resetButton");
const resultsSection = document.querySelector("#resultsSection");
const winnerList = document.querySelector("#winnerList");
const resultCount = document.querySelector("#resultCount");
const toast = document.querySelector("#toast");

let winnerCount = 1;

function getParticipants() {
  return [...new Set(
    participantsInput.value
      .split(/\n/)
      .map((name) => name.trim())
      .filter(Boolean)
  )];
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateWinnerCount(nextCount) {
  const participants = getParticipants();
  const maximum = Math.max(1, participants.length);
  winnerCount = Math.min(Math.max(1, nextCount), maximum);
  winnerCountOutput.textContent = winnerCount;
}

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function draw() {
  const participants = getParticipants();

  if (participants.length === 0) {
    showToast("참가자 이름을 입력해주세요");
    participantsInput.focus();
    return;
  }

  if (winnerCount > participants.length) {
    winnerCount = participants.length;
    winnerCountOutput.textContent = winnerCount;
  }

  const winners = shuffle(participants).slice(0, winnerCount);
  winnerList.replaceChildren();

  winners.forEach((name, index) => {
    const item = document.createElement("div");
    item.className = "winner";
    item.style.animationDelay = `${index * 80}ms`;
    item.innerHTML = `
      <span class="winner-rank">${String(index + 1).padStart(2, "0")}</span>
      <span class="winner-name"></span>
    `;
    item.querySelector(".winner-name").textContent = name;
    winnerList.append(item);
  });

  resultCount.textContent = `${winners.length}명`;
  resultsSection.hidden = false;
  launchConfetti();
}

function reset() {
  participantsInput.value = "";
  winnerCount = 1;
  winnerCountOutput.textContent = "1";
  winnerList.replaceChildren();
  resultsSection.hidden = true;
  participantsInput.focus();
  showToast("전체가 초기화되었습니다");
}

decreaseButton.addEventListener("click", () => updateWinnerCount(winnerCount - 1));
increaseButton.addEventListener("click", () => updateWinnerCount(winnerCount + 1));
drawButton.addEventListener("click", draw);
resetButton.addEventListener("click", reset);

participantsInput.addEventListener("input", () => {
  const maximum = getParticipants().length;
  if (maximum > 0 && winnerCount > maximum) updateWinnerCount(maximum);
});

function launchConfetti() {
  const canvas = document.querySelector("#confetti");
  const context = canvas.getContext("2d");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  const ratio = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const colors = ["#7451d8", "#a88de7", "#f2a65a", "#72b6a8", "#e66c88"];
  const pieces = Array.from({ length: 70 }, () => ({
    x: window.innerWidth / 2 + (Math.random() - 0.5) * 180,
    y: window.innerHeight * 0.45,
    vx: (Math.random() - 0.5) * 8,
    vy: -5 - Math.random() * 7,
    gravity: 0.12 + Math.random() * 0.09,
    size: 5 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI,
  }));

  let frame = 0;
  function animate() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((piece) => {
      piece.vy += piece.gravity;
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.rotation += 0.08;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.rotation);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 3, piece.size, piece.size * 0.65);
      context.restore();
    });
    frame += 1;
    if (frame < 100) requestAnimationFrame(animate);
    else context.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  animate();
}
