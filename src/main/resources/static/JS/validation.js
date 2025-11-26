$(document).ready(function () {

    // Загружаем данные о пользователе
    $.ajax({
        url: "/api/auth/whoAmI",
        method: "GET",
        success: function (user) {
            
            if (!user.authenticated) {
                // если как-то попал неавторизованный — отправляем обратно
                window.location.href = "auth.html";
                return;
            }

            if (!user.role === "moder" || !user.role === "admin") {
                // если как-то попал неавторизованный — отправляем обратно
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

function trimWords(text, count = 8) {
    const parts = text.split(" ");
    return parts.length <= count
        ? text
        : parts.slice(0, count).join(" ") + "...";
}

function renderRequests(list) {
    const box = $("#requestsList");
    box.empty();

    list.forEach(r => {

        // ⛔ Если done — не показываем карточку
        if (r.status === "done") return;

        // ================= КНОПКИ =================
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

        // ================= КАРТОЧКА =================
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

        // ========== КЛИК ПО КАРТОЧКЕ ===============
        card.on("click", function () {  
            $(this).find(".request-preview").toggle();
            $(this).find(".request-full").toggle();
            $(this).find(".request-image").toggle();
        });
        
         // ========== ОБРАБОТКА КНОПОК ===============
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
