// Sıfırdan sade login/register ve navbar güncelleme fonksiyonu
const API_BASE = "http://localhost:3001";

document.addEventListener("DOMContentLoaded", function () {
  updateNavbarUser();

  // Login/Register toggle
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");
  const loginSection = document.getElementById("login-section");
  const registerSection = document.getElementById("register-section");
  if (showRegister && showLogin && loginSection && registerSection) {
    showRegister.onclick = function (e) {
      e.preventDefault();
      loginSection.style.display = "none";
      registerSection.classList.remove("d-none");
      registerSection.style.display = "block";
    };
    showLogin.onclick = function (e) {
      e.preventDefault();
      registerSection.style.display = "none";
      loginSection.style.display = "block";
    };
  }

  // Login
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.onsubmit = async function (e) {
      e.preventDefault();
      const email = document.getElementById("loginEmail").value;
      const password = document.getElementById("loginPassword").value;
      try {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: email, password }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("username", data.fullname || data.username);
          window.location.href = "index.html";
        } else {
          alert(data.error || "Giriş başarısız!");
        }
      } catch (err) {
        alert("Sunucuya bağlanılamadı!");
      }
    };
  }

  // Register
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.onsubmit = async function (e) {
      e.preventDefault();
      const fullname = document.getElementById("registerName").value;
      const email = document.getElementById("registerEmail").value;
      const password = document.getElementById("registerPassword").value;
      try {
        const res = await fetch(`${API_BASE}/api/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username: email, password, fullname }),
        });
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("username", fullname);
          window.location.href = "index.html";
        } else {
          alert(data.error || "Kayıt başarısız!");
        }
      } catch (err) {
        alert("Sunucuya bağlanılamadı!");
      }
    };
  }

  // Çıkış
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("username");
      updateNavbarUser();
      window.location.href = "login_register.html";
    });
  }
});

function updateNavbarUser() {
  const username = localStorage.getItem("username");
  const navbarUser = document.getElementById("navbar-user");
  const logoutLink = document.getElementById("logout-link");
  const loginLink = document.getElementById("login-link");

  // Temizle
  navbarUser.innerHTML = "";
  if (document.getElementById("navbar-user-dropdown")) {
    document.getElementById("navbar-user-dropdown").remove();
  }

  if (username) {
    // Avatar ve isimli buton
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=FFB347&color=fff&size=36&rounded=true&bold=true`;
    const avatar = document.createElement("img");
    avatar.src = avatarUrl;
    avatar.alt = "avatar";
    avatar.style.width = "36px";
    avatar.style.height = "36px";
    avatar.style.borderRadius = "50%";
    avatar.style.marginRight = "10px";
    avatar.style.verticalAlign = "middle";
    avatar.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)";
    avatar.style.border = "2px solid #fff3cd";
    const nameSpan = document.createElement("span");
    nameSpan.textContent = username;
    nameSpan.style.fontWeight = "600";
    nameSpan.style.verticalAlign = "middle";
    nameSpan.style.cursor = "pointer";
    nameSpan.style.fontSize = "1.08rem";
    nameSpan.style.letterSpacing = "0.5px";
    navbarUser.appendChild(avatar);
    navbarUser.appendChild(nameSpan);
    navbarUser.style.position = "relative";
    navbarUser.style.display = "flex";
    navbarUser.style.alignItems = "center";
    navbarUser.style.gap = "10px";
    navbarUser.style.cursor = "pointer";
    navbarUser.style.padding = "4px 12px";
    navbarUser.style.borderRadius = "24px";
    navbarUser.style.transition = "background 0.2s";
    navbarUser.onmouseenter = function() {
      navbarUser.style.background = "#fff3cd";
    };
    navbarUser.onmouseleave = function() {
      navbarUser.style.background = "";
    };
    // Dropdown menü
    let dropdown = document.createElement("div");
    dropdown.id = "navbar-user-dropdown";
    dropdown.style.position = "absolute";
    dropdown.style.top = "calc(100% + 10px)";
    dropdown.style.right = "0";
    dropdown.style.background = "#fff";
    dropdown.style.border = "1px solid #ffe5b4";
    dropdown.style.borderRadius = "14px";
    dropdown.style.boxShadow = "0 8px 32px rgba(255,179,71,0.18), 0 2px 8px rgba(0,0,0,0.08)";
    dropdown.style.padding = "0.7rem 1.5rem 0.7rem 1.5rem";
    dropdown.style.minWidth = "150px";
    dropdown.style.display = "none";
    dropdown.style.zIndex = "9999";
    dropdown.style.animation = "fadeInDown 0.25s";
    dropdown.innerHTML = `<button id="navbar-logout-btn" style="width:100%;border:none;background:none;padding:10px 0;color:#dc3545;font-weight:600;font-size:1.08rem;cursor:pointer;outline:none;border-radius:8px;transition:background 0.15s;">Çıkış Yap</button>`;
    navbarUser.appendChild(dropdown);
    // Açılır menü toggle
    navbarUser.onclick = function (e) {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    };
    // Dışarı tıklayınca kapat
    document.addEventListener("click", function closeDropdown(e) {
      if (dropdown.style.display === "block") {
        dropdown.style.display = "none";
      }
    }, { once: true });
    dropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    // Çıkış butonu hover efekti
    const logoutBtn = dropdown.querySelector("#navbar-logout-btn");
    logoutBtn.onmouseenter = function() {
      logoutBtn.style.background = "#ffe5b4";
    };
    logoutBtn.onmouseleave = function() {
      logoutBtn.style.background = "";
    };
    logoutBtn.onclick = function () {
      localStorage.removeItem("username");
      updateNavbarUser();
      window.location.href = "login_register.html";
    };
    logoutLink.style.display = "none";
    loginLink.style.display = "none";
  } else {
    navbarUser.textContent = "";
    navbarUser.style.cursor = "default";
    if (document.getElementById("navbar-user-dropdown")) {
      document.getElementById("navbar-user-dropdown").style.display = "none";
    }
    logoutLink.style.display = "none";
    loginLink.style.display = "inline";
  }
}
// Animasyon ekle
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeInDown {from {opacity:0;transform:translateY(-10px);} to {opacity:1;transform:translateY(0);}}`;
document.head.appendChild(style);
