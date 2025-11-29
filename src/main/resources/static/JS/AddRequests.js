$(document).ready(function () {

    $.ajax({
        url: "/api/auth/whoAmI",
        method: "GET",
        success: function (user) {

            if (!user.authenticated) {
                // если как-то попал неавторизованный — отправляем обратно
                window.location.href = "auth.html";
                return;
            }
        },
        error: function () {
            window.location.href = "../index.html";
        }
    });

});

$("#addRequest").on("click", function () {
    const title = $("#title").val().trim();
    const description = $("#newsText").val().trim();
    const image = $("#RequestImage")[0].files[0];


    if(title === "") {
        showAlert("Заполните поле заголовка, пожалуйста!");
        return;
    }
    
    if(description === "") {
        showAlert("Заполните текст заявки, пожалуйста!");
        return;
    }

    if (image) {

        if (image.size > 30 * 1024 * 1024) {
            showAlert("Размер аватара не должен превышать 30 МБ");
            return;
        }

        const validTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(image.type)) {
            showAlert("Разрешены только JPG, PNG или WEBP");
            return;
        }
    }

    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    if (image)
        form.append("image", image);

    $.ajax({
        url: "/api/requests/AddRequest",
        method: "POST",
        data: form,
        contentType: false,
        processData: false,
        success: function (res) {
            window.location.href = "../index.html";
        },
        error: function (xhr) {
            showAlert(xhr.responseJSON?.error ?? "Ошибка");
        }
    });
});