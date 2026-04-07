/**
 * Verify page — Step 2: submit the OTP code received by SMS.
 * The code is verified server-side against the stored OTP.
 */
(function () {
  const phone = sessionStorage.getItem('pending_phone');
  if (!phone) {
    window.location.href = '/';
    return;
  }

  document.getElementById('phoneDisplay').textContent = 'Code sent to +' + phone;

  const form = document.getElementById('verifyForm');
  const submitBtn = document.getElementById('submitBtn');
  const backBtn = document.getElementById('backBtn');
  const errorDiv = document.getElementById('error');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const code = document.getElementById('code').value.trim();
    if (code.length !== 6) {
      errorDiv.textContent = 'Please enter the 6-digit code.';
      errorDiv.classList.remove('hidden');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying…';
    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      localStorage.setItem('auth_phone', data.phone);
      localStorage.setItem('auth_login_time', new Date().toISOString());
      sessionStorage.removeItem('pending_phone');

      window.location.href = '/dashboard.html';
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Verify';
    }
  });

  backBtn.addEventListener('click', function () {
    sessionStorage.removeItem('pending_phone');
    window.location.href = '/';
  });
})();
