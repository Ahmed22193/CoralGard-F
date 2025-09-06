document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("floating-elements");
  for (let i = 0; i < 12; i++) {
    const coral = document.createElement("div");
    coral.className = "coral-element";
    const size = Math.random() * 40 + 20;
    const delay = Math.random() * 5;
    const duration = Math.random() * 15 + 15;
    const left = Math.random() * 100;
    const top = Math.random() * 80;
    coral.style.width = coral.style.height = size + "px";
    coral.style.left = left + "%";
    coral.style.top = top + "%";
    coral.style.animation = `float ${duration}s ease-in-out ${delay}s infinite`;
    container.appendChild(coral);
  }
  const loginTab = document.getElementById("login-tab");
  const signupTab = document.getElementById("signup-tab");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const alertBox = document.getElementById("alertBox");
  function showAlert(message, type) {
    alertBox.textContent = message;
    alertBox.className = `alert alert-${type}`;
    alertBox.style.display = "block";
    setTimeout(() => {
      alertBox.style.display = "none";
    }, 5000);
  }
  loginTab.addEventListener("click", () => {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
    loginTab.classList.add("bg-[var(--primary-color)]");
    signupTab.classList.remove("bg-[var(--primary-color)]");
    signupTab.classList.add("bg-white/10");
    alertBox.style.display = "none";
  });
  signupTab.addEventListener("click", () => {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    signupTab.classList.add("bg-[var(--primary-color)]");
    loginTab.classList.remove("bg-[var(--primary-color)]");
    loginTab.classList.add("bg-white/10");
    alertBox.style.display = "none";
  });
  function createStars(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    for (let i = 0; i < 5; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = x + "px";
      star.style.top = y + "px";
      const angle = (i / 5) * 2 * Math.PI;
      const distance = 50 + Math.random() * 20;
      star.style.transition = "transform 1s ease-out, opacity 1s ease-out";
      document.body.appendChild(star);
      setTimeout(() => {
        star.style.transform = `translate(${Math.cos(angle) * distance}px, ${
          Math.sin(angle) * distance
        }px)`;
        star.style.opacity = "1";
      }, 50);
      setTimeout(() => {
        star.remove();
      }, 1200);
    }
  }
  document
    .getElementById("login-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();
      const loginButton = document.getElementById("login-button");
      if (!email || !password) {
        if (!email)
          document.getElementById("login-email").classList.add("shake");
        if (!password)
          document.getElementById("login-password").classList.add("shake");
        setTimeout(() => {
          document.getElementById("login-email").classList.remove("shake");
          document.getElementById("login-password").classList.remove("shake");
        }, 500);
        return;
      }
      loginButton.innerHTML = "Logging in...";
      loginButton.disabled = true;
      try {
        const res = await fetch(
          "https://coral-guard-v2.vercel.app/api/auth/login",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          }
        );
        const data = await res.json();
        console.log("API Response:", data);
        if (res.ok) {
          let token;
          if (data.token) {
            token = data.token;
          } else if (data.data && data.data.token) {
            token = data.data.token;
          } else if (data.data) {
            token = data.data;
          }
          if (token) {
            localStorage.setItem("token", token);
            console.log("Token saved to localStorage:", token);
            loginButton.innerHTML = "Success!";
            createStars(loginButton);
            showAlert("Login successful! Redirecting...", "success");
            setTimeout(() => {
              window.location.href = "/#home";
            }, 1000);
          } else {
            showAlert(
              "No token received from server. Please try again.",
              "error"
            );
            loginButton.innerHTML = "Log In";
            loginButton.disabled = false;
          }
        } else {
          showAlert(
            data.message || "Login failed. Please check your credentials.",
            "error"
          );
          loginButton.innerHTML = "Log In";
          loginButton.disabled = false;
        }
      } catch (err) {
        console.error("Login error:", err);
        showAlert(
          "Error connecting to server. Please try again later.",
          "error"
        );
        loginButton.innerHTML = "Log In";
        loginButton.disabled = false;
      }
    });
  document
    .getElementById("signup-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();
      const name = document.getElementById("signup-name").value.trim();
      const email = document.getElementById("signup-email").value.trim();
      const password = document.getElementById("signup-password").value.trim();
      const signupButton = document.getElementById("signup-button");
      if (!name || !email || !password) {
        if (!name)
          document.getElementById("signup-name").classList.add("shake");
        if (!email)
          document.getElementById("signup-email").classList.add("shake");
        if (!password)
          document.getElementById("signup-password").classList.add("shake");
        setTimeout(() => {
          document.getElementById("signup-name").classList.remove("shake");
          document.getElementById("signup-email").classList.remove("shake");
          document.getElementById("signup-password").classList.remove("shake");
        }, 500);
        return;
      }
      signupButton.innerHTML = "Signing up...";
      signupButton.disabled = true;
      try {
        const res = await fetch(
          "https://coral-guard-v2.vercel.app/api/auth/signUp",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name, email, password }),
          }
        );
        const data = await res.json();
        console.log("SignUp API Response:", data);
        if (res.ok) {
          showAlert(
            data.message || "User created successfully! Please login.",
            "success"
          );
          createStars(signupButton);
          setTimeout(() => {
            loginTab.click();
            signupButton.innerHTML = "Sign Up";
            signupButton.disabled = false;
          }, 2000);
        } else {
          showAlert(
            data.message || "Signup failed. Please try again.",
            "error"
          );
          signupButton.innerHTML = "Sign Up";
          signupButton.disabled = false;
        }
      } catch (err) {
        console.error("SignUp error:", err);
        showAlert(
          "Error connecting to server. Please try again later.",
          "error"
        );
        signupButton.innerHTML = "Sign Up";
        signupButton.disabled = false;
      }
    });
});
