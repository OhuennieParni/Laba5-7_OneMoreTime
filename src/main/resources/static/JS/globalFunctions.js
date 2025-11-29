/**
 * Получает данные текущего авторизованного пользователя.
 * @returns {jqXHR} Данные о пользователе в виде JSON
 */
window.getUserData = async function () {
    return await $.ajax({
        url: "/api/auth/whoAmI",
        method: "GET",
        dataType: "JSON"
    });
};