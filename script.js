document.addEventListener("DOMContentLoaded", function () {
  // Emergency loader hide + debug
  window.addEventListener('load', () => {
    const loader = document.getElementById('loading');
    if (loader) {
      loader.classList.add('hidden');
      // Optional: remove element after fade
      setTimeout(() => loader.remove(), 1000);
    }
  });

  // Initialize EmailJS
  emailjs.init("ejP7Frotlqj7ARWao");

  const form = document.getElementById("bookingForm");
  const submitBtn = document.getElementById("submitBtn");
  const totalPriceEl = document.getElementById("totalPrice");
  const itemsContainer = document.getElementById("itemsContainer");
  const addItemBtn = document.getElementById("addItem");

  function updateTotalDisplay(total) {
    totalPriceEl.textContent = total.toFixed(2);
    submitBtn.disabled = total <= 0;
  }

  function calculateTotal() {
    let total = 0;
    document.querySelectorAll(".item-row").forEach(row => {
      const price = parseFloat(row.querySelector(".itemSelect")?.value) || 0;
      const qty = parseInt(row.querySelector(".quantity")?.value) || 0;
      total += price * qty;
    });
    updateTotalDisplay(total);
  }

  function attachInputListeners() {
    document.querySelectorAll(".itemSelect, .quantity").forEach(input => {
      input.removeEventListener("input", calculateTotal);
      input.addEventListener("input", calculateTotal);
    });
  }

  function updateRemoveButtons() {
    const rows = document.querySelectorAll(".item-row");
    rows.forEach((row, index) => {
      const removeBtn = row.querySelector(".remove-btn");
      if (removeBtn) {
        removeBtn.style.display = rows.length === 1 ? "none" : "inline-block";
      }
    });
  }

  addItemBtn.addEventListener("click", function () {
    const rowCount = document.querySelectorAll(".item-row").length;
    const newRow = document.createElement("div");
    newRow.className = "item-row";
    newRow.innerHTML = `
      <select class="itemSelect" required>
        <option value="">Select item</option>
        <option value="40">Small Bag – ₵40</option>
        <option value="50">Medium Bag – ₵50</option>
        <option value="60">Big Bag – ₵60</option>
        <option value="70">Fridge – ₵70</option>
        <option value="0">Buckets / Free – ₵0</option>
      </select>
      <input type="number" class="quantity" min="1" value="1" required aria-label="Quantity"/>
      <button type="button" class="remove-btn">× Remove</button>
    `;
    itemsContainer.appendChild(newRow);

    newRow.querySelector(".remove-btn").addEventListener("click", function () {
      if (document.querySelectorAll(".item-row").length > 1) {
        newRow.remove();
        calculateTotal();
        updateRemoveButtons();
      }
    });

    attachInputListeners();
    calculateTotal();
    updateRemoveButtons();
  });

  // Initial setup
  attachInputListeners();
  calculateTotal();
  updateRemoveButtons();

  // Min date = today
  const dateInput = document.getElementById("date");
  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  // Hamburger menu
  const menuToggle = document.querySelector('.menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) {
        navLinks.classList.toggle('active');
        const expanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', expanded);
      }
    });
  }

  // Form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (submitBtn.disabled) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    let itemsSummary = "";
    document.querySelectorAll(".item-row").forEach(row => {
      const select = row.querySelector(".itemSelect");
      const qty = row.querySelector(".quantity");
      if (select?.value && qty?.value) {
        const itemName = select.options[select.selectedIndex].text.split(" – ")[0];
        itemsSummary += `• ${itemName} × ${qty.value}\n`;
      }
    });

    const name = document.getElementById("name")?.value || "";
    const phone = document.getElementById("phone")?.value || "";
    const hostel = document.getElementById("hostel")?.value || "";
    const dateVal = document.getElementById("date")?.value || "";
    const timeVal = document.getElementById("time")?.value || "";
    const description = document.getElementById("description")?.value || "";
    const total = totalPriceEl.textContent || "0";

    const templateParams = {
      name, phone, hostel, date: dateVal, time: timeVal,
      description, items: itemsSummary || "No items selected", total
    };

    emailjs.send("service_v4e6v6s", "template_amiu0v6", templateParams)
      .then(() => {
        Swal.fire({
          title: "Booking Sent!",
          html: `We'll confirm soon via WhatsApp or call.<br><br>Want faster confirmation?`,
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#28a745",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Chat on WhatsApp Now",
          cancelButtonText: "Close",
        }).then((result) => {
          if (result.isConfirmed) {
            const message = encodeURIComponent(
              `Hi Kodak Logistics!\n\nBooking request:\nName: ${name}\nHostel: ${hostel}\nPickup: ${dateVal} at ${timeVal}\nItems:\n${itemsSummary}Total: ₵${total}\n\nPlease confirm. Thank you!`
            );
            window.open(`https://wa.me/233545025296?text=${message}`, "_blank");
          }
        });

        form.reset();
        totalPriceEl.textContent = "0.00";
        while (itemsContainer.children.length > 1) {
          itemsContainer.removeChild(itemsContainer.lastChild);
        }
        updateRemoveButtons();
        calculateTotal();
      })
      .catch((error) => {
        console.error("EmailJS error:", error);
        Swal.fire({
          title: "Oops...",
          text: "Something went wrong. Try WhatsApp booking instead.",
          icon: "error",
          confirmButtonColor: "#dc3545",
        });
      })
      .finally(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = "Confirm & Send Booking";
      });
  });

  // Scroll animations
  const sections = document.querySelectorAll('section');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  sections.forEach(section => observer.observe(section));
});