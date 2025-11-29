var fullName = "";
var currentDate = null;

/**
 * Проверяет авторизацию пользователя и его роль.
 * Если пользователь не авторизован или не имеет роли moder/admin,
 * выполняется перенаправление на страницу авторизации.
 */
$(document).ready(function () {
    $.ajax({
        url: '/api/auth/whoAmI',
        method: "GET",
        success: function(response) {
                        
            if (!response.authenticated) {
                // если как-то попал неавторизованный — отправляем обратно
                window.location.href = "auth.html";
                return;
            }

             if (!response.role === "moder" || !response.role === "admin") {
                // если как-то попал неавторизованный — отправляем обратно
                window.location.href = "auth.html";
                return;
            }
            
            fullName = response.fullName;
            getCurrentDate();
        }
    });
});

/**
 * Получает текущую серверную дату, чтобы не зависеть от локального времени
 * пользователя, форматирует её в YYYY.MM.DD и сохраняет в переменную currentDate.
 */
function getCurrentDate() {
    $.ajax({
        url: "/api/getServerDate",
        method: "GET",
        success: function (response) {
            const d = new Date(response.date);
            currentDate =
                d.getFullYear() + "." +
                String(d.getMonth() + 1).padStart(2, '0') + "." +
                String(d.getDate()).padStart(2, '0');
        },
        error: function () {
            showAlert("Нет связи с сервером!");
        }
    });
}

/**
 * Обработчик создания новости.
 * Выполняет:
 *  - валидацию полей,
 *  - проверку размера и наличия изображения,
 *  - формирование FormData,
 *  - отправку данных на сервер через AJAX.
 * Используется FormData, поэтому отключены contentType и processData.
 */
$("#addRequest").on("click", function () {
        $("#errorContainer").empty();

        const title = $("#title").val().trim();
        const newsText = $("#newsText").val().trim();
        const imageFile = $("#RequestImage")[0].files[0];

        if (!title) {
            showAlert("Введите заголовок новости!");
            return;
        }
        if (!newsText) {
            showAlert("Введите текст новости!");
            return;
        }
        if (newsText.length < 10) {
            showAlert("Текст новости слишком короткий (минимум 10 символов)");
            return;
        }

        const formData = new FormData();
        formData.append("news_header", title);
        formData.append("news_body", newsText);
        formData.append("creating_date", currentDate);
        formData.append("created_by", fullName);

        if (imageFile) {
            if (imageFile.size > 5 * 1024 * 1024) {
                showAlert("Изображение слишком большое (макс. 5 МБ)");
                return;
            }
            formData.append("image", imageFile);
        }
        $.ajax({
            url: "/api/news/addNews",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false, 
            success: function (response) {
                showSuccess("Новость успешно добавлена!");
                window.location.href = "../index.html";
            },
            error: function () {
                showAlert("Ошибка при добавлении новости");
            }
        });
    });