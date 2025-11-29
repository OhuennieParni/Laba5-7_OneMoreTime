var usersArray = [];
var currentUser = null;

$(document).ready(async function () {
    currentUser = await getUserData();
    
    if (!currentUser.authenticated) {
        window.location.href = "auth.html";
        return;
    }

    if (!currentUser.role === "admin") {
        window.location.href = "auth.html";
        return;
    }
    loadUsers();
});

/**
 * Загружает список всех пользователей с сервера.
 * Заполняет массив usersArray и вызывает showUsers() для отрисовки.
 * 
 * @returns {undefined}
 */
function loadUsers() {
    $.ajax({
        url: "/api/manageUsers",
        method: "GET",
        dataType: "JSON",
        success: function (response) {
            usersArray = response;
            showUsers();
        },
        error: function() {
            showAlert("Ошибка загрузки пользователей!");
        }
    });
}

/**
 * Отрисовывает список пользователей на странице.
 * Создаёт карточки с информацией:
 *  - ФИО, email, роль;
 *  - статус (активен / заблокирован);
 *  - аватар;
 *  - кнопки действий (редактирование, бан, удаление) — только для админа.
 *
 * @returns {undefined}
 */
function showUsers() {
    const $box = $(".users-box").first();
    $box.empty();
    const headerHtml = `
        <div class="users-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px;">
            <h1 style="margin:0; font-size:24px;">Управление пользователями</h1>
            <div>
                <button class="btn add-user-btn">Добавить пользователя</button>
                <button class="logout-btn btn" onclick="location.href='../index.html'">Назад</button>
            </div>
        </div>
    `;
    $box.append(headerHtml);

    if (!usersArray.length) {
        $box.append("<p style='text-align:center;margin:30px'>Пользователей нет</p>");
        return;
    }

    const isAdmin = currentUser?.role === "admin";
    usersArray.forEach(user => {
        const avatar = user.avatarUrl
            ? `<img src="${user.avatarUrl}?v=${Date.now()}" class="user-avatar-img">`
            : `<div class="user-avatar placeholder">?</div>`;

        const html = `
            <div class="user-item" data-id="${user.id}">
                <div class="user-info">
                    <div class="user-avatar">${avatar}</div>
                    <div class="user-details">
                        <h2>${user.fullName || "Без имени"}</h2>
                        <p>${user.email}</p>
                        <p>Роль: <strong>${user.role}</strong></p>
                        <p class="${user.bannedStatus ? "banned" : "active"}">
                            ${user.bannedStatus ? "Заблокирован" : "Активен"}
                        </p>
                    </div>
                </div>

                <div class="user-buttons">
                    ${isAdmin ? `
                        <button class="btn edit-user">Редактировать</button>
                        <button class="btn ban-user ${user.bannedStatus ? "unban" : "ban"}">
                            ${user.bannedStatus ? "Разбанить" : "Забанить"}
                        </button>
                        <button class="btn delete-user">Удалить</button>
                    ` : ""}
                </div>
            </div>
        `;

        $box.append(html);
    });
}

$('body').on('click', '.edit-user', function () {
    if (currentUser.role !== "admin") return showAlert("Нет прав!");
    const id = $(this).closest('.user-item').data('id');
    const user = usersArray.find(u => u.id === id);
    showUserModal(user);
});

$('body').on('click', '.ban-user', function () {
    if (currentUser.role !== "admin") return showAlert("Нет прав!");
    const id = $(this).closest('.user-item').data('id');
    const user = usersArray.find(u => u.id === id);
    toggleBan(id, !user.bannedStatus);
});

$('body').on('click', '.delete-user', function () {
    if (currentUser.role !== "admin") return showAlert("Нет прав!");
    const id = $(this).closest('.user-item').data('id');
    deleteUser(id);
});

/**
 * Открывает модальное окно для редактирования выбранного пользователя.
 * 
 * @param {type} user - объект пользователя
 * @returns {undefined}
 */
