document.addEventListener("DOMContentLoaded", function () {
  const tooltipTriggerList = document.querySelectorAll(
    '[data-bs-toggle="tooltip"]'
  );
  const tooltipList = [...tooltipTriggerList].map(
    (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
  );
});

// Main calculation logic

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calcForm");
  const submitBtn = document.getElementById("submitBtn");
  const btnSpinner = document.getElementById("btnSpinner");
  const errorBox = document.getElementById("error");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Reset error
    errorBox.style.display = "none";
    errorBox.textContent = "";

    // Disable button + show spinner
    submitBtn.disabled = true;
    btnSpinner.classList.remove("d-none");

    // Collect data
    const payload = {
      annual_income: +document.getElementById("annual_income").value,
      annual_spending: +document.getElementById("annual_spending").value,
      current_age: +document.getElementById("current_age").value,
      retirement_age: +document.getElementById("retirement_age").value,
      current_savings: +document.getElementById("current_savings").value,
      inflation_rate:
        (+document.getElementById("inflation_rate").value || 3) / 100,
      life_expectancy: +document.getElementById("life_expectancy").value,
    };

    try {
      const res = await fetch("/retirement/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      // Save data in sessionStorage so the results page can use it
      sessionStorage.setItem("retirementResults", JSON.stringify(data));

      // Redirect smoothly
      window.location.href = "/retirement/results";
    } catch (err) {
      alert(err.message);
      submitBtn.disabled = false;
      btnSpinner.classList.add("d-none");
    } finally {
      // Always reset button + spinner
      submitBtn.disabled = false;
      btnSpinner.classList.add("d-none");
    }
  });
});
