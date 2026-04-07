/**
 * Login page — Step 1: request an OTP via SMS
 * The phone number is sent to our own backend (/api/auth/send-otp).
 * The backend handles the SmsEnMasse API call — the API key never reaches the browser.
 */
(function () {
  const form = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const errorDiv = document.getElementById('error');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const phone = document.getElementById('phone').value.trim();
    if (!phone) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      sessionStorage.setItem('pending_phone', phone);
      window.location.href = '/verify.html';
    } catch (err) {
      errorDiv.textContent = err.message;
      errorDiv.classList.remove('hidden');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Verification Code';
    }
  });
})();
