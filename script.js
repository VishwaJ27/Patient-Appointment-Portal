/* DOCTORS PER DEPARTMENT */
const DOCTORS = {
  'Cardiology':       ['Dr. Mathew Thomas', 'Dr. Patrick Sullivan'],
  'Dermatology':      ['Dr. Alan Cristy',   'Dr. Alfred Antony'],
  'General Medicine': ['Dr. Mathew Thomas', "Dr. D'Souza", 'Dr. Patrick Sullivan'],
  'Neurology':        ['Dr. Alfred Antony', "Dr. D'Souza"],
  'Orthopedics':      ['Dr. Patrick Sullivan', 'Dr. Alan Cristy'],
  'Pediatrics':       ["Dr. D'Souza",       'Dr. Alan Cristy'],
  'Gynecology':       ['Dr. Alfred Antony', 'Dr. Mathew Thomas'],
  'ENT':              ['Dr. Patrick Sullivan', "Dr. D'Souza"],
  'Ophthalmology':    ['Dr. Alan Cristy',   'Dr. Alfred Antony'],
  'Psychiatry':       ['Dr. Mathew Thomas', 'Dr. Patrick Sullivan'],
};

/* STATE */
let currentSection     = 1;
let selectedConditions = [];
const consentState     = { chk1: false, chk2: false, chk3: false };

/* INIT */
document.addEventListener('DOMContentLoaded', function () {

  /* ── Date limits ── */
  var today = new Date().toISOString().split('T')[0];
  document.getElementById('apptDate').min = today;
  document.getElementById('dob').max      = today;

  /* ── DOB → age calculator ── */
  document.getElementById('dob').addEventListener('change', calcAge);

  /* ── Department → doctor list ── */
  document.getElementById('department').addEventListener('change', updateDoctors);

  /* ── Navigation buttons ── */
  document.getElementById('next1').addEventListener('click', function () { goNext(1); });
  document.getElementById('next2').addEventListener('click', function () { goNext(2); });
  document.getElementById('next3').addEventListener('click', function () { goNext(3); });
  document.getElementById('prev2').addEventListener('click', function () { goPrev(2); });
  document.getElementById('prev3').addEventListener('click', function () { goPrev(3); });
  document.getElementById('prev4').addEventListener('click', function () { goPrev(4); });
  document.getElementById('submitBtn').addEventListener('click', submitForm);
  document.getElementById('resetBtn').addEventListener('click',  resetForm);

  /* ── Radio pill groups (DIV-based — no double-fire) ── */
  bindRadioGroup('genderGroup', 'genderVal',    'err-gender');
  bindRadioGroup('timeGroup',   'timeSlotVal',  'err-timeSlot');
  bindRadioGroup('emergGroup',  'emergencyVal', 'err-emergency');

  /* ── Blood group buttons ── */
  document.querySelectorAll('#bloodGroup .blood-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { selectBlood(btn); });
  });

  /* ── Severity buttons ── */
  document.querySelectorAll('#severityGroup .sev-btn').forEach(function (btn) {
    btn.addEventListener('click', function () { selectSeverity(btn); });
  });

  /* ── Medical conditions (multi-select) ── */
  document.querySelectorAll('#condGroup .cond-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      toggleCondition(opt, opt.getAttribute('data-value'));
    });
  });

  /* ── Consent check-rows (pure DIV state) ── */
  ['chk1', 'chk2', 'chk3'].forEach(function (key) {
    var row = document.getElementById('row-' + key);
    if (!row) return;
    row.addEventListener('click', function () {
      consentState[key] = !consentState[key];
      row.classList.toggle('checked', consentState[key]);
      if (consentState.chk1 && consentState.chk2) hideErr('err-consent');
    });
  });

});

/* RADIO GROUPS */
function bindRadioGroup(groupId, hiddenId, errId) {
  var group = document.getElementById(groupId);
  if (!group) return;
  group.querySelectorAll('.radio-opt').forEach(function (opt) {
    opt.addEventListener('click', function () {
      group.querySelectorAll('.radio-opt').forEach(function (o) { o.classList.remove('selected'); });
      opt.classList.add('selected');
      document.getElementById(hiddenId).value = opt.getAttribute('data-value');
      hideErr(errId);
    });
  });
}

