/**
 * Dashboard — shown after successful 2FA login.
 * Reads session data from localStorage and fetches login history from the backend.
 */
(function () {
  var token = localStorage.getItem('auth_token');
  var phone = localStorage.getItem('auth_phone');
  var loginTime = localStorage.getItem('auth_login_time');

  if (!token || !phone) {
    window.location.href = '/';
    return;
  }

  document.getElementById('welcomeMsg').textContent = 'Logged in as +' + phone;
  document.getElementById('phoneDisplay').textContent = '+' + phone;
  document.getElementById('loginTime').textContent = new Date(loginTime).toLocaleString();

  function renderHistory(events) {
    var list = document.getElementById('historyList');
    var count = document.getElementById('historyCount');
    count.textContent = events.length;

    if (!events.length) {
      list.innerHTML = '<p class="empty-state">No login history yet.</p>';
      return;
    }

    list.innerHTML = events
      .slice()
      .reverse()
      .map(function (event) {
        var campaignBadge = event.campaignId
          ? '<span class="badge">Campaign #' + event.campaignId + '</span>'
          : '';
        return (
          '<div class="history-item">' +
            '<div class="phone">+' + event.phone + campaignBadge + '</div>' +
            '<div class="meta">' +
              new Date(event.timestamp).toLocaleString() +
              ' &mdash; IP: ' + event.ip +
            '</div>' +
          '</div>'
        );
      })
      .join('');
  }

  fetch('/api/auth/history', {
    headers: { Authorization: 'Bearer ' + token },
  })
    .then(function (res) { return res.json(); })
    .then(function (data) { renderHistory(data); })
    .catch(function () {
      document.getElementById('historyList').innerHTML =
        '<p class="empty-state">Failed to load history.</p>';
    });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_phone');
    localStorage.removeItem('auth_login_time');
    window.location.href = '/';
  });
})();
