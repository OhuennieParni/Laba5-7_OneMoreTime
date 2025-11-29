var newsArray = [];
var user = null;

$(document).ready( async function () {
    user = await getUserData();

    $.ajax({
        url: "/api/news",
        method: "GET",
        dataType: "JSON",
        success: function(response) {
            newsArray = response;
            showTeasers(newsArray);
        },
        error: function() {
            showAlert("Ошибка соединения с сервером!");
        }
    });
});

/**
 * Отображает список новостных тизеров на главной странице.
 *
 * - Показывает краткий текст новости (до 80 символов)
 * - Добавляет кнопку "Редактировать" для модератора/админа
 * - Навешивает обработчик клика для открытия полной новости
 * 
 * @param {type} newsArray - массив новостей, полученных с сервера
 * @returns {undefined}
 */
function showTeasers(newsArray) {
    const $newsContainer = $(".news-container").first();
    if (!newsArray || newsArray.length === 0) {
        $newsContainer.append("<p>Новостей пока нет.</p>");
        return;
    }

    const hasAccess = ["admin","moder"].includes(user.role);

    newsArray.forEach(item => {

        const shortBody = item.news_body.length > 80
            ? item.news_body.substring(0, 80) + "... Читать полностью"
            : item.news_body;

        const html = `
            <div class="news-item" data-id="${item.id}">
                <h2 class="news-title">${item.news_header}</h2>
                <p class="news-text">${shortBody}</p>
                <p></p>
                ${hasAccess ? `<button class="btn" id="editNews" data-id="${item.id}">Редактировать</button>` : ""}
            </div>
        `;

        $newsContainer.append(html);
    });

    $('.news-item').off('click').on('click', function (e) {

        if ($(e.target).closest('#editNews').length) {
            return;
        }
        if ($(e.target).closest('#deleteNews').length) {
            return;
        }
        const id = $(this).data('id');
        const news = newsArray.find(n => n.id === id);
        if (news) showModal(news, "news");
    });

    $('.news-item').on('click', '#editNews', function (e) {
        e.stopPropagation();
        const id = $(this).data('id');
        const news = newsArray.find(n => n.id === id);
        showModal(news, "edit");
    });
};

/**
 * Открывает модальное окно.
 * Типы отображения:
 *  - "news"  — просмотр новости в полном виде
 *  - "edit"  — режим редактирования (заголовок, текст, дата, автор, картинка)
 * Также подключает обработчики:
 *  - Escape для закрытия
 *  - Клик по overlay
 *  - Загрузку картинки (при редактировании)
 * 
 * @param {type} news - объект новости
 * @param {type} type - тип модального окна ("news" или "edit")
 * @returns {undefined}
 */