function showUserModal(user) {
    $('#myModal').remove();

    const html = `
        <div id="myModal" class="modal-overlay">
            <div class="modal-content modal-edit">

                <button class="close-btn">X</button>
                <h2>Редактирование пользователя</h2>

                <label>ФИО:</label>
                <input id="uFullName" type="text" value="${user.fullName || ""}">

                <label>Email:</label>
                <input id="uEmail" type="email" value="${user.email}">

                <label>Дата рождения:</label>
                <input id="uBirthDate" type="date" value="${user.birthdate || ""}">

                <label>Роль:</label>
                <select id="uRole">
                    <option value="user" ${user.role==="user"?"selected":""}>
                        Пользователь</option>
                    <option value="moder" ${user.role==="moder"?"selected":""}>
                        Модератор</option>
                    <option value="admin" ${user.role==="admin"?"selected":""}>
                        Администратор</option>
                </select>

                <div class="fileInputBlock">
                    <label class="fileLabel">Аватар</label>
                    <label class="fileUploadWrapper">
                        <div class="filePreviewContainer">
                            <img id="uPreview" class="filePreview 
                                ${!user.avatarUrl?"hidden":""}"
                                 src="${user.avatarUrl || ""}">
                        </div>
                        <span id="uFileName" class="filePlaceholder">
                            ${user.avatarUrl ? "Заменить..." : "Выбрать..."}
                        </span>
                        <span class="fileBtn">Обзор</span>
                        <input type="file" id="uAvatar" accept=".jpg,.jpeg,.png,.webp">
                    </label>
                </div>

                <button class="btn save-user" data-id="${user.id}">Сохранить</button>
                <div id="modalErrorContainer" style="margin-top: 15px;"></div>
            </div>
        </div>
    `;

    $('body').append(html);

    $("#uAvatar").on("change", function () {
        const file = this.files[0];
        if (!file) return;

        $("#uFileName").text(file.name);

        const reader = new FileReader();
        reader.onload = e => $("#uPreview").attr("src", 
            e.target.result).removeClass("hidden");
        reader.readAsDataURL(file);
    });

    setTimeout(() => $("#myModal").addClass("show"), 20);

    $("#myModal").on("click", e => {
        if ($(e.target).is('.modal-overlay, .close-btn')) closeModal();
    });
}

/**
 * Сохраняет изменения выбранного пользователя.
 * Выполняет валидацию, готовит FormData и отправляет POST на /manageUsers/editUser.
 */
$('body').on('click', '.save-user', function () {
    if (currentUser.role !== "admin") return showAlert("Нет прав!");
    
     const user = {
        id: $(this).data('id'),
        fullName: $("#uFullName").val().trim(),
        email: $("#uEmail").val().trim(),
        birthDate: $("#uBirthDate").val().trim(),
        role: $("#uRole").val()
    };

    const avatar = $("#uAvatar")[0].files[0];

    if (!user.fullName || !user.email || !user.birthDate) {
        showAlert("Заполните все поля");
        return;
    }

    const fullNameError = validFullName(user.fullName);
    if (fullNameError) return showAlert(fullNameError);

    const emailError = validEmail(user.email);
    if (emailError) return showAlert(emailError);

    const dateError = validDate(user.birthDate);
    if (dateError) return showAlert(dateError);

    if (avatar) {

        if (avatar.size > 5 * 1024 * 1024) {
            showAlert("Размер аватара не должен превышать 5 МБ");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(avatar.type)) {
            showAlert("Разрешены только JPG, PNG и WEBP");
            return;
        }
    }

    const form = new FormData();

    form.append("id", user.id);
    form.append("fullName", user.fullName);
    form.append("email", user.email);
    form.append("birthDate", user.birthDate);
    form.append("role", user.role);

    if (avatar) {
        form.append("avatar", avatar);
    }

    $.ajax({
        url: "/api/manageUsers/editUser",
        method: "POST",
        data: form,
        contentType: false,
        processData: false,
        success: function () {
            closeModal();
            showSuccess("Изменения сохранены!");
            loadUsers();
        },
        error: function () {
            showAlert("Ошибка сохранения!");
        }
    });
});

/**
 * Блокирует / разблокирует пользователя.
 * 
 * @param {type} id - id пользователя
 * @param {type} status - true = заблокировать, false = разбанить
 * @returns {unresolved}
 */
function toggleBan(id, status) {
    if (currentUser.role !== "admin") return showAlert("Нет прав!");

    $.ajax({
        url: "/api/manageUsers/banUser",
        method: "POST",
        data: { id: id, bannedStatus: status, role: currentUser.role },
        success: function (updatedUser) {
            const index = usersArray.findIndex(x => x.id === id);
            if (index !== -1) {
                usersArray[index].bannedStatus = updatedUser.bannedStatus;
            }
            showUsers();
            showSuccess(updatedUser.bannedStatus ? "Пользователь заблокирован" : "Блокировка снята");
        },
        error: function () {
            showAlert("Ошибка");
        }
    });
}

/**
 * Удаляет пользователя по ID.
 * Удаляет с сервера, затем убирает из массива и DOM.
 * 
 * @param {type} id - id пользователя
 * @returns {unresolved}
 */