/* BLOOD GROUP */
function selectBlood(btn) {
  document.querySelectorAll('#bloodGroup .blood-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('bloodGroupVal').value = btn.getAttribute('data-bg');
  hideErr('err-blood');
}

/* SEVERITY */
function selectSeverity(btn) {
  document.querySelectorAll('#severityGroup .sev-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.getElementById('severityVal').value = btn.getAttribute('data-val');
  hideErr('err-severity');
}

/* MEDICAL CONDITIONS (multi-select) */
function toggleCondition(opt, val) {
  var isSelected = opt.classList.contains('selected');
  if (val === 'None') {
    document.querySelectorAll('#condGroup .cond-opt').forEach(function (o) { o.classList.remove('selected'); });
    selectedConditions = [];
    if (!isSelected) { opt.classList.add('selected'); selectedConditions = ['None']; }
  } else {
    var noneOpt = document.getElementById('cond-none');
    if (noneOpt) noneOpt.classList.remove('selected');
    selectedConditions = selectedConditions.filter(function (c) { return c !== 'None'; });
    if (isSelected) {
      opt.classList.remove('selected');
      selectedConditions = selectedConditions.filter(function (c) { return c !== val; });
    } else {
      opt.classList.add('selected');
      if (selectedConditions.indexOf(val) === -1) selectedConditions.push(val);
    }
  }
}

/* DOCTOR DROPDOWN */
function updateDoctors() {
  var dept = document.getElementById('department').value;
  var sel  = document.getElementById('doctor');
  sel.innerHTML = '<option value="">— Any Available Doctor —</option>';
  if (dept && DOCTORS[dept]) {
    DOCTORS[dept].forEach(function (name) {
      var opt = document.createElement('option');
      opt.value = name; opt.textContent = name;
      sel.appendChild(opt);
    });
  }
  hideErr('err-department');
}

/* AGE CALCULATOR */
function calcAge() {
  var dobVal = document.getElementById('dob').value;
  var el     = document.getElementById('ageDisplay');
  if (!dobVal) { el.className = 'age-display'; return; }
  var birth = new Date(dobVal);
  var today = new Date(); today.setHours(0,0,0,0);
  if (birth > today) { el.className = 'age-display'; return; }
  var totalDays = Math.floor((today - birth) / 86400000);
  var years  = Math.floor(totalDays / 365.25);
  var months = Math.floor((totalDays % 365.25) / 30.44);
  var days   = Math.floor(totalDays % 30.44);
  el.innerHTML = 'Age: <strong>' + years + ' years</strong>, ' + months + ' months &amp; ' + days + ' days' +
    ' &nbsp;&middot;&nbsp; Total: <strong>' + totalDays.toLocaleString() + ' days</strong>';
  el.className = 'age-display show';
  hideErr('err-dob');
}

/* ERROR HELPERS */
function showErr(id) { var e = document.getElementById(id); if (e) e.classList.add('show'); }
function hideErr(id) { var e = document.getElementById(id); if (e) e.classList.remove('show'); }
function fieldError(fid, eid) { var e=document.getElementById(fid); if(e) e.classList.add('error'); showErr(eid); }
function fieldOk(fid, eid)    { var e=document.getElementById(fid); if(e) e.classList.remove('error'); hideErr(eid); }

/* VALIDATION */
function getVal(id) { var e=document.getElementById(id); return e ? e.value.trim() : ''; }

function validateSection(n) {
  var ok = true;

  if (n === 1) {
    if (!getVal('fullName'))                                         { fieldError('fullName','err-fullName'); ok=false; } else fieldOk('fullName','err-fullName');
    if (!getVal('dob'))                                              { fieldError('dob','err-dob');           ok=false; } else fieldOk('dob','err-dob');
    if (!getVal('genderVal'))                                        { showErr('err-gender');                 ok=false; } else hideErr('err-gender');
    if (!getVal('bloodGroupVal'))                                    { showErr('err-blood');                  ok=false; } else hideErr('err-blood');
    if (!getVal('phone') || getVal('phone').length < 6)              { fieldError('phone','err-phone');       ok=false; } else fieldOk('phone','err-phone');
    var em = getVal('email');
    if (!em || em.indexOf('@') < 1 || em.indexOf('.',em.indexOf('@'))<0) { fieldError('email','err-email'); ok=false; } else fieldOk('email','err-email');
  }

  if (n === 2) {
    if (!getVal('symptoms'))    { fieldError('symptoms','err-symptoms'); ok=false; } else fieldOk('symptoms','err-symptoms');
    if (!getVal('duration'))    { fieldError('duration','err-duration'); ok=false; } else fieldOk('duration','err-duration');
    if (!getVal('severityVal')) { showErr('err-severity');              ok=false; } else hideErr('err-severity');
  }

  if (n === 3) {
    if (!getVal('department'))   { fieldError('department','err-department'); ok=false; } else fieldOk('department','err-department');
    if (!getVal('apptDate'))     { fieldError('apptDate','err-apptDate');     ok=false; } else fieldOk('apptDate','err-apptDate');
    if (!getVal('timeSlotVal'))  { showErr('err-timeSlot');                   ok=false; } else hideErr('err-timeSlot');
    if (!getVal('emergencyVal')) { showErr('err-emergency');                  ok=false; } else hideErr('err-emergency');
  }

  return ok;
}

/* NAVIGATION */
function goNext(from) { if (!validateSection(from)) return; moveTo(from + 1); }
function goPrev(from) { moveTo(from - 1); }

function moveTo(n) {
  document.getElementById('section' + currentSection).classList.remove('active');
  for (var i = 1; i <= 4; i++) {
    var ps = document.getElementById('ps' + i);
    ps.classList.remove('active','completed');
    if (i < n) ps.classList.add('completed');
    if (i === n) ps.classList.add('active');
  }
  currentSection = n;
  document.getElementById('section' + n).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* SUBMIT — posts JSON to Flask /submit */
async function submitForm() {

  if (!consentState.chk1 || !consentState.chk2) { showErr('err-consent'); return; }
  hideErr('err-consent');

  /* Disable button to prevent double-submit */
  var btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.textContent = 'Submitting…';

  /* Collect all form data — keys match exactly what app.py expects */
  const payload = {
    /* Section 1 — Patient */
    fullName:   getVal('fullName'),
    dob:        getVal('dob'),
    gender:     getVal('genderVal'),
    bloodGroup: getVal('bloodGroupVal'),
    phone:      getVal('countryCode') + getVal('phone'),
    email:      getVal('email'),
    address:    getVal('address'),

    /* Section 2 — Medical */
    symptoms:   getVal('symptoms'),
    duration:   getVal('duration'),
    severity:   getVal('severityVal'),
    conditions: selectedConditions.join(', '),
    medications:getVal('medications'),
    allergies:  getVal('allergies'),

    /* Section 3 — Appointment */
    department: getVal('department'),
    doctor:     getVal('doctor'),
    apptDate:   getVal('apptDate'),
    timeSlot:   getVal('timeSlotVal'),
    emergency:  getVal('emergencyVal'),
  };

  try {
    const response = await fetch('/submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok) {
      /* Hide sections & strip */
      document.querySelectorAll('.form-section').forEach(function (s) { s.style.display = 'none'; });
      document.getElementById('infoStrip').style.display = 'none';

      /* Mark all steps complete */
      for (var i = 1; i <= 4; i++) {
        var ps = document.getElementById('ps' + i);
        ps.classList.remove('active');
        ps.classList.add('completed');
      }

      /* Show reference from backend */
      document.getElementById('refNum').textContent = 'REF# ' + result.reference;
      document.getElementById('successWrap').classList.add('show');
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } else {
      alert('Error: ' + (result.error || 'Could not save appointment. Please try again.'));
      btn.disabled = false;
      btn.innerHTML = '&#10022; Submit Appointment';
    }

  } catch (err) {
    console.error(err);
    alert('Server connection failed. Please check your connection and try again.');
    btn.disabled = false;
    btn.innerHTML = '&#10022; Submit Appointment';
  }
}

/* RESET */
function resetForm() {
  document.querySelectorAll('.form-section').forEach(function (s) { s.style.display=''; s.classList.remove('active'); });
  document.getElementById('infoStrip').style.display = '';
  document.getElementById('successWrap').classList.remove('show');

  currentSection = 1;
  document.getElementById('section1').classList.add('active');
  for (var i = 1; i <= 4; i++) {
    var ps = document.getElementById('ps' + i);
    ps.classList.remove('active','completed');
    if (i === 1) ps.classList.add('active');
  }

  ['fullName','dob','phone','email','address','symptoms','duration','medications','allergies','apptDate']
    .forEach(function (id) { var e=document.getElementById(id); if(e){e.value=''; e.classList.remove('error');} });

  ['countryCode','department','doctor'].forEach(function (id) {
    var e=document.getElementById(id); if(e) e.selectedIndex=0;
  });

  ['bloodGroupVal','severityVal','genderVal','timeSlotVal','emergencyVal'].forEach(function (id) {
    var e=document.getElementById(id); if(e) e.value='';
  });

  document.querySelectorAll('.radio-opt').forEach(function (o) { o.classList.remove('selected'); });
  document.querySelectorAll('.blood-btn').forEach(function (b) { b.classList.remove('active'); });
  document.querySelectorAll('.sev-btn').forEach(function (b)   { b.classList.remove('active'); });

  ['chk1','chk2','chk3'].forEach(function (key) {
    consentState[key] = false;
    var row = document.getElementById('row-' + key);
    if (row) row.classList.remove('checked');
  });

  selectedConditions = [];
  document.getElementById('ageDisplay').className = 'age-display';
  document.querySelectorAll('.error-msg').forEach(function (e) { e.classList.remove('show'); });

  /* Re-enable submit button */
  var btn = document.getElementById('submitBtn');
  if (btn) { btn.disabled = false; btn.innerHTML = '&#10022; Submit Appointment'; }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}