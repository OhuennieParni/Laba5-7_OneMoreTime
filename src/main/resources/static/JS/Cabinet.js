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

            // Заполняем блоки на странице
            $("#fio").text(user.fullName);
            $("#email").text(user.email);
            $("#birth").text(user.birthdate);
            $("#visits").text(user.visits);
            $("#status").text(user.role);

            if (user.avatarUrl) {
                $("#avatar").attr("src", user.avatarUrl);
            } else {
                $("#avatar").attr("src", "../img/defaultAvatar.png");
            }
        },
        error: function () {
            window.location.href = "../index.html";
        }
    });

});

$("#editProfile").on("click", function () {
    $("#editModal").removeClass("hidden");

    // подставляем текущие данные
    $("#editEmail").val($("#email").text());
    $("#editFullName").val($("#fio").text());
    $("#editBirth").val($("#birth").text());
});

$("#saveEdit").on("click", function () {
    const fullName = $("#editFullName").val().trim();
    const email = $("#editEmail").val().trim();
    const birthDate = $("#editBirth").val().trim();
    const avatar = $("#editAvatar")[0].files[0];

    const form = new FormData();
    form.append("fullName", fullName);
    form.append("email", email);
    form.append("birthDate", birthDate);
    if (avatar) form.append("avatar", avatar);

    $.ajax({
        url: "/api/profile/update",
        method: "POST",
        data: form,
        contentType: false,
        processData: false,
        success: function (res) {
            $("#editModal").addClass("hidden");
            location.reload();
        },
        error: function (xhr) {
            showAlert(xhr.responseJSON?.error ?? "Ошибка");
        }
    });
});


$("#cancelEdit").on("click", function () {
    $("#editModal").addClass("hidden");
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