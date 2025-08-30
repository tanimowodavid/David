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

// <!-- Theme Toggle Script -->
const toggleBtn = document.getElementById("theme-toggle");
const root = document.documentElement;

// Set initial button text
if (root.getAttribute("data-theme") === "dark") {
  toggleBtn.innerHTML = "Lumos";
} else {
  toggleBtn.innerHTML = "Nox";
}

toggleBtn.addEventListener("click", () => {
  if (root.getAttribute("data-theme") === "dark") {
    root.removeAttribute("data-theme"); // switch to light
    toggleBtn.innerHTML = "Nox"; // update text
  } else {
    root.setAttribute("data-theme", "dark"); // switch to dark
    toggleBtn.innerHTML = "Lumos"; // update text
  }
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
