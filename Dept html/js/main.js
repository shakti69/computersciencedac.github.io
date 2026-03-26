// js/main.js

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initScrollAnimations();
  updateAuthUI();
});

// Theme Management
function initTheme() {
  const themeToggle = document.getElementById('themeToggle');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('cs_dept_theme');
  
  const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  if (themeToggle) {
    themeToggle.innerHTML = currentTheme === 'dark' ? '<i class="fas fa-sun"></i> Theme' : '<i class="fas fa-moon"></i> Theme';
    
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isDark ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('cs_dept_theme', newTheme);
      themeToggle.innerHTML = newTheme === 'dark' ? '<i class="fas fa-sun"></i> Theme' : '<i class="fas fa-moon"></i> Theme';
    });
  }
}

// Mobile Menu
function initMobileMenu() {
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');
  
  if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }
}

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  const elements = document.querySelectorAll('.animate-on-scroll');
  elements.forEach(el => observer.observe(el));
}

function updateAuthUI() {
  const currentUser = JSON.parse(localStorage.getItem('cs_dept_currentUser'));
  const authContainerDesktop = document.getElementById('authContainerDesktop');
  const authContainerMobile = document.getElementById('authContainerMobile');
  
  const renderAuth = (container) => {
    if (!container) return;
    
    if (currentUser) {
      let roleBadgeClass = '';
      if(currentUser.role === 'admin') roleBadgeClass = 'badge-admin';
      else if(currentUser.role === 'teacher') roleBadgeClass = 'badge-teacher';
      else roleBadgeClass = 'badge-student';

      let roleBadge = `<span class="badge ${roleBadgeClass}">${currentUser.role.toUpperCase()}</span>`;
      
      let dashLink = '';
      if(currentUser.role === 'admin' || currentUser.role === 'teacher') {
         dashLink = '<a href="admin.html" class="btn btn-outline" style="padding:4px 12px; font-size:0.85rem;">Dashboard</a>';
      } else {
         // Students go to student portal
         dashLink = '<a href="students.html" class="btn btn-outline" style="padding:4px 12px; font-size:0.85rem;">My Portal</a>';
      }
      
      container.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
          <span style="font-weight:600; font-size:0.9rem; color:var(--text-main); display:flex; gap:0.5rem; align-items:center;">
             <i class="fas fa-user-circle"></i> ${currentUser.name} ${roleBadge}
          </span>
          ${dashLink}
          <button onclick="openChangePasswordModal()" class="btn btn-outline" style="padding:4px 12px; font-size:0.85rem;" title="Change Password"><i class="fas fa-key"></i></button>
          <button onclick="logout()" class="btn btn-primary" style="padding:4px 12px; font-size:0.85rem;">Logout</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div style="display:flex; gap:0.5rem;">
          <a href="login.html" class="btn btn-primary" style="padding:4px 12px; font-size:0.85rem;"><i class="fas fa-sign-in-alt"></i> Login</a>
          <a href="signup.html" class="btn btn-outline" style="padding:4px 12px; font-size:0.85rem;">Sign Up</a>
        </div>
      `;
    }
  };

  renderAuth(authContainerDesktop);
  renderAuth(authContainerMobile);
}

window.openChangePasswordModal = function() {
  let modal = document.getElementById('changePasswordModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'changePasswordModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; z-index:9999; justify-content:center; align-items:center;';
    modal.innerHTML = `
      <div style="background:var(--card-bg); padding:2rem; border-radius:8px; width:90%; max-width:400px; color:var(--text-main); box-shadow:0 10px 25px rgba(0,0,0,0.2);">
        <h3 style="margin-bottom:1rem; color:var(--primary);"><i class="fas fa-key"></i> Change Password</h3>
        <input type="password" id="cpOld" class="form-control" placeholder="Current Password" style="margin-bottom:1rem; width:100%; box-sizing:border-box;" />
        <input type="password" id="cpNew" class="form-control" placeholder="New Password" style="margin-bottom:1rem; width:100%; box-sizing:border-box;" />
        <input type="password" id="cpConfirm" class="form-control" placeholder="Confirm New Password" style="margin-bottom:1rem; width:100%; box-sizing:border-box;" />
        <div id="cpMsg" style="margin-bottom:1rem; font-size:0.9rem; font-weight:600;"></div>
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
           <button onclick="closeChangePasswordModal()" class="btn btn-outline">Cancel</button>
           <button onclick="submitChangePassword()" class="btn btn-primary">Update</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  document.getElementById('cpOld').value = '';
  document.getElementById('cpNew').value = '';
  document.getElementById('cpConfirm').value = '';
  document.getElementById('cpMsg').textContent = '';
};

window.closeChangePasswordModal = function() {
  const modal = document.getElementById('changePasswordModal');
  if (modal) modal.style.display = 'none';
};

window.submitChangePassword = function() {
  const oldP = document.getElementById('cpOld').value;
  const newP = document.getElementById('cpNew').value;
  const confP = document.getElementById('cpConfirm').value;
  const msg = document.getElementById('cpMsg');
  
  if (!oldP || !newP || !confP) {
    msg.textContent = 'All fields required.';
    msg.style.color = 'var(--error, #e63946)';
    return;
  }
  if (newP !== confP) {
    msg.textContent = 'New passwords do not match.';
    msg.style.color = 'var(--error, #e63946)';
    return;
  }
  
  const currentUser = JSON.parse(localStorage.getItem('cs_dept_currentUser'));
  if (!currentUser) return;
  
  const users = DB.getUsers();
  const userIdx = users.findIndex(u => u.username === currentUser.username);
  
  if (userIdx !== -1) {
    if (users[userIdx].password !== oldP) {
      msg.textContent = 'Incorrect current password.';
      msg.style.color = 'var(--error, #e63946)';
      return;
    }
    
    users[userIdx].password = newP;
    DB.setUsers(users);
    msg.textContent = 'Password updated successfully.';
    msg.style.color = 'var(--success, #2a9d8f)';
    setTimeout(closeChangePasswordModal, 1500);
  } else {
    msg.textContent = 'User not found.';
    msg.style.color = 'var(--error, #e63946)';
  }
};

window.logout = function() {
  localStorage.removeItem('cs_dept_currentUser');
  window.location.href = 'index.html';
};
