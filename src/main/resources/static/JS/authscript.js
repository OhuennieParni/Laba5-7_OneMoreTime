$(document).ready(function () {
    $('#toRegister').on('click', function () {
        $('#logWindow').addClass('hidden');
        $('#regWindow').removeClass('hidden');
    });
    $('#toLogin').on('click', function () {
        $('#regWindow').addClass('hidden');
        $('#logWindow').removeClass('hidden');
    });
});

$('#BackBtn').on('click', function () {
    window.location.href = "../index.html";
});

function showAlert(message) {
    const error = $('<div class="errorAlert"></div>').text(message);
    $('#errorContainer').append(error);

    setTimeout(() => {
        error.fadeOut(500, function () {
            $(this).remove();
        });
    }, 5000);
}

function validEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        return "Введите корректную почту";
    }
    return null;
}

function validFullName(fullName) {
    const parts = fullName.trim().replace(/\s+/g, ' ').split(' ');
    if (parts.length !== 3) {
      return "Введите полное ФИО";
    }
    const wordRegex = /^[А-ЯЁа-яё]{2,}(-[А-ЯЁа-яё]{2,})?$/;
    for (let part of parts) {
      if (!wordRegex.test(part)) {
        return "Введите настоящее ФИО";
      }
    }
    return null;
}

function validDate(birthDate) {
    const today = new Date();
    const date = new Date(birthDate);
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age--;
    }
    if (age > 120 || age < 0 || date > today) {
        return "Введите корректную дату рождения";
    }
    return null;
}

function validPassword(password) {
    if (password.length < 8) {
        return "Пароль должен содержать не менее 8 символов";
    }
    if (!/[a-z]/.test(password)) {
        return "Пароль должен содержать хотя бы одну строчную букву";
    }
    if (!/[A-Z]/.test(password)) {
        return "Пароль должен содержать хотя бы одну заглавную букву";
    }
    if (!/[0-9]/.test(password)) {
        return "Пароль должен содержать хотя бы одну цифру";
    }
    return null;
}
$('#registerBtn').on('click', function () {
    
    const email = $('#regEmail').val().trim();
    const fullName = $('#regFullName').val().trim();
    const birthDate = $('#regBirthData').val();
    const password = $('#regPassword').val();
    const avatar = $('#regAvatar')[0].files[0];  // input type="file"
    
    const user = {
        email: $('#regEmail').val().trim(),
        fullName: $('#regFullName').val().trim(),
        birthDate: $('#regBirthData').val(),
        password: $('#regPassword').val()
    };
    if (!user.email || !user.fullName || !user.birthDate || !user.password) {
        showAlert("Заполните все поля");
        return;
    }
    if (!user.email.includes("@")) {
        showAlert("Неверный формат почты");
        return;
    }
    const emailError = validEmail(user.email);
    if (emailError) {
        showAlert(emailError);
        return;
    }
    const fullNameError = validFullName(user.fullName);
    if (fullNameError) {
        showAlert(fullNameError);
        return;
    }
    const dateError = validDate(user.birthDate);
    if (dateError) {
        showAlert(dateError);
        return;
    }
    const passwordError = validPassword(user.password);
    if (passwordError) {
        showAlert(passwordError);
        return;
    }
    
     if (avatar) {

        if (avatar.size > 5 * 1024 * 1024) {
            showAlert("Размер аватара не должен превышать 5 МБ");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(avatar.type)) {
            showAlert("Разрешены только JPG, PNG или WEBP");
            return;
        }
    }
       // ------------------------------
    // СОЗДАЕМ FormData
    // ------------------------------
    const form = new FormData();

    form.append("email", email);
    form.append("fullName", fullName);
    form.append("birthDate", birthDate);
    form.append("password", password);

    if (avatar) {
        form.append("avatar", avatar); // <-- файл отправляем сюда
    }

    // ------------------------------
    // ОТПРАВКА НА БЭК
    // ------------------------------
    $.ajax({
        url: "/api/auth/register",
        method: "POST",
        data: form,
        processData: false,     // важно
        contentType: false,     // важно
        success: function (res) {

            window.location.href = "../index.html";
        },
        error: function (xhr) {
            const response = xhr.responseJSON;
            if (response && response.error) showAlert(response.error);
            else showAlert("Неизвестная ошибка");
        }
    });
});


