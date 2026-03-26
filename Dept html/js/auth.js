// js/auth.js

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');

  // Login Handler
  if (loginForm) {
    const loginMsg = document.getElementById('loginMessage');
    
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('username').value.trim();
      const passwordInput = document.getElementById('password').value.trim();

      const users = DB.getUsers();
      const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

      if (user) {
        if (user.status === 'pending') {
          showMsg(loginMsg, 'error-msg', 'Your account is pending Admin approval. Please try again later.');
          return;
        }
        
        if (user.status === 'rejected') {
           showMsg(loginMsg, 'error-msg', 'Your registration was rejected. Contact the department.');
           return;
        }

        // Remove password from local session clone
        const { password, ...sessionUser } = user;
        localStorage.setItem('cs_dept_currentUser', JSON.stringify(sessionUser));
        
        // Redirect Admin/Teacher to admin dashboard, Students to student portal
        if (user.role === 'admin' || user.role === 'teacher') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'students.html';
        }
      } else {
        showMsg(loginMsg, 'error-msg', 'Invalid username or password.');
      }
    });
  }
  
  // Signup Handler
  if (signupForm) {
    const authMsg = document.getElementById('authMessage');
    
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('regName').value.trim();
      const course = document.getElementById('regCourse').value;
      const year = document.getElementById('regYear').value;
      const username = document.getElementById('regUsername').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      
      if(course === 'PG' && year === '3') {
        showMsg(authMsg, 'error-msg', 'PG only has 2 years.');
        return;
      }
      
      const users = DB.getUsers();
      
      // Check if username exists
      if(users.some(u => u.username === username)) {
         showMsg(authMsg, 'error-msg', 'Username already exists. Please pick another.');
         return;
      }
      
      // Push new user
      const newUser = {
        username,
        password,
        role: 'student',
        name,
        status: 'pending',
        course,
        year
      };
      
      users.push(newUser);
      DB.setUsers(users);
      
      signupForm.reset();
      showMsg(authMsg, 'success-msg', 'Registration successful! Please wait for Admin approval before logging in.');
    });
  }
  
  function showMsg(el, className, text) {
    el.className = className;
    el.textContent = text;
    el.classList.remove('hidden');
  }
});
