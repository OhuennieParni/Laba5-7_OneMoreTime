$(document).ready(function () {
    $.ajax({
        url: "/api/auth/whoAmI",
        method: "GET",
        success: function (user) {
            
            if (!user.authenticated) {
                window.location.href = "auth.html";
                return;
            }

            if (!user.role === "moder" || !user.role === "admin") {
                window.location.href = "auth.html";
                return;
            }
        },
        error: function () {
            window.location.href = "../index.html";
        }
    });
    
     $.ajax({
        url: "/api/requests/pending",
        method: "GET",
        success: function (requests) {
            renderRequests(requests);
        }
    });

});

/**
 * Обрезает текст до заданного количества слов.
 * Используется для формирования краткого превью в карточках заявок.
 * 
 * @param {type} text - исходный текст
 * @param {type} count - сколько слов оставить
 * @returns {String} - сокращенный текст или полный, если слов меньше, чем лимит
 */
function trimWords(text, count = 8) {
    const parts = text.split(" ");
    return parts.length <= count
        ? text
        : parts.slice(0, count).join(" ") + "...";
}

/**
 * Отрисовывает список заявок и формирует интерактивные карточки.
 * Для каждой заявки:
 *  - показывает краткий и полный текст;
 *  - отображает изображение (скрыто по умолчанию);
 *  - выводит автора, даты создания/обновления и статус;
 *  - добавляет кнопки действий (Принять/Отклонить/Выполнено) в зависимости от статуса;
 *  - подключает обработчики смены статуса и удаления;
 *  - включает поведение "раскрыть/свернуть" по клику на карточку.
 *  
 * @param {type} list - массив заявок
 * @returns {undefined}
 */
function renderRequests(list) {
    const box = $("#requestsList");
    box.empty();

    list.forEach(r => {
        if (r.status === "done") return;

        let buttonsHtml = "";

        if (r.status === "pending") {
            buttonsHtml = `
                <button class="btn" id="approve">Принять</button>
                <button class="btn" id="reject"">Отклонить</button>
            `;
        } 
        else if (r.status === "approved") {
            buttonsHtml = `
                <button class="btn" id="done">Выполнено</button>
            `;
        }

        const card = $(`
            <div class="request-card">
                <h2 class="request-title">${r.title}</h2>

                <p class="request-preview">${trimWords(r.description)}</p>
                <p class="request-full" style="display:none">${r.description}</p>

                <img class="request-image" src="${r.imagePath ?? ""}" style="display:none">

                <p class="request-author">Автор: ${r.user?.fullName ?? "Неизвестно"}</p>
                <p class="request-addData">Дата добавления: ${r.created_at}</p>
                <p class="request-UpData">Дата последнего обновления: ${r.updated_at}</p>
                <p class="request-status">Статус: ${r.status}</p>

                <div class="request-buttons">
                    ${buttonsHtml}
                </div>
            </div>
        `);
        
        card.on("click", function () {  
            $(this).find(".request-preview").toggle();
            $(this).find(".request-full").toggle();
            $(this).find(".request-image").toggle();
        });
        
        card.find("#approve").on("click", function (event) {
            $.post("/api/requests/setStatus", {
                id: r.id,
                status: "approved"
            }, function () {
                card.fadeOut(300, () => card.remove());
            });
            event.stopPropagation();
        });

        card.find("#reject").on("click", function (event) {
            $.ajax({
                url: "/api/requests/delete/" + r.id,
                method: "DELETE",
                success: function () {
                    card.fadeOut(300, () => card.remove());
                }
            });
            event.stopPropagation();
        });

        card.find("#done").on("click", function (event) {
            $.post("/api/requests/setStatus", {
                id: r.id,
                status: "done"
            }, function () {
                card.fadeOut(300, () => card.remove());
            });
            event.stopPropagation();
        });


        card.find("button").on("click", function (e) { e.stopPropagation(); });

        box.append(card);
    });
}
