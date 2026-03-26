// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = JSON.parse(localStorage.getItem('cs_dept_currentUser'));
  
  if (!currentUser || !['teacher', 'admin', 'head_teacher'].includes(currentUser.role)) {
    window.location.href = 'login.html';
    return;
  }
  
  document.getElementById('adminName').textContent = currentUser.name;
  
  // Set Role specific UI
  document.body.setAttribute('data-role', currentUser.role);
  
  if (currentUser.role === 'teacher') {
    document.getElementById('roleBadge').textContent = 'TEACHER';
    document.getElementById('roleBadge').className = 'badge badge-teacher';
    // Remove admin items completely from DOM so they cant be bypassed via CSS
    document.querySelectorAll('.admin-only-item-nav').forEach(e => e.remove());
  } else if (currentUser.role === 'head_teacher') {
    document.getElementById('roleBadge').textContent = 'HOD';
    document.getElementById('roleBadge').className = 'badge badge-admin';
    document.querySelectorAll('.admin-only-item-nav').forEach(e => {
       if(!e.classList.contains('head-teacher-nav')) e.remove();
    });
  } else {
    document.getElementById('roleBadge').textContent = 'ADMIN';
    document.getElementById('roleBadge').className = 'badge badge-admin';
  }
  
  initDashboard(currentUser.role);
});

function initDashboard(role) {
  renderNotices();
  renderResources();
  
  if(role === 'admin' || role === 'head_teacher') {
    renderStaff();
    setupFormSubmit('staffForm', 'staff_', saveStaff);
  }
  
  if(role === 'admin') {
    renderTimetables();
    renderApprovals();
    renderFaculty();
    renderGallery();
    
    setupFormSubmit('timetableForm', 't_', saveTimetable);
    setupFormSubmit('facultyForm', 'f_', saveFaculty);
    setupFormSubmit('galleryForm', 'g_', saveGallery);
  }
}

// ------------------------ HELPERS ------------------------
window.logout = function() {
  localStorage.removeItem('cs_dept_currentUser');
  window.location.href = 'login.html';
};

window.showSection = function(sectionId, linkEl) {
  if (window.event) window.event.preventDefault();
  document.querySelectorAll('.admin-section').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.admin-nav a').forEach(el => el.classList.remove('active'));
  
  const targetSection = document.getElementById(sectionId);
  if (targetSection) targetSection.classList.remove('hidden');
  
  if (linkEl) {
    linkEl.classList.add('active');
    const sectionName = linkEl.textContent.trim();
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = sectionName;
  }
};

window.toggleForm = function(containerId, editTitle = 'Add Items') {
  const container = document.getElementById(containerId);
  const form = container.querySelector('form');
  const titleEl = container.querySelector('h3');
  
  if (container.classList.contains('hidden')) {
    form.reset();
    form.querySelector('[type="hidden"]').value = '';
    if(titleEl) titleEl.textContent = editTitle;
    container.classList.remove('hidden');
  } else {
    container.classList.add('hidden');
  }
};

function setupFormSubmit(formId, prefix, saveCallback) {
  const form = document.getElementById(formId);
  if(!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveCallback(prefix);
  });
}

// Generates generic table HTML
function genActionsHtml(id, type) {
  return `
    <td class="actions">
      <button class="edit" onclick="editItem(${id}, '${type}')"><i class="fas fa-edit"></i></button>
      <button class="delete" onclick="deleteItem(${id}, '${type}')"><i class="fas fa-trash"></i></button>
    </td>
  `;
}

