var fullName = "";
var currentDate = null;

$(document).ready(function () {
    $.ajax({
        url: '/api/auth/whoAmI',
        method: "GET",
        success: function(response) {
            if (!response.authenticated) {
                showAlert("Вы должны быть авторизованы под модером/админом!");
                return;
            }
            fullName = response.fullName;
            getCurrentDate();
        },
    });
});


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