function showModal(news,type) {
    $('#myModal').remove();
    var modalHtml = ``;

    switch (type) {
        case ("edit") :
            modalHtml = `
                <div id="myModal" class="modal-overlay">
                    <div class="modal-content modal-edit">

                        <button class="close-btn">X</button>
                        <h2>Редактирование новости</h2>

                        <label>Заголовок:</label>
                        <input type="text" id="editHeader" value="${news.news_header}" />

                        <label>Тело новости:</label>
                        <textarea id="editBody" class="add-textarea">${news.news_body}</textarea>

                        <div class="fileInputBlock">
                            <label class="fileLabel">Картинка</label>

                            <label class="fileUploadWrapper">
                                <div class="filePreviewContainer">
                                    <img id="editFilePreview" class="filePreview hidden" 
                                        src="${news.image_path || ''}">
                                </div>

                                <span id="editFileName" class="filePlaceholder">
                                    ${news.image_path ? "Заменить изображение..." : "Выберите изображение..."}
                                </span>

                                <span class="fileBtn">Обзор</span>
                                <input type="file" id="editImage" accept=".jpg, .jpeg, .png, .webp">
                            </label>
                        </div>

                        <label>Автор:</label>
                        <input type="text" id="editAuthor" value="${news.created_by}" />

                        <label>Дата:</label>
                        <input type="text" id="editDate" value="${news.creating_date.replace(/-/g, ".")}" />

                        <button class="btn save-edit-btn" data-id="${news.id}">
                            Сохранить изменения
                        </button>
                        <button class="btn delete" id="deleteNews" data-id="${news.id}">Удалить</button>

                    </div>
                </div>
            `;

            $('body').on('change', '#editImage', function () {
                const file = this.files[0];
                const $fileName = $('#editFileName');
                const $filePreview = $('#editFilePreview');

                if (!file) {
                    $fileName.text("Выберите изображение...");
                    $filePreview.addClass('hidden').attr("src", "");
                    return;
                }

                $fileName.text(file.name);

                const reader = new FileReader();
                reader.onload = e => {
                    $filePreview.attr("src", e.target.result).removeClass('hidden');
                };
                reader.readAsDataURL(file);
            });
            break;
        case ("news") :
            modalHtml = `
                <div id="myModal" class="modal-overlay">
                    <div class="modal-content">
                        <button class="close-btn">X</button>
                        <h2>${news.news_header}</h2>
                        <p>${news.news_body.replace(/\n/g, "<br>")}</p>
                        ${news.image_path ? `<img src="${news.image_path}" alt="">` : ''}
                        <p>${news.created_by}</p>
                        <p>${news.creating_date.replace(/-/g, ".")}</p>
                    </div>
                </div>
            `;
            break;
    }
    

    $('body').append(modalHtml);

    setTimeout(() => $('#myModal').addClass('show'), 10);

    $('#myModal').on('click', function(e) {
        if ($(e.target).is('#myModal, .close-btn')) {
            closeModal();
        }
    });

    $(document).off('keyup.modal').on('keyup.modal', function (e) {
        if (e.key === "Escape") {
            closeModal();
        }
    });
}

/**
 * Сохраняет изменения новости.
 * Собирает FormData:
 *  - id
 *  - news_header
 *  - news_body
 *  - creating_date
 *  - created_by
 *  - image (опционально)
 * Отправляет POST запрос на /api/news/update.
 */
$('body').on('click', '.save-edit-btn', function () {
    const id = $(this).data('id');
    const header = $('#editHeader').val();
    const body = $('#editBody').val();
    const author = $('#editAuthor').val();
    const date = $('#editDate').val();
    const image = $('#editImage')[0].files[0] ?? null;

    const form = new FormData();
    form.append("id",id);
    form.append("news_header", header);
    form.append("news_body", body);
    form.append("creating_date", date);
    form.append("created_by", author);
    if (image) {
        form.append("image", image);
    };

    $.ajax({
        url: "/api/news/update",
        method: "POST",
        data: form,
        contentType: false,
        processData: false,
        success: function (response) {
            closeModal();
            showSuccess("Новость обновлена!");
            setTimeout(() => location.reload(), 500);
        },
        error: function (error) {
            showAlert(error.responseJSON?.error ?? "Ошибка");
        }
    });

});

/**
 * Закрывает текущее модальное окно.
 * Добавляет небольшую задержку для анимации исчезновения.
 * 
 * @returns {undefined}
 */
function closeModal() {
    $('#myModal').removeClass('show');
    setTimeout(() => $('#myModal').remove(), 300);
}

/**
 * Получает информацию о текущем пользователе.
 * 
 * @returns {jqXHR} - данные о пользователе
 */
window.getUserData = async function () {
    return await $.ajax({
        url: "/api/auth/whoAmI",
        method: "GET",
        dataType: "JSON"
    });
};

/**
 * Удаляет новость по ID.
 * Отправляет POST на /api/news/remove.
 * Удаляет новость из DOM и newsArray.
 */
$('body').on('click', '.delete', function () {
    const id = $(this).data('id');
    $.ajax({
        url: "/api/news/remove",
        method: "POST",
        data: { id: id },
        success: function (response) {
            showSuccess("Новость удалена!");
            $(`.news-item[data-id="${id}"]`).remove();
            newsArray = newsArray.filter(n => n.id !== id);
            closeModal();
        },
        error: function (error) {
            showAlert("Ошибка");
        }
    });
});
