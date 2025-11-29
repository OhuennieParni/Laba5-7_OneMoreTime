/**
 * Переключает интерфейс между окнами логина и регистрации.
 * Управляет скрытием/показом элементов #logWindow и #regWindow.
 */
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

/**
 * Обработчик регистрации пользователя.
 * Выполняет:
 *  - сбор данных формы;
 *  - валидацию пользователя (почта, ФИО, дата, пароль);
 *  - проверку аватара (размер, тип);
 *  - формирование FormData для загрузки файла;
 *  - отправку запроса на /api/auth/register.
 * При успешной регистрации пользователь перенаправляется на главную страницу.
 * @returns {void}
 */
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


/**
 * Обработчик авторизации пользователя.
 *
 * Выполняет:
 *  - проверку заполненности полей;
 *  - отправку JSON на /api/auth/login;
 *  - сохранение минимального набора данных пользователя в localStorage;
 *  - переход на главную страницу при успешной авторизации.
 *
 * @returns {void}
 */
$('#loginBtn').on('click', function () {
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (!email && !password) {
        showAlert("Введи данные аккаунта");
        return;
    }
    if (!email) {
        showAlert("Введите почту");
        return;
    }
    if (!password) {
        showAlert("Введите пароль");
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