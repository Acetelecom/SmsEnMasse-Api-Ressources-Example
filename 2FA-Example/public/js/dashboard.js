(function () {
  var phone = localStorage.getItem('auth_phone');
  var loginTime = localStorage.getItem('auth_login_time');

  if (!phone) { window.location.href = '/'; return; }

  document.getElementById('welcomeMsg').textContent = 'Logged in as +' + phone;
  document.getElementById('phoneDisplay').textContent = '+' + phone;
  document.getElementById('loginTime').textContent = new Date(loginTime).toLocaleString();

  fetch('/api/auth/history')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      var list = document.getElementById('historyList');
      document.getElementById('historyCount').textContent = data.length;

      if (!data.length) {
        list.innerHTML = '<p class="empty-state">No login history yet.</p>';
        return;
      }

      list.innerHTML = data.slice().reverse().map(function (event) {
        var badge = event.campaignId ? '<span class="badge">Campaign #' + event.campaignId + '</span>' : '';
        return (
          '<div class="history-item">' +
            '<div class="phone">+' + event.phone + badge + '</div>' +
            '<div class="meta">' + new Date(event.timestamp).toLocaleString() + ' &mdash; IP: ' + event.ip + '</div>' +
          '</div>'
        );
      }).join('');
    })
    .catch(function () {
      document.getElementById('historyList').innerHTML = '<p class="empty-state">Failed to load history.</p>';
    });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    localStorage.removeItem('auth_phone');
    localStorage.removeItem('auth_login_time');
    window.location.href = '/';
  });
})();
