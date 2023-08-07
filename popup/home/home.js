const registerEl = document.querySelector('#register');
const loginEl = document.querySelector('#login');

chrome.runtime.sendMessage({type: 'check'}, function (response) {
    if (response) {
        location.href = '../detail/detail.html';
    } else {
        registerEl.style.display = 'block';
        loginEl.style.display = 'block';
    }
});

registerEl.addEventListener('click', function () {
    window.location.href = '../register/register.html';
});

loginEl.addEventListener('click', function () {
    window.location.href = '../login/login.html';
});