// ------------------------ NOTICES ------------------------
function renderNotices() {
  const notices = DB.getNotices().sort((a,b) => new Date(b.date) - new Date(a.date));
  const tbody = document.getElementById('noticesTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  
  if(notices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No notices found.</td></tr>';
    return;
  }
  
  notices.forEach(n => {
    tbody.innerHTML += `<tr><td>${n.date}</td><td><strong>${n.title}</strong></td><td><span class="badge" style="background:#e3d5ca; color:#3a322c;">${n.audience}</span></td>${genActionsHtml(n.id, 'notice')}</tr>`;
  });
}

function saveNotice(p) {
  let arr = DB.getNotices();
  const id = document.getElementById(p+'id').value;
  const newData = {
    id: id ? parseInt(id) : Date.now(),
    title: document.getElementById(p+'title').value,
    date: document.getElementById(p+'date').value,
    audience: document.getElementById(p+'audience').value,
    content: document.getElementById(p+'content').value
  };
  
  if(id) { const idx = arr.findIndex(i => i.id == id); if(idx>-1) arr[idx] = newData; } else { arr.push(newData); }
  DB.setNotices(arr);
  toggleForm('noticeFormContainer');
  renderNotices();
}

// ------------------------ RESOURCES ------------------------
function renderResources() {
  const res = DB.getResources();
  const tbody = document.getElementById('resourcesTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  if(res.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No resources uploaded.</td></tr>'; return; }
  
  res.forEach(r => {
    tbody.innerHTML += `<tr><td><a href="${r.link}" target="_blank" style="color:var(--secondary); text-decoration:underline;">${r.title}</a></td><td>${r.type}</td><td>${r.audience}</td><td>${r.uploader}</td>${genActionsHtml(r.id, 'resource')}</tr>`;
  });
}

function saveResource(p) {
  const activeUser = JSON.parse(localStorage.getItem('cs_dept_currentUser'));
  let arr = DB.getResources();
  const id = document.getElementById(p+'id').value;
  const newData = {
    id: id ? parseInt(id) : Date.now(),
    title: document.getElementById(p+'title').value,
    type: document.getElementById(p+'type').value,
    link: document.getElementById(p+'link').value,
    audience: document.getElementById(p+'audience').value,
    uploader: activeUser.role === 'admin' ? 'Admin' : activeUser.name
  };
  
  if(id) { const idx = arr.findIndex(i => i.id == id); if(idx>-1) arr[idx] = newData; } else { arr.push(newData); }
  DB.setResources(arr);
  toggleForm('resourceFormContainer');
  renderResources();
}

// ------------------------ TIMETABLES ------------------------
function renderTimetables() {
  const ts = DB.getTimetables();
  const tbody = document.getElementById('timetablesTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  if(ts.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No timetables.</td></tr>'; return; }
  ts.forEach(t => {
    tbody.innerHTML += `<tr><td>${t.title}</td><td>${t.audience}</td><td><a href="${t.link}" target="_blank">View Image</a></td>${genActionsHtml(t.id, 'timetable')}</tr>`;
  });
}

function saveTimetable(p) {
  let arr = DB.getTimetables();
  const id = document.getElementById(p+'id').value;
  const newData = {
    id: id ? parseInt(id) : Date.now(),
    title: document.getElementById(p+'title').value,
    link: document.getElementById(p+'link').value,
    audience: document.getElementById(p+'audience').value
  };
  if(id) { const idx = arr.findIndex(i => i.id == id); if(idx>-1) arr[idx] = newData; } else { arr.push(newData); }
  DB.setTimetables(arr);
  toggleForm('timetableFormContainer');
  renderTimetables();
}

// ------------------------ APPROVALS ------------------------
function renderApprovals() {
  const users = DB.getUsers().filter(u => u.role === 'student' && u.status === 'pending');
  const tbody = document.getElementById('approvalsTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  if(users.length === 0) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No pending approvals. All caught up!</td></tr>'; return; }
  
  users.forEach(u => {
    tbody.innerHTML += `<tr>
      <td>${u.name}</td><td>${u.username}</td><td>${u.course} Year ${u.year}</td>
      <td><span class="badge badge-pending">Pending</span></td>
      <td class="actions">
        <button class="approve" onclick="resolveUser('${u.username}', 'approved')" title="Approve"><i class="fas fa-check-circle"></i></button>
        <button class="delete" onclick="resolveUser('${u.username}', 'rejected')" title="Reject"><i class="fas fa-times-circle"></i></button>
      </td>
    </tr>`;
  });
}

window.resolveUser = function(username, status) {
  if(!confirm(`Are you sure you want to mark ${username} as ${status}?`)) return;
  let users = DB.getUsers();
  const index = users.findIndex(u => u.username === username);
  if(index > -1) {
    if(status === 'rejected') {
      users.splice(index, 1); // Delete rejected entirely to save space or mark as rejected
    } else {
      users[index].status = status;
    }
    DB.setUsers(users);
    renderApprovals();
  }
}

// ------------------------ FACULTY ------------------------
function renderFaculty() {
  const fs = DB.getFaculty();
  const tbody = document.getElementById('facultyTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  if(fs.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No faculty added.</td></tr>'; return; }
  fs.forEach(f => {
    tbody.innerHTML += `<tr><td>${f.name}</td><td>${f.designation}</td><td>${f.specialization}</td>${genActionsHtml(f.id, 'faculty')}</tr>`;
  });
}

function saveFaculty(p) {
  let arr = DB.getFaculty();
  const id = document.getElementById(p+'id').value;
  const newData = {
    id: id ? parseInt(id) : Date.now(),
    name: document.getElementById(p+'name').value,
    designation: document.getElementById(p+'desig').value,
    specialization: document.getElementById(p+'spec').value,
    image: document.getElementById(p+'img').value
  };
  if(id) { const idx = arr.findIndex(i => i.id == id); if(idx>-1) arr[idx] = newData; } else { arr.push(newData); }
  DB.setFaculty(arr);
  toggleForm('facultyFormContainer');
  renderFaculty();
}

// ------------------------ STAFF ACCOUNTS ------------------------
function renderStaff() {
  const users = DB.getUsers().filter(u => u.role === 'teacher' || u.role === 'head_teacher');
  const tbody = document.getElementById('staffTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  if(users.length === 0) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No staff accounts.</td></tr>'; return; }
  users.forEach(u => {
    tbody.innerHTML += `<tr><td>${u.name}</td><td>${u.username}</td><td><span class="badge ${u.role === 'head_teacher' ? 'badge-admin' : 'badge-teacher'}">${u.role}</span></td>
    <td class="actions">
      <button class="edit" onclick="editItem('${u.username}', 'staff')"><i class="fas fa-edit"></i></button>
      <button class="delete" onclick="deleteItem('${u.username}', 'staff')"><i class="fas fa-trash"></i></button>
    </td></tr>`;
  });
}

function saveStaff(p) {
  let arr = DB.getUsers();
  const og_username = document.getElementById(p+'og_username').value;
  const username = document.getElementById(p+'username').value.trim();
  
  // Check if changing to an existing username
  if (!og_username && arr.some(u => u.username === username)) {
      alert("Username already exists!");
      return;
  }
  
  const newData = {
    username: username,
    password: document.getElementById(p+'password').value,
    role: document.getElementById(p+'role').value,
    name: document.getElementById(p+'name').value,
    status: 'approved'
  };
  
  if(og_username) { 
    const idx = arr.findIndex(i => i.username === og_username); 
    if(idx > -1) arr[idx] = newData; 
  } else { 
    arr.push(newData); 
  }
  DB.setUsers(arr);
  toggleForm('staffFormContainer');
  renderStaff();
}

// ------------------------ GALLERY ------------------------
function renderGallery() {
  const gs = DB.getGallery();
  const tbody = document.getElementById('galleryTableBody');
  if(!tbody) return;
  tbody.innerHTML = '';
  if(gs.length === 0) { tbody.innerHTML = '<tr><td colspan="3" class="text-center">No images in gallery.</td></tr>'; return; }
  gs.forEach(g => {
    tbody.innerHTML += `<tr><td><img src="${g.url}" style="width:60px;height:40px;object-fit:cover;border-radius:4px;"></td><td>${g.title}</td>${genActionsHtml(g.id, 'gallery')}</tr>`;
  });
}

function saveGallery(p) {
  let arr = DB.getGallery();
  const id = document.getElementById(p+'id').value;
  const newData = {
    id: id ? parseInt(id) : Date.now(),
    title: document.getElementById(p+'title').value,
    url: document.getElementById(p+'url').value
  };
  if(id) { const idx = arr.findIndex(i => i.id == id); if(idx>-1) arr[idx] = newData; } else { arr.push(newData); }
  DB.setGallery(arr);
  toggleForm('galleryFormContainer');
  renderGallery();
}


// ------------------------ GLOBAL ACTIONS ------------------------
window.deleteItem = function(id, type) {
  if(!confirm(`Delete this ${type}?`)) return;
  
  if(type === 'notice') { DB.setNotices(DB.getNotices().filter(n => n.id !== id)); renderNotices(); }
  if(type === 'resource') { DB.setResources(DB.getResources().filter(n => n.id !== id)); renderResources(); }
  if(type === 'timetable') { DB.setTimetables(DB.getTimetables().filter(n => n.id !== id)); renderTimetables(); }
  if(type === 'faculty') { DB.setFaculty(DB.getFaculty().filter(n => n.id !== id)); renderFaculty(); }
  if(type === 'gallery') { DB.setGallery(DB.getGallery().filter(n => n.id !== id)); renderGallery(); }
  if(type === 'staff') { DB.setUsers(DB.getUsers().filter(n => n.username !== id)); renderStaff(); }
};

window.editItem = function(id, type) {
  let item = null;
  let p = '';
  let container = '';
  let titleNode = '';
  
  if(type === 'notice') { item = DB.getNotices().find(n => n.id === id); p = 'n_'; container = 'noticeFormContainer'; titleNode='Edit Notice';}
  if(type === 'resource') { item = DB.getResources().find(n => n.id === id); p = 'r_'; container = 'resourceFormContainer'; titleNode='Edit Resource';}
  if(type === 'timetable') { item = DB.getTimetables().find(n => n.id === id); p = 't_'; container = 'timetableFormContainer'; titleNode='Edit Timetable';}
  if(type === 'faculty') { item = DB.getFaculty().find(n => n.id === id); p = 'f_'; container = 'facultyFormContainer'; titleNode='Edit Faculty';}
  if(type === 'gallery') { item = DB.getGallery().find(n => n.id === id); p = 'g_'; container = 'galleryFormContainer'; titleNode='Edit Gallery';}
  if(type === 'staff') { item = DB.getUsers().find(n => n.username === id); p = 'staff_'; container = 'staffFormContainer'; titleNode='Edit Staff';}
  
  if(item) {
    if(type==='staff') {
        document.getElementById(p+'og_username').value = item.username;
        document.getElementById(p+'username').value = item.username;
        document.getElementById(p+'password').value = item.password;
        document.getElementById(p+'role').value = item.role;
        document.getElementById(p+'name').value=item.name;
    } else {
        document.getElementById(p+'id').value = item.id;
        if(type==='notice'){ document.getElementById(p+'title').value=item.title; document.getElementById(p+'date').value=item.date; document.getElementById(p+'content').value=item.content; document.getElementById(p+'audience').value=item.audience; }
        if(type==='resource'){ document.getElementById(p+'title').value=item.title; document.getElementById(p+'type').value=item.type; document.getElementById(p+'link').value=item.link; document.getElementById(p+'audience').value=item.audience; }
        if(type==='timetable'){ document.getElementById(p+'title').value=item.title; document.getElementById(p+'link').value=item.link; document.getElementById(p+'audience').value=item.audience; }
        if(type==='faculty'){ document.getElementById(p+'name').value=item.name; document.getElementById(p+'desig').value=item.designation; document.getElementById(p+'spec').value=item.specialization; document.getElementById(p+'img').value=item.image; }
        if(type==='gallery'){ document.getElementById(p+'title').value=item.title; document.getElementById(p+'url').value=item.url; }
    }
    
    document.getElementById(container).classList.remove('hidden');
    document.getElementById(container).querySelector('h3').textContent = titleNode;
  }
};
