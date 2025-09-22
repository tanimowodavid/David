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

//  Q U O T E

/* ----------------- config ----------------- */
const MAX_QUOTE_LENGTH = 200;

/* ----------------- helpers ----------------- */
function sanitizeText(s) {
  // small sanitizer for text nodes (we use textContent later, but keep helper)
  return String(s || "").trim();
}

/* ----------------- element refs ----------------- */
const avatarRow = document.querySelector(".avatar-row");
const mainQuote = document.getElementById("main-quote");
const leaveMarkBtn = document.getElementById("leave-mark");
const modal = document.getElementById("quote-modal");
const closeBtn = document.getElementById("close-modal");
const submitBtn = document.getElementById("submit-quote");
const nameInput = document.getElementById("name-input");
const quoteInput = document.getElementById("quote-input");
const charCount = document.getElementById("char-count"); // optional if you added a counter

/* ----------------- UI helpers ----------------- */
function renderMainQuote(obj) {
  // obj: {name, quote, avatar}
  mainQuote.innerHTML = ""; // clear

  const mark = document.createElement("p");
  mark.className = "quote-mark";
  mark.innerHTML = '<i class="bi bi-quote"></i>'; // icon element

  const p = document.createElement("p");
  p.textContent = obj.quote;

  const span = document.createElement("span");
  span.textContent = "— " + obj.name;

  const img = document.createElement("img");
  img.className = "avatar";
  img.src = obj.avatar;
  img.alt = obj.name + " avatar";

  mainQuote.appendChild(mark);
  mainQuote.appendChild(p);
  mainQuote.appendChild(span);
  // mainQuote.appendChild(img);
}

function rebuildAvatarRow(quotesArray) {
  // quotesArray: newest-first (index 0 is newest)
  avatarRow.innerHTML = ""; // clear existing
  quotesArray.forEach((q) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "quote-toggle";
    btn.dataset.quote = q.quote;
    btn.dataset.name = q.name;
    btn.dataset.avatar = q.avatar;

    const img = document.createElement("img");
    img.className = "avatar";
    img.src = q.avatar;
    img.alt = q.name;

    btn.appendChild(img);
    avatarRow.appendChild(btn);
  });
}

/* ----------------- event delegation for avatar clicks ----------------- */
if (avatarRow) {
  avatarRow.addEventListener("click", (e) => {
    const btn = e.target.closest(".quote-toggle");
    if (!btn) return;
    const q = btn.dataset.quote;
    const n = btn.dataset.name;
    const a = btn.dataset.avatar;
    renderMainQuote({ name: n, quote: q, avatar: a });
  });
}

/* ----------------- modal toggles ----------------- */
if (leaveMarkBtn)
  leaveMarkBtn.addEventListener("click", () =>
    modal.classList.remove("hidden")
  );
if (closeBtn)
  closeBtn.addEventListener("click", () => modal.classList.add("hidden"));

/* optional char counter */
if (charCount && quoteInput) {
  quoteInput.setAttribute("maxlength", MAX_QUOTE_LENGTH);
  quoteInput.addEventListener("input", () => {
    charCount.textContent = `${quoteInput.value.length}/${MAX_QUOTE_LENGTH}`;
  });
}

/* ----------------- submit handler ----------------- */
if (submitBtn) {
  submitBtn.addEventListener("click", async () => {
    const name = sanitizeText(nameInput.value);
    const quote = sanitizeText(quoteInput.value);

    // basic validation
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    if (!quote) {
      alert("Please enter a short quote.");
      return;
    }
    if (quote.length > MAX_QUOTE_LENGTH) {
      alert(`Please keep the quote under ${MAX_QUOTE_LENGTH} characters.`);
      return;
    }

    // send to server
    try {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      const res = await fetch("/add-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quote }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Server error");
      }

      const data = await res.json(); // expected: array of latest quotes, newest-first
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Unexpected server response");
      }

      // Use the returned array (server should return the last 3 newest quotes)
      // Rebuild the avatar row and render the top quote
      rebuildAvatarRow(data);
      renderMainQuote(data[0]);

      // reset & close modal
      nameInput.value = "";
      quoteInput.value = "";
      if (charCount) charCount.textContent = `0/${MAX_QUOTE_LENGTH}`;
      modal.classList.add("hidden");
    } catch (err) {
      console.error(err);
      alert("Could not save your mark right now. Try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });
}