function deleteUser(id) {
    if (currentUser.role !== "admin") return showAlert("Нет прав!");
    $.ajax({
        url: "/api/manageUsers/delete",
        method: "POST",
        data: { id: id },
        success: function () {
            usersArray = usersArray.filter(u => u.id !== id);
            $(`.user-item[data-id="${id}"]`).remove();
            showSuccess("Пользователь удалён");
        },
        error: function () {
            showAlert("Ошибка удаления");
        }
    });
}

/**
 * Закрывает текущее модальное окно с анимацией.
 * 
 * @returns {undefined}
 */
function closeModal() {
    $('#myModal').removeClass('show');
    setTimeout(() => $('#myModal').remove(), 250);
}

/**
 * Добавление пользователя
 */
$('body').on('click', '.add-user-btn', function () {
    showCreateUserModal();
});

/**
 * Открывает модальное окно для создания нового пользователя.
 * Формирует HTML, подключает обработчики загрузки аватара,
 * отображает окно с анимацией.
 * 
 * @returns {undefined}
 */
function showCreateUserModal() {
    $('#myModal').remove();

    const html = `
        <div id="myModal" class="modal-overlay">
            <div class="modal-content modal-edit">

                <button class="close-btn">X</button>
                <h2>Добавление пользователя</h2>

                <label>ФИО:</label>
                <input id="newFullName" type="text">

                <label>Email:</label>
                <input id="newEmail" type="email">
    
                <label>Пароль:</label>
                <input id="newPassword" type="password">

                <label>Дата рождения:</label>
                <input id="newBirthDate" type="date">

                <label>Роль:</label>
                <select id="newRole">
                    <option value="user">Пользователь</option>
                    <option value="moder">Модератор</option>
                    <option value="admin">Администратор</option>
                </select>

                <div class="fileInputBlock">
                    <label class="fileLabel">Аватар</label>
                    <label class="fileUploadWrapper">
                        <div class="filePreviewContainer">
                            <img id="newPreview" class="filePreview hidden" src="">
                        </div>
                        <span id="newFileName" class="filePlaceholder">Выбрать...</span>
                        <span class="fileBtn">Обзор</span>
                        <input type="file" id="newAvatar" accept=".jpg,.jpeg,.png,.webp">
                    </label>
                </div>

                <button class="btn create-user-save">Создать</button>
                <div id="modalErrorContainer" style="margin-top: 15px;"></div>
            </div>
        </div>
    `;

    $('body').append(html);

    $("#newAvatar").on("change", function () {
        const file = this.files[0];
        if (!file) return;

        $("#newFileName").text(file.name);

        const reader = new FileReader();
        reader.onload = e => $("#newPreview").attr("src", e.target.result).removeClass("hidden");
        reader.readAsDataURL(file);
    });

    setTimeout(() => $("#myModal").addClass("show"), 20);

    $("#myModal").on("click", e => {
        if ($(e.target).is('.modal-overlay, .close-btn')) closeModal();
    });
}

/**
 * Валидирует данные нового пользователя, формирует FormData и отправляет 
 * на сервер.
 */
$('body').on('click', '.create-user-save', function () {
    const fullName = $("#newFullName").val().trim();
    const email = $("#newEmail").val().trim();
    const password = $("#newPassword").val().trim();
    const birthDate = $("#newBirthDate").val().trim();
    const role = $("#newRole").val();
    const avatar = $("#newAvatar")[0].files[0];

    if (!fullName || !email || !birthDate) {
        showAlert("Заполните все поля");
        return;
    }

    const fullNameError = validFullName(fullName);
    if (fullNameError) return showAlert(fullNameError);

    const emailError = validEmail(email);
    if (emailError) return showAlert(emailError);

    const dateError = validDate(birthDate);
    if (dateError) return showAlert(dateError);
    
    const passwordError = validPassword(password);
    if (passwordError) return showAlert(passwordError);

    if (avatar) {
        if (avatar.size > 5 * 1024 * 1024) {
            showAlert("Размер аватара не должен превышать 5 МБ");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(avatar.type)) {
            showAlert("Разрешены только JPG, PNG и WEBP");
            return;
        }
    }

    const form = new FormData();
    form.append("fullName", fullName);
    form.append("email", email);
    form.append("password", password);
    form.append("birthDate", birthDate);
    form.append("role", role);
    if (avatar) form.append("avatar", avatar);

    $.ajax({
        url: "/api/auth/register",
        method: "POST",
        data: form,
        contentType: false,
        processData: false,
        success: function () {
            closeModal();
            showSuccess("Пользователь создан!");
            loadUsers();
        },
        error: function () {
            showAlert("Ошибка создания пользователя!");
        }
    });
});

