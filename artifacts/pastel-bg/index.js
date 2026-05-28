const glow = document.getElementById('cursorGlow');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentX = mouseX;
let currentY = mouseY;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function animate() {
  currentX = lerp(currentX, mouseX, 0.08);
  currentY = lerp(currentY, mouseY, 0.08);
  glow.style.left = currentX + 'px';
  glow.style.top = currentY + 'px';
  requestAnimationFrame(animate);
}

animate();
