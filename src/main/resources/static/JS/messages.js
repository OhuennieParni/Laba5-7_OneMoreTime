/**
 * Показывает всплывающее сообщение об ошибке.
 * Создаёт контейнер #messageContainer при необходимости.
 * Сообщение автоматически исчезает через 5 секунд.
 * 
 * @param {type} message - текст ошибки
 * @returns {undefined}
 */
window.showAlert = function (message) {

    let container = $("#messageContainer");
    if (container.length === 0) {
        $("body").append('<div id="messageContainer"></div>');
        container = $("#messageContainer");
    }

    const error = $('<div class="errorAlert"></div>').text(message);
    container.append(error);

    setTimeout(() => {
        error.fadeOut(500, () => error.remove());
    }, 5000);
};

/**
 * Показывает всплывающее сообщение об успешном действии.
 * Добавляет элемент в #messageContainer или #errorContainer.
 * Сообщение автоматически исчезает через 5 секунд.
 * 
 * @param {type} message - текст сообщения
 * @returns {undefined}
 */
window.showSuccess = function (message) {
    const success = $('<div class="successAlert"></div>').text(message);
    $('#messageContainer, #errorContainer').append(success);

    setTimeout(() => {
        success.fadeOut(500, () => success.remove());
    }, 5000);
};
