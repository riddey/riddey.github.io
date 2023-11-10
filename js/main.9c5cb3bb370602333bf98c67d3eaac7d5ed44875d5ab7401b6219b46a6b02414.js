(() => {
  // ns-params:@params
  var api = "https://app.riddey.com";

  // <stdin>
  var hamburger = document.querySelector(".hamburger");
  var navMenu = document.querySelector(".nav-menu");
  var quotations = document.querySelector(".quotations .content");
  var quotationsNav = document.querySelector(".quotations nav");
  var subscribeForm = document.querySelector("#subscribe-form");
  var contactForm = document.querySelector("#contact-form");
  hamburger.onclick = toggleNavMenu;
  window.onresize = onWindowResize;
  initQuotations();
  checkIfWindows();
  initSubscribeForm();
  initContactForm();
  function toggleNavMenu() {
    if (isNavMenuOpen())
      closeNavMenu();
    else
      openNavMenu();
  }
  function checkNavMenu() {
    if (window.innerWidth >= 1024 && isNavMenuOpen())
      closeNavMenu();
  }
  function onWindowResize() {
    checkNavMenu();
    if (quotations !== null)
      checkQuotations();
  }
  var isNavMenuOpen = () => navMenu.classList.contains("open");
  function openNavMenu() {
    hamburger.classList.add("close");
    navMenu.classList.add("open");
  }
  function closeNavMenu() {
    hamburger.classList.remove("close");
    navMenu.classList.remove("open");
  }
  function initQuotations() {
    if (quotations === null)
      return;
    checkQuotations();
    quotations.onscroll = checkQuotations;
    for (let i = 0; i < 3; i++) {
      quotationsNav.children[i].onclick = () => {
        const left = quotMaxScrollLeft() * i / 2;
        quotations.scrollTo({ top: 0, left, behavior: "smooth" });
      };
    }
  }
  function checkQuotations() {
    const maxScrollLeft = quotMaxScrollLeft();
    const progress = quotations.scrollLeft / maxScrollLeft;
    const activeIdx = Math.floor(0.5 + 2 * progress);
    for (let i = 0; i < 3; i++) {
      if (activeIdx === i) {
        quotationsNav.children[i].classList.add("active");
      } else
        quotationsNav.children[i].classList.remove("active");
    }
  }
  var toastTimeout;
  function showToast(state, title, message) {
    var toast = document.getElementById("toast");
    var toastTitle = document.querySelector("#toast .title");
    var toastBody = document.getElementById("toast-body");
    clearTimeout(toastTimeout);
    toastTitle.textContent = title;
    toastBody.textContent = message;
    toast.className = "toast";
    toast.classList.add(state);
    toast.classList.add("show");
    toastTimeout = setTimeout(function() {
      toast.classList.remove("show");
    }, 5e3);
  }
  function closeToast() {
    var toast = document.getElementById("toast");
    clearTimeout(toastTimeout);
    toast.classList.remove("show");
  }
  document.querySelector(".toast .close").onclick = closeToast;
  function initSubscribeForm() {
    if (subscribeForm === null)
      return;
    window.onHCaptchaVerify = onHCaptchaVerify;
    subscribeForm.onsubmit = onInitSubscribeFormSubmit;
  }
  function onInitSubscribeFormSubmit(event) {
    event.preventDefault();
    hcaptcha.execute();
  }
  async function onHCaptchaVerify(token) {
    subscribeForm.classList.add(await submitNewsletterForm(token));
  }
  async function submitNewsletterForm(captchaToken) {
    const emailInput = document.getElementById("subscribe-email");
    const email = emailInput.value;
    try {
      const response = await fetch(`${api}/mail/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captcha: captchaToken, source: "website" })
      });
      emailInput.value = "";
      return response.status === 200 ? showToast(
        "success",
        "Success!",
        "You have been subscribed to our newsletter."
      ) : showToast("error", "Error!", "Something went wrong. ");
    } catch (error) {
      emailInput.value = "";
      return showToast("error", "Error!", "Something went wrong. ");
    }
  }
  function validateEmailInput(input) {
    const errorSpan = document.getElementById("email-error-message");
    if (input.value === "") {
      input.classList.remove("invalid");
      errorSpan.textContent = "";
      errorSpan.style.visibility = "hidden";
      return true;
    }
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.value)) {
      input.classList.add("invalid");
      errorSpan.textContent = "Please enter a valid email address.";
      errorSpan.style.visibility = "visible";
      return false;
    } else {
      input.classList.remove("invalid");
      errorSpan.textContent = "";
      errorSpan.style.visibility = "hidden";
      return true;
    }
  }
  function checkAllFieldsFilled() {
    const inputs = contactForm.querySelectorAll(".form-control[required]");
    let allFilled = true;
    inputs.forEach((input) => {
      if (input.type === "checkbox") {
        if (!input.checked) {
          allFilled = false;
        }
      } else if (input.type !== "submit" && input.value === "") {
        allFilled = false;
      }
    });
    return allFilled;
  }
  async function onContactHCaptchaVerify(token) {
    contactForm.classList.add(await sendContactMessage(token));
  }
  function initContactForm() {
    if (contactForm === null)
      return;
    window.onHCaptchaVerify = onContactHCaptchaVerify;
    contactForm.onsubmit = onContactFormSubmit;
    const sendButton = contactForm.querySelector(".send-btn");
    contactForm.querySelectorAll(".form-control").forEach((input) => {
      input.addEventListener("input", () => {
        if (checkAllFieldsFilled() && validateEmailInput(emailInput)) {
          sendButton.classList.remove("disabled-btn");
        } else {
          sendButton.classList.add("disabled-btn");
        }
      });
    });
    const emailInput = contactForm.querySelector("#contact-form-email-input");
    emailInput.addEventListener("input", () => {
      if (validateEmailInput(emailInput) && checkAllFieldsFilled()) {
        sendButton.classList.remove("disabled-btn");
      } else {
        sendButton.classList.add("disabled-btn");
      }
    });
  }
  function onContactFormSubmit(event) {
    event.preventDefault();
    const sendButton = contactForm.querySelector(".send-btn");
    const emailInput = document.getElementById("contact-form-email-input");
    if (validateEmailInput(emailInput) && checkAllFieldsFilled()) {
      sendButton.classList.remove("disabled-btn");
      hcaptcha.execute();
    } else {
      sendButton.classList.add("disabled-btn");
    }
  }
  async function sendContactMessage(captcha) {
    const emailInput = document.getElementById("contact-form-email-input");
    const nameInput = document.getElementById("contact-form-name-input");
    const messageInput = document.getElementById("contact-form-message");
    const email = emailInput.value;
    const name = nameInput.value;
    const message = messageInput.value;
    try {
      const response = await fetch(`${api}/mail/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, captcha, name, message })
      });
      showToast();
      emailInput.value = "";
      nameInput.value = "";
      messageInput.value = "";
      return response.status === 200 ? showToast("success", "Success!", "Thank you! We received your message.") : showToast("error", "Error!", "Something went wrong. ");
    } catch (e) {
      showToast();
      emailInput.value = "";
      nameInput.value = "";
      messageInput.value = "";
      return showToast("error", "Error!", "Something went wrong. ");
    }
  }
  function checkIfWindows() {
    if (navigator.platform === "Win32")
      document.body.classList.add("windows");
  }
  document.addEventListener("DOMContentLoaded", function() {
    let panelTitles = document.querySelectorAll(".panel-title");
    panelTitles.forEach((title) => {
      title.addEventListener("click", function() {
        toggleAccordionPanel(this.parentElement);
      });
    });
  });
  function toggleAccordionPanel(panel) {
    if (panel.classList.contains("panel-open")) {
      closeAccordionPanel(panel);
    } else {
      openAccordionPanel(panel);
    }
  }
  function openAccordionPanel(panel) {
    panel.classList.add("panel-open");
    var content = panel.querySelector(".panel-content");
    content.style.maxHeight = content.scrollHeight + "px";
  }
  function closeAccordionPanel(panel) {
    var content = panel.querySelector(".panel-content");
    content.style.maxHeight = null;
    panel.classList.remove("panel-open");
  }
  var cards = document.querySelectorAll(".card");
  var dots = document.querySelectorAll(".dot");
  var currentCardIndex = 0;
  var touchStartX = 0;
  var touchEndX = 0;
  function showCard(index) {
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
  }
  function updateDots() {
    dots.forEach((dot, index) => {
      if (index === currentCardIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  }
  function nextCard() {
    currentCardIndex++;
    if (currentCardIndex >= cards.length) {
      currentCardIndex = 0;
    }
    showCard(currentCardIndex);
    updateDots();
  }
  function prevCard() {
    currentCardIndex--;
    if (currentCardIndex < 0) {
      currentCardIndex = cards.length - 1;
    }
    showCard(currentCardIndex);
    updateDots();
  }
  function handleSwipeStart(event) {
    touchStartX = event.touches[0].clientX;
  }
  function handleSwipeEnd(event) {
    touchEndX = event.changedTouches[0].clientX;
    if (touchStartX - touchEndX > 50) {
      nextCard();
    } else if (touchEndX - touchStartX > 50) {
      prevCard();
    }
  }
  showCard(currentCardIndex);
  updateDots();
  cards[currentCardIndex]?.classList.add("active");
  document.addEventListener("touchstart", handleSwipeStart);
  document.addEventListener("touchend", handleSwipeEnd);
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      currentCardIndex = index;
      showCard(currentCardIndex);
      updateDots();
    });
  });
  document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".time span");
    const amounts = document.querySelectorAll(".amount");
    function updatePrices(selectedTab) {
      amounts.forEach((amount) => {
        const billingYearly = amount.nextElementSibling;
        const lifetimeMessage = amount.parentElement.querySelector(".lifetime-message");
        amount.classList.remove("active");
        if (billingYearly) {
          billingYearly.classList.remove("active");
        }
        if (lifetimeMessage) {
          lifetimeMessage.classList.remove("active");
        }
        setTimeout(() => {
          amount.textContent = amount.dataset[selectedTab];
          if (billingYearly && selectedTab === "year") {
            billingYearly.textContent = billingYearly.dataset[selectedTab];
            billingYearly.classList.add("active");
            billingYearly.style.display = "block";
          } else if (billingYearly) {
            billingYearly.style.display = "none";
          }
          if (lifetimeMessage && selectedTab === "lifetime") {
            lifetimeMessage.textContent = "Pay once. Enjoy forever!";
            lifetimeMessage.classList.add("active");
            lifetimeMessage.style.display = "block";
          } else if (lifetimeMessage) {
            lifetimeMessage.style.display = "none";
          }
          requestAnimationFrame(() => {
            amount.classList.add("active");
          });
        }, 500);
      });
    }
    tabs.forEach((tab) => {
      tab.addEventListener("click", function() {
        tabs.forEach((tab2) => tab2.classList.remove("active"));
        this.classList.add("active");
        updatePrices(this.id.split("-")[1]);
      });
    });
    document.getElementById("tab-month")?.click();
  });
})();