$('#loginBtn').on('click', function () {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (!email && !password) {
        showAlert("Введи данные аккаунта");
        return;
    }
    if (!email) {
        showAlert("Введи почту");
        return;
    }
    if (!password) {
        showAlert("Введи пароль");
        return;
    }

    $.ajax({
        url: '/api/auth/login',   // ← Путь к Spring Boot
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            email: email,
            password: password
        }),
        success: function (user) {

            if (!user.authenticated) {
                showAlert("Неверная почта или пароль");
                return;
            }

            // Сохраняем только полезное
            localStorage.setItem("user", JSON.stringify({
                id: user.id,
                fullName: user.fullName,
                role: user.role
            }));

            // Переходим куда нужно
            window.location.href = "../index.html";
        },
        error: function () {
            showAlert("Неверный E-mail или пароль");
        }
    });
});

function getShortName(fullName) {
    const parts = fullName.trim().split(" ");
    if (parts.length < 2) return fullName;
    const initials = parts.slice(1).map(p => p[0].toUpperCase() + ".").join(" ");
    return `${parts[0]} ${initials}`;
}

function updateUserPanel() {
    const user = JSON.parse(localStorage.getItem("user"));
    const $panel = $("#userPanel");
    $panel.empty();

    const isFormPage = window.location.href.includes("form");

    if (user && user.fullName) {
        const shortName = getShortName(user.fullName);
        const html = `
            <div class="userbar">
                <h3 class="text topBarText">${shortName}</h3>
            </div>
            <button class="logoutBtn" id="logoutBtn">Выйти</button>
            <button id="${isFormPage ? 'tableLink' : 'formLink'}">
                ${isFormPage ? 'Перейти к таблице' : 'Перейти к форме'}
            </button>
        `;
        $panel.html(html);
    } else {
        const html = `
            <button id="loginLink">Войти</button>
            <button id="${isFormPage ? 'tableLink' : 'formLink'}">
                ${isFormPage ? 'Перейти к таблице' : 'Перейти к форме'}
            </button>
        `;
        $panel.html(html);
    }
}


$(document).on("click", "#logoutBtn", function () {
    localStorage.removeItem("user");
    window.location.href = "auth.html";
});

$(document).on("click", "#loginLink", function () {
    window.location.href = "auth.html";
});

$(document).on("click", "#tableLink", function () {
    window.location.href = "records.html";
});

$(document).on("click", "#formLink", function () {
    window.location.href = "form.html";
});

$(document).ready(function () {
    updateUserPanel();
});

let recordCounter = 0;

$('#inspectionForm').on('submit', function (e) {
    e.preventDefault();
    createFormRecord();
});

function createFormRecord() {
    console.log(1);
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (!localUser || !localUser.email) {
        showAlert("Вы не авторизованы");
        return;
    }

    $.ajax({
        url: '../../BackEnd/getUserInfo.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ email: localUser.email }),
        success: function (user) {
            const record = {
                email: localUser.email,
                fullName: user.fullName,
                birthDate: user.birthDate,
                date: $('#date').val(),
                time: $('#time').val(),
                specialist: $('#doctor').val(),
                complaints: $('#reason').val(),
                comments: $('#comment').val()
            };

            $.ajax({
                url: '../../BackEnd/saveForm.php',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(record),
                success: function (saved) {
                    appendRecordToTable(saved);
                },
                error: function (res) {
                    const response = JSON.parse(res.responseText);
                    showAlert(response.error);
                }
            });
        },
        error: function () {
            showAlert("Не удалось получить информацию о пользователе.");
        }
    });
}


function appendRecordToTable(record) {
    console.log('1234567');
    recordCounter++;
    const row = `
        <tr>
            <td>${recordCounter}</td>
            <td>${record.createdAt}</td>
            <td>${record.fullName}</td>
            <td>${record.date}</td>
            <td>${record.time}</td>
            <td>${record.specialist}</td>
            <td>${record.complaints}</td>
            <td>${record.comments}</td>
        </tr>
    `;
    $('#inspectionTable tbody').prepend(row);
}