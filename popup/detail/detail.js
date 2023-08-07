const passwordsDiv = document.querySelector('.passwords');
const logoutBtn = document.querySelector('#logout');

let credentials = '';
let tabUrl = '';

const loadPasswords = () => {
    console.log(credentials)
    console.log(tabUrl)
    const passwords = credentials[tabUrl];
    console.log(passwords)
    if (passwords) {
        passwords.forEach(password => {
            const passwordDiv = document.createElement('div');
            passwordDiv.classList.add('password');
            const detailsDiv = document.createElement('div');
            detailsDiv.classList.add('details');
            const btnDiv = document.createElement('div');
            btnDiv.classList.add('btns');

            const user = document.createElement('input');
            user.classList.add('user');
            user.value = password.username;
            user.disabled = true;
            user.type = 'text';

            const pass = document.createElement('input');
            pass.classList.add('pass');
            pass.value = password.password;
            pass.type = 'password';
            pass.disabled = true;
            pass.id = 'pass' + password.username + password.password;

            const uploadImg = document.createElement('img');
            uploadImg.classList.add('upload');
            uploadImg.src = '../../assets/upload.png';
            uploadImg.addEventListener('click', () => {
                const password = {
                    username: user.value,
                    password: pass.value
                }
                console.log(password)
                chrome.runtime.sendMessage({type: 'upload', password: password}, response => {
                    console.log(response);
                });

            })

            const deleteImg = document.createElement('img');
            deleteImg.classList.add('delete');
            deleteImg.src = '../../assets/delete.png';
            deleteImg.addEventListener('click', () => {
                const password = {
                    username: user.value,
                    password: pass.value
                }
                chrome.runtime.sendMessage({type: 'delete', password: password}, response => {
                    console.log(response);
                    window.location.reload();
                });
            })

            detailsDiv.appendChild(user);
            detailsDiv.appendChild(pass);

            btnDiv.appendChild(uploadImg);
            btnDiv.appendChild(deleteImg);

            passwordDiv.appendChild(detailsDiv);
            passwordDiv.appendChild(btnDiv);

            passwordsDiv.appendChild(passwordDiv);
        })
    }
}

(async () => {
    let passId = null;

    passwordsDiv.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('pass')) {
            if (passId) {
                document.getElementById(passId).type = 'password';
            }
            passId = e.target.id;
            document.getElementById(passId).type = 'text';
        }
    });

    passwordsDiv.addEventListener('mouseout', (e) => {
        if (passId) {
            document.getElementById(passId).type = 'password';
            passId = null;
        }
    });

    await chrome.runtime.sendMessage({type: 'get'}, response => {
        if (response) {
            credentials = JSON.parse(response[0]);
            tabUrl = response[1];
            loadPasswords();
        } else {
            console.log('No credentials found');
        }
    });
    logoutBtn.addEventListener('click', () => {
        chrome.runtime.sendMessage({type: 'logout'}, response => {
            console.log(response);
        });
        console.log('Logging out')
        window.location.href = '../login/login.html';
    })
})()

