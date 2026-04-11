function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('errorMsg');

    if (!username || !password) {
        errorMsg.innerText = '請輸入帳號和密碼！';
        return;
    }

    fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password })
    })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                if (data.role === 'ADMIN') {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/leader.html';
                }
            } else {
                errorMsg.innerText = data.message;
            }
        })
        .catch(err => {
            errorMsg.innerText = '登入失敗，請再試一次！';
        });
}

// 按 Enter 登入
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('password').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') login();
    });
});