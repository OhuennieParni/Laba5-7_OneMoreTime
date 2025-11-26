window.showAlert = function(message) {
    const error = $('<div class="errorAlert"></div>').text(message);
    $('#messageContainer').append(error);

    setTimeout(() => {
        error.fadeOut(500, function () {
            $(this).remove();
        });
    }, 5000);
}

window.showSuccess = function(message) {
    const success = $('<div class="successAlert"></div>').text(message);
    $('#messageContainer').append(success);

    setTimeout(() => {
        success.fadeOut(500, function () {
            $(this).remove();
        });
    }, 5000);
}