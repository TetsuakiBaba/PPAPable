document.addEventListener('DOMContentLoaded', function () {
    // `manifest.json` を読み込む
    fetch('manifest.json')
        .then(response => response.json())
        .then(data => {
            // バージョン情報をページに表示
            const version = data.version || 'unknown';
            const versionElement = document.getElementById('appVersion');
            versionElement.textContent = `Version: ${version}`;
            const description = data.description || 'unknown';
            const descriptionElement = document.getElementById('project_lead');
            descriptionElement.innerHTML = `${description}`;
        })
        .catch(error => {
            console.error('Error fetching the manifest.json:', error);
        });


    const passwordNameInput = document.getElementById('passwordName');
    const passwordLengthInput = document.getElementById('passwordLength');
    const includeNumbersCheckbox = document.getElementById('includeNumbers');
    const includeLettersCheckbox = document.getElementById('includeLetters');
    const includeSymbolsCheckbox = document.getElementById('includeSymbols');
    const generateButton = document.getElementById('generateButton');
    const generatedPasswordInput = document.getElementById('generatedPassword');
    const existingPasswordNameInput = document.getElementById('existingPasswordName');
    const existingPasswordInput = document.getElementById('existingPassword');
    const addExistingButton = document.getElementById('addExistingButton');
    const searchInput = document.getElementById('searchInput');
    const passwordList = document.getElementById('passwordList');
    const backupButton = document.getElementById('backupButton');
    const restoreButton = document.getElementById('restoreButton');
    const restoreInput = document.getElementById('restoreInput');
    const deleteBeforeButton = document.getElementById('deleteBeforeButton');
    const deleteBeforeInput = document.getElementById('deleteBeforeInput');


    // localStorage に保存された ppapable.passwordLength の値があればelementをその値で更新
    const savedPasswordLength = localStorage.getItem('ppapable.passwordLength');
    if (savedPasswordLength) {
        passwordLengthInput.value = savedPasswordLength;
    }


    const storageKey = 'ppapable.passwords';

    function generatePassword() {
        const length = parseInt(passwordLengthInput.value, 10);
        const includeNumbers = includeNumbersCheckbox.checked;
        const includeLetters = includeLettersCheckbox.checked;
        const includeSymbols = includeSymbolsCheckbox.checked;

        const numbers = '0123456789';
        const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const symbols = '!@#$%^&*()_+[]{}|;:<>?';

        let characters = '';
        if (includeNumbers) characters += numbers;
        if (includeLetters) characters += letters;
        if (includeSymbols) characters += symbols;

        if (characters === '') return '';

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * characters.length);
            password += characters[randomIndex];
        }

        return password;
    }

    function savePassword(name, password) {
        const passwordData = JSON.parse(localStorage.getItem(storageKey)) || [];

        // 名前の重複チェック
        const isNameDuplicate = passwordData.some(item => item.name === name);
        if (isNameDuplicate) {
            alert('Already exists, please use a different name');
            return;
        }

        // タイムスタンプを追加して保存
        const timestamp = new Date().toISOString();
        passwordData.push({ name, password, timestamp });
        localStorage.setItem(storageKey, JSON.stringify(passwordData));
        displayPasswords();
    }

    function displayPasswords(filter = '') {
        const passwordData = JSON.parse(localStorage.getItem(storageKey)) || [];
        passwordList.innerHTML = '';
        passwordData
            .filter(item => item.name.includes(filter))
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // タイムスタンプでソート
            .forEach((item, index) => {
                const listItem = document.createElement('div');
                listItem.className = 'input-group mb-2';
                listItem.innerHTML = `
                    <span class="input-group-text" style="width:20%;"><i class="bi bi-calendar me-2" title="${item.timestamp}"></i><span style="font-size:0.7rem;" title="${item.name}">${item.name}</span> </span>
                    <input class="form-control" type="text" value="${item.password}" />`;

                // 表示/非表示切り替えボタン
                const toggleVisibilityButton = document.createElement('button');
                toggleVisibilityButton.className = 'btn btn-warning btn-sm';
                toggleVisibilityButton.innerHTML = '<i class="bi bi-eye"></i>';

                toggleVisibilityButton.onclick = function () {
                    const passwordInput = listItem.querySelector('input');
                    if (passwordInput.type === 'password') {
                        passwordInput.type = 'text';
                        toggleVisibilityButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
                    } else {
                        passwordInput.type = 'password';
                        toggleVisibilityButton.innerHTML = '<i class="bi bi-eye-slash"></i>';
                    }
                };
                listItem.appendChild(toggleVisibilityButton);

                // クリップボードにコピーするボタンを追加
                const copyButton = document.createElement('button');
                copyButton.className = 'btn btn-secondary btn-sm';
                copyButton.innerHTML = '<i class="bi bi-clipboard ms-4 me-4"></i>';
                copyButton.onclick = function () {
                    navigator.clipboard.writeText(item.password).then(() => {
                        copyButton.classList.add('bg-success', 'text-white');
                        copyButton.innerHTML = '<i class="bi bi-clipboard-check"></i> Copied';
                        listItem.querySelector('input').select();
                        setTimeout(() => {
                            copyButton.classList.remove('bg-success', 'text-white');
                            copyButton.innerHTML = '<i class="bi bi-clipboard ms-4 me-4"></i>';
                            window.getSelection().removeAllRanges();
                        }, 1500);
                    });
                };
                listItem.appendChild(copyButton);

                // パスワードを 現在入力されているパスワードに更新するボタンを追加
                const updateButton = document.createElement('button');
                updateButton.className = 'btn btn-primary btn-sm';
                updateButton.innerHTML = '<i class="bi bi-floppy"></i>';
                updateButton.onclick = function () {
                    const passwordInput = listItem.querySelector('input');
                    const password = passwordInput.value;
                    if (password) {
                        passwordData[index].password = password;
                        localStorage.setItem(storageKey, JSON.stringify(passwordData));
                        updateButton.classList.add('bg-success', 'text-white');
                        updateButton.innerHTML = '<i class="bi bi-check"></i> Updated';
                        setTimeout(() => {
                            updateButton.classList.remove('bg-success', 'text-white');
                            updateButton.innerHTML = '<i class="bi bi-floppy"></i>';
                        }, 1500);
                    }
                };
                listItem.appendChild(updateButton);


                // 削除ボタンを追加
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn btn-danger btn-sm';
                deleteButton.innerHTML = '<i class="bi bi-trash ms"></i>';
                deleteButton.onclick = function () {
                    if (confirm('Are you sure you want to delete?')) {
                        passwordData.splice(index, 1);
                        localStorage.setItem(storageKey, JSON.stringify(passwordData));
                        displayPasswords(filter);
                    }
                };
                listItem.appendChild(deleteButton);

                passwordList.appendChild(listItem);
            });
    }

    generateButton.onclick = function () {
        const name = passwordNameInput.value.trim();
        if (!name) {
            alert('Please enter a name');
            return;
        }

        const password = generatePassword();
        if (password) {
            savePassword(name, password);

            // パスワードをクリップボードに自動コピー
            navigator.clipboard.writeText(password).then(() => {
                // alert('A password has been copied to the clipboard');
                //here
            });

            passwordNameInput.value = '';
        }
    };

    addExistingButton.onclick = function () {
        const name = existingPasswordNameInput.value.trim();
        const password = existingPasswordInput.value.trim();
        if (!name || !password) {
            alert('Please enter both a name and a password');
            return;
        }
        savePassword(name, password);
        existingPasswordNameInput.value = '';
        existingPasswordInput.value = '';
    };

    searchInput.oninput = function () {
        displayPasswords(searchInput.value.trim());
    };

    backupButton.onclick = function () {
        const passwordData = localStorage.getItem(storageKey);
        const blob = new Blob([passwordData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'password_backup.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    restoreButton.onclick = function () {
        restoreInput.click();
    };

    restoreInput.onchange = function (event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function (e) {
            localStorage.setItem(storageKey, e.target.result);
            displayPasswords();
        };
        reader.readAsText(file);
    };

    deleteBeforeButton.onclick = function () {
        const dateStr = deleteBeforeInput.value;
        if (!dateStr) {
            alert('Please select a date');
            return;
        }

        const ans = confirm('Are you sure you want to delete passwords before this date?');
        if (!ans) return;

        // deleteBeforeDate の時間をその日の23:59:59に設定
        const deleteBeforeDate = new Date(dateStr);
        deleteBeforeDate.setHours(23, 59, 59, 999);

        const passwordData = JSON.parse(localStorage.getItem(storageKey)) || [];

        // 指定日時以前のパスワードを削除
        const filteredData = passwordData.filter(item => new Date(item.timestamp) > deleteBeforeDate);
        localStorage.setItem(storageKey, JSON.stringify(filteredData));
        displayPasswords();
    };

    displayPasswords();
});
