// js/data.js

const initialData = {
  users: [
    { username: 'admin', password: 'password123', role: 'admin', name: 'System Administrator', status: 'approved' }
  ],
  notices: [],
  resources: [],
  timetables: [],
  faculty: [],
  gallery: []
};

function initStorage() {
  if (!localStorage.getItem('cs_dept_v3_init')) {
    localStorage.setItem('cs_dept_users', JSON.stringify(initialData.users));
    localStorage.setItem('cs_dept_notices', JSON.stringify(initialData.notices));
    localStorage.setItem('cs_dept_resources', JSON.stringify(initialData.resources));
    localStorage.setItem('cs_dept_timetables', JSON.stringify(initialData.timetables));
    localStorage.setItem('cs_dept_faculty', JSON.stringify(initialData.faculty));
    localStorage.setItem('cs_dept_gallery', JSON.stringify(initialData.gallery));
    
    // Clear legacy version keys
    localStorage.removeItem('cs_dept_v2_init');
    localStorage.removeItem('cs_dept_init');
    
    localStorage.setItem('cs_dept_v3_init', 'true'); // version bump to force reset
  }
}

// Call on load
initStorage();

// Data access helpers (Simulated DB Collections)
const DB = {
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
  
  getUsers: () => DB.get('cs_dept_users'),
  setUsers: (d) => DB.set('cs_dept_users', d),
  
  getNotices: () => DB.get('cs_dept_notices'),
  setNotices: (d) => DB.set('cs_dept_notices', d),
  
  getResources: () => DB.get('cs_dept_resources'),
  setResources: (d) => DB.set('cs_dept_resources', d),
  
  getTimetables: () => DB.get('cs_dept_timetables'),
  setTimetables: (d) => DB.set('cs_dept_timetables', d),
  
  getFaculty: () => DB.get('cs_dept_faculty'),
  setFaculty: (d) => DB.set('cs_dept_faculty', d),
  
  getGallery: () => DB.get('cs_dept_gallery'),
  setGallery: (d) => DB.set('cs_dept_gallery', d)
};
