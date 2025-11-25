$(document).ready(function () {

    // Загружаем данные о пользователе
    $.ajax({
        url: "/api/auth/whoAmI",
        method: "GET",
        success: function (user) {
            updateHeader(user);
        },
        error: function () {
            // Если сервер не отвечает — выводим гостя
            updateHeader({ authenticated: false });
        }
    });

});

// ---------------------
// ФУНКЦИЯ ПОСТРОЙКИ ШАПКИ
// ---------------------
function updateHeader(user) {
    const box1 = $("#visits");
    const box = $("#user-buttons");
    const drop= $("#drop");
    const Addrequest = $("#AddRequests");
    box.empty(); // очищаем
    box1.empty();

    // НЕ авторизован
    if (!user.authenticated) {
        drop.append(`
            <button class="btn" onclick="location.href='Pages/auth.html'">Войти</button>
        `);
        $('#dropbtn').addClass('hidden');
        return;
    }

    // ОБЫЧНЫЙ ПОЛЬЗОВАТЕЛЬ
    box.append(`
        <button class="btn" onclick="location.href='Pages/Cabinet.html'">Личный кабинет</button>
    `);
    
    Addrequest.append (`
        <div class="center"><button class="btn" id="addRequest" onclick="location.href='Pages/Addnews.html'">Оставить запрос</button></div>
    `);
        
    box1.append("Посещения: " + user.visits);

    // МОДЕРАТОР
    if (user.role === "moder" || user.role === "moder") {
        box.append(`
            <button class="btn" onclick="location.href='Pages/Addnews.html'">Добавить новость</button>
            <button class="btn" onclick="location.href='validation.html'">Проверить запросы</button>
        `);
    }

    // АДМИН
    if (user.role === "admin") {
        box.append(`
            <button class="btn" onclick="location.href='Pages/UsersControl.html'">Управление пользователями</button>
            <button class="btn" onclick="location.href='Pages/Addnews.html'">Добавить новость</button>
            <button class="btn" onclick="location.href='Pages/validation.html'">Проверить запросы</button>
        `);
    }
    
    box.append(`
        <button class="btn" onclick="logout()">Выход</button>
    `);
}

// ---------------------
// ВЫХОД ИЗ АККАУНТА
// ---------------------
function logout() {
    $.ajax({
        url: "/api/auth/logout",
        method: "POST",
        success: function () {
            location.href = "index.html";
        }
    });
}

//Серверное время
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