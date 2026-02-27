/* PENNILSON LIFELINE — Admin Panel */

function openModal(a) {
  var overlay = document.getElementById('modalOverlay');
  if (!overlay) return;

  set('mName',        a.full_name        || '—');
  set('mRef',         a.appointment_id   || '—');
  set('mDob',         a.dob              || '—');
  set('mGender',      a.gender           || '—');
  set('mBlood',       a.blood_group      || '—');
  set('mPhone',       a.phone            || '—');
  set('mEmail',       a.email            || '—');
  set('mAddress',     a.address          || 'Not provided');
  set('mSymptoms',    a.symptoms         || '—');
  set('mDuration',    a.duration         || '—');
  set('mSeverity',    a.severity         || '—');
  set('mConditions',  a.conditions       || 'None specified');
  set('mMedications', a.medications      || 'None');
  set('mAllergies',   a.allergies        || 'None');
  set('mDept',        a.department       || '—');
  set('mDoctor',      a.doctor           || 'Any available');
  set('mDate',        a.preferred_date   || '—');
  set('mSlot',        a.time_slot        || '—');
  set('mEmergency',   a.emergency        || '—');
  set('mCreated',     a.created_at       || '—');

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  var overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

function set(id, val) {
  var el = document.getElementById(id);
  if (el) el.textContent = val;
}

// Close button
document.addEventListener('DOMContentLoaded', function () {
  // Close button inside modal
  var closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Click outside modal to close
  var overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
  }


  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.btn-view');
    if (!btn) return;
    var record = JSON.parse(btn.getAttribute('data-record'));
    openModal(record);
  });
});

// ESC key closes modal
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});


/* 
   UNIVERSAL FILTER ENGINE
   Call bindFilter() after the page loads.

   tableId   : id of the <table> element
   countId   : id of the element showing record count
   filters   : array of filter config objects:
     { inputId, type: 'search'|'exact', fields: [...] | field: '...' }

   'search'  → checks if any of the listed data-* fields
               contains the input value (case-insensitive)
   'exact'   → checks if the single data-[field] matches exactly 
  */
function bindFilter(tableId, countId, filters) {
  // Attach listeners
  filters.forEach(function (f) {
    var el = document.getElementById(f.inputId);
    if (!el) return;
    var evt = (el.tagName === 'SELECT') ? 'change' : 'input';
    el.addEventListener(evt, function () { runFilter(tableId, countId, filters); });
  });
}

function runFilter(tableId, countId, filters) {
  var table = document.getElementById(tableId);
  if (!table) return;

  var rows  = table.querySelectorAll('tbody tr');
  var count = 0;

  rows.forEach(function (row) {
    var show = true;

    filters.forEach(function (f) {
      var el  = document.getElementById(f.inputId);
      if (!el) return;
      var val = el.value.trim().toLowerCase();
      if (!val) return; // empty = no filter applied

      if (f.type === 'search') {
        // Multi-field text search
        var found = f.fields.some(function (fieldName) {
          return (row.dataset[fieldName] || '').includes(val);
        });
        if (!found) show = false;

      } else if (f.type === 'exact') {
        // Exact match on one data-* attribute
        var rowVal = (row.dataset[f.field] || '').toLowerCase();
        if (rowVal !== val.toLowerCase()) show = false;
      }
    });

    row.style.display = show ? '' : 'none';
    if (show) count++;
  });

  var countEl = document.getElementById(countId);
  if (countEl) {
    countEl.textContent = count + ' record' + (count !== 1 ? 's' : '');
  }
}