$(document).ready(function () {
    $.ajax({
        url: '../../BackEnd/JSON/databd.json',
        method: 'GET',
        dataType: 'json',
        success: function (data) {

            const tbody = $('#inspectionTable tbody');
            tbody.empty();

            const sorted = [...data].sort((a, b) => {
                return new Date(b.createdAt) - new Date(a.createdAt);
            });

            const seen = new Set();
            let count = 0;

            sorted.forEach((record) => {
                const key = `${record.email}|${record.date}|${record.time}|${record.specialist}|${record.complaints}|${record.comments}`;
                
                if (seen.has(key)) return;
                seen.add(key);

                const row = `
                    <tr>
                        <td>${++count}</td>
                        <td>${record.createdAt || '-'}</td>
                        <td>${record.fullName || '-'}</td>
                        <td>${record.date || '-'}</td>
                        <td>${record.time || '-'}</td>
                        <td>${record.specialist || '-'}</td>
                        <td>${record.complaints || '-'}</td>
                        <td>${record.comments || '-'}</td>
                    </tr>
                `;
                tbody.append(row);
            });
        },
        error: function () {
            showAlert("Не удалось загрузить данные из JSON");
        }
    });
});




$('#loadTable').on('click', function () {
    const path = $('#filepath').val().trim();

    $.ajax({
        url: 'load_table.php',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ path: path }),
        success: function (response) {
            $('#result').html(response.html || '<div>Нет данных</div>');
        },
        error: function () {
            $('#result').html('<div style="color:red;">Ошибка при загрузке таблицы</div>');
        }
    });
});\

$("#check").on("click", function(e) {
    e.preventDefault();

    const fileadress = $("#adress").val().trim();
    if (!fileadress) return alert("Введите путь к JSON-файлу");

    $.ajax({
        type: 'POST',
        url: 'check.php',
        dataType: 'json',
        data: JSON.stringify({ fileadress: fileadress }),
        success: function(response) {
            const result = response.message;

            if (typeof result === "string") {
                $("#error").text(result);
                return;
            }

            $("#error").text(""); // очистка ошибок
            $("#table tbody").empty(); // очистка старых данных

            result.forEach(item => {
                const row = `<tr><td>${item.number}</td><td>${item.brand}</td><td>${item.model}</td></tr>`;
                $("#table tbody").append(row);
            });
        },
        error: function() {
            $("#error").text("Ошибка запроса");
        }
    });
});


$("#check").click(e => {
    e.preventDefault();

    const fileadress = $("#adress").val().trim();

    $.post({
        url: "check.php",
        contentType: "application/json",
        data: JSON.stringify({ fileadress }),
        success: ({ message }) => {
            if (typeof message === "string") {
                $("#error").text(message);
                return;
            }

            $("#error").empty();
            const $tbody = $("#table tbody").empty();
            message.forEach(({ number, brand, model }) => {
                $tbody.append(`<tr><td>${number}</td><td>${brand}</td><td>${model}</td></tr>`);
            });
        },
        error: () => $("#error").text("Ошибка")
    });
});
