// 生成浮動粒子
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        container.appendChild(particle);
    }
}

// 切換密碼顯示/隱藏
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const eyeIcon = document.getElementById('eyeIcon');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>';
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>';
    }
}

// 登入主邏輯
function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('error-msg');
    const btn = document.getElementById('loginBtn');

    // 前端驗證
    if (!username || !password) {
        errorMsg.innerText = '請輸入帳號和密碼！';
        errorMsg.style.display = 'block';
        return;
    }

    // 按鈕 loading 狀態
    errorMsg.style.display = 'none';
    btn.disabled = true;
    btn.querySelector('span').textContent = '登入中...';

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
                } else if (data.role === 'LEADER') {
                    window.location.href = '/leader.html';
                } else {
                    window.location.href = '/report.html';
                }
            } else {
                errorMsg.innerText = data.message || '帳號或密碼錯誤';
                errorMsg.style.display = 'block';
            }
        })
        .catch(() => {
            errorMsg.innerText = '登入失敗，請再試一次！';
            errorMsg.style.display = 'block';
        })
        .finally(() => {
            btn.disabled = false;
            btn.querySelector('span').textContent = '登入';
        });
}

document.addEventListener('DOMContentLoaded', function () {
    createParticles();

    // Enter 鍵觸發登入
    document.getElementById('password').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') login();
    });

    // 表單送出
    document.getElementById('loginForm').addEventListener('submit', function (e) {
        e.preventDefault();
        login();
    });
});