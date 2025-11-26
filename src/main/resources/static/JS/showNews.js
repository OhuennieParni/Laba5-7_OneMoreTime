var newsArray = [];

$(document).ready(function () {
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

function showTeasers(newsArray) {
    const $newsContainer = $(".news-container").first();
    $newsContainer.empty();

    if (!newsArray || newsArray.length === 0) {
        $newsContainer.append("<p>Новостей пока нет.</p>");
        return;
    }

    newsArray.forEach(item => {

        const shortBody = item.news_body.length > 80
            ? item.news_body.substring(0, 80) + "... Читать полностью"
            : item.news_body;

        const html = `
            <div class="news-item" data-id="${item.id}">
                <h2 class="news-title">${item.news_header}</h2>
                <p class="news-text">${shortBody}</p>

            </div>
        `;

        $newsContainer.append(html);
    });

    $('.news-item').off('click').on('click', function () {
        const id = $(this).data('id');
        const news = newsArray.find(n => n.id == id);
        if (news) showModal(news);
    });
}

function showModal(news) {
    $('#myModal').remove();

    const modalHtml = `
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

function closeModal() {
    $('#myModal').removeClass('show');
    setTimeout(() => $('#myModal').remove(), 300);
}
