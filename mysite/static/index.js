// lottie Animations
lottie.loadAnimation({
  container: document.getElementById("floatingdev"),
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "static/floatingdev.json",
});

lottie.loadAnimation({
  container: document.getElementById("sittingdev"),
  renderer: "svg",
  loop: true,
  autoplay: true,
  path: "static/sittingdev.json",
});

function applyTheme() {
  const root = document.documentElement;
  const toggleBtn = document.getElementById("theme-toggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    root.setAttribute("data-theme", "dark");
    toggleBtn.innerHTML = "Lumos";
  } else {
    root.removeAttribute("data-theme");
    toggleBtn.innerHTML = "Nox";
  }
}

// Run on first load
applyTheme();

// Run again when navigating back/forward
window.addEventListener("pageshow", applyTheme);

// Toggle button click
document.getElementById("theme-toggle").addEventListener("click", () => {
  if (document.documentElement.getAttribute("data-theme") === "dark") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
  applyTheme();
});

// N A V  T O G G L E
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

// Toggle when hamburger is clicked
menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

// Close menu when any nav link is clicked
navLinks.querySelectorAll("a, button").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("show");
  });
});
