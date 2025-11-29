$(document).ready(function () {

    $.ajax({
        url: "/api/auth/whoAmI",
        method: "GET",
        success: function (user) {
            updateHeader(user);
        },
        error: function () {
            updateHeader({ authenticated: false });
        }
    });
    
     $.ajax({
        url: "/api/requests/approved",
        method: "GET",
        success: function (requests) {
            ALL_REQUESTS = requests;
            renderRequests(requests);
        }
    });

});

/**
 * Обновляет элементы верхнего меню в зависимости от статуса пользователя.
 * Выполняет:
 *  - отображение кнопок для гостя / пользователя / модератора / админа;
 *  - добавление кнопки "Оставить запрос";
 *  - вывод количества посещений;
 *  - показ уведомления о бане, если user.bannedStatus = true;
 *  - создание кнопки "Выход".
 * @param {type} user - объект пользователя, полученный с сервера
 * @returns {undefined}
 */
function updateHeader(user) {
    const box1 = $("#visits");
    const box = $("#user-buttons");
    const drop= $("#drop");
    const Addrequest = $("#forButton");
    box.empty();
    box1.empty();

    if (!user.authenticated) {
        drop.append(`
            <button class="btn" onclick="location.href='Pages/auth.html'">Войти</button>
        `);
        $('#dropbtn').addClass('hidden');
        return;
    }

    if (user.bannedStatus === true) {
        $("body").append(`
            <div id="banOverlay">
                <div class="ban-title">Ваш аккаунт заблокирован!</div>
                <div class="ban-text">
                    Умоляйте админа разбанить вас!
                </div>
                <button id="banExitBtn" class="btn ban-exit-btn">Выйти</button>
            </div>
        `);

        $("#banExitBtn").on("click", function () {
            logout();
        });

        $("#dropbtn").addClass("hidden");
        $("#user-buttons").empty();
        return;
    }

    box.append(`
        <button class="btn" onclick="location.href='Pages/Cabinet.html'">Личный кабинет</button>
    `);
    
    Addrequest.append (`
        <div class="center"><button class="btn" id="addRequest" onclick="
        location.href='Pages/AddRequest.html'">Оставить запрос</button></div>
    `);
        
    box1.append("Посещения: " + user.visits);

    if (user.role === "moder") {
        box.append(`
            <button class="btn" onclick="location.href='Pages/Addnews.html'">
            Добавить новость</button>
            <button class="btn" onclick="location.href='Pages/validation.html'">
            Проверить запросы</button>
        `);
    }

    if (user.role === "admin") {
        box.append(`
            <button class="btn" onclick="location.href='Pages/UsersControl.html'">
            Управление пользователями</button>
            <button class="btn" onclick="location.href='Pages/Addnews.html'">
            Добавить новость</button>
            <button class="btn" onclick="location.href='Pages/validation.html'">
            Проверить запросы</button>
        `);
    }
    
    box.append(`
        <button class="btn logout-btn" onclick="logout()">Выход</button>
    `);
}

/**
 * Выполняет выход пользователя из аккаунта.
 * Отправляет запрос на /api/auth/logout, после чего перенаправляет на главную 
 * страницу.
 * @returns {undefined}
 */
function logout() {
    $.ajax({
        url: "/api/auth/logout",
        method: "POST",
        success: function () {
            location.href = "index.html";
        }
    });
}

/**
 * апрашивает у сервера текущее московское время
 * и отображает его в элементе #time.
 * 
 * @returns {undefined}
 */
function updateServerTime() {
    $.ajax({
        url: "/api/time",
        method: "GET",
        success: function (data) {
            $("#time").text("Точное московское: "+data.time); 
        }
    });
}

setInterval(updateServerTime, 1000);
updateServerTime();

$("#dropbtn").on("click", function () {
    $(".dropdown").toggleClass("active");
});


/**
 * Обрезает текст до указанного количества слов.
 * 
 * @param {type} text - оригинальный текст
 * @param {type} count - количество слов, которые нужно оставить
 * @returns {String} - короткий текст или исходный, если слов меньше, чем лимит
 */
function trimWords(text, count = 8) {
    const parts = text.split(" ");
    return parts.length <= count
        ? text
        : parts.slice(0, count).join(" ") + "...";
}

/**
 * Отрисовывает список заявок на странице.
 * Каждая карточка включает:
 *  - заголовок;
 *  - краткий текст (обрезанный);
 *  - полный текст (скрыт);
 *  - изображение;
 *  - автора заявки;
 *  - даты создания и обновления;
 *  - статус заявки.
 * Также добавляется функционал раскрытия / сворачивания карточки.
 * 
 * @param {type} list - массив заявок с сервера
 * @returns {undefined}
 */
function renderRequests(list) {
    const box = $("#requestsList");
    box.empty();

    list.forEach(r => {
        const card = $(`
            <div class="request-card">
                <h2 class="request-title">${r.title}</h2>

                <p class="request-preview">
                    ${trimWords(r.description)}
                </p>

                <p class="request-full">
                    ${r.description}
                </p>

                <img class="request-image" src="${r.imagePath ?? ""}" alt="">
        
                <p class="request-author">Автор: ${r.user?.fullName ?? "Неизвестно"}</p>
                <p class="request-addData">Дата добавления: ${r.createdAtFormatted}</p>
                <p class="request-UpData">Дата последнего обновления: ${r.updatedAtFormatted}</p>
                <div class="request-status">
                    ${getStatusHtml(r.status)}
                </div>
            </div>
        `);

        // поведение "раскрыть / свернуть"
        card.on("click", function () {
            $(this).find(".request-preview").toggle();
            $(this).find(".request-full").toggle();
            $(this).find(".request-image").toggle();
        });

        box.append(card);
    });
    
    /**
     * Возвращает HTML-разметку для бейджа статуса заявки.
     * 
     * @param {type} status - статус заявки
     * @returns {String} - HTML строки со статусом
     */
    function getStatusHtml(status) {
        switch (status) {
            case "done":
                return `<span class="status-badge status-done">Выполнено</span>`;
            case "approved":
                return `<span class="status-badge status-approved">Выполняется</span>`;
            case "in_progress":
                return `<span class="status-badge status-approved">Выполняется</span>`;
            case "pending":
            default:
                return `<span class="status-badge status-pending">Ожидает проверки</span>`;
        }
    }
}

/**
 * Функционал поиска по словам и мгновенное обновление при вводе символа
 */
$("#searchBox").on("input", function () {
    const text = $(this).val().toLowerCase();

    const filtered = ALL_REQUESTS.filter(r =>
        r.title.toLowerCase().includes(text)
    );

    renderRequests(filtered);
});
