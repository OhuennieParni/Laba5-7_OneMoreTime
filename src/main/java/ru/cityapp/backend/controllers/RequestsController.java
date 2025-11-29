package ru.cityapp.backend.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.entities.Request;
import ru.cityapp.backend.services.RequestsService;

import java.util.List;

/**
 * Контроллер для работы с пользовательскими запросами (обращениями).
 * Функционал:
 *  - создание нового запроса;
 *  - получение списка подтверждённых запросов (для главной страницы);
 *  - получение списка запросов, ожидающих проверки (для модератора);
 *  - изменение статуса запроса;
 *  - удаление запроса.
 */
@RestController
@RequestMapping("/api/requests")
public class RequestsController {

    @Autowired
    private RequestsService requestService;

    /**
     * Создаёт новый пользовательский запрос.
     *
     * @param title - заголовок запроса
     * @param description - текст запроса
     * @param image - картинка к запросу (не обязательно)
     * @param session - текущая HTTP-сессия
     *
     * @return - созданный объект Request
     */
    @PostMapping(value = "/AddRequest",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Request addRequest(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            HttpSession session) {

        return requestService.addRequest(title, description, image, session);
    }

    /**
     * возвращает список всех запросов со статусом "approved".
     * Используются для отображения на главной странице.
     *
     * @return список подтверждённых запросов
     */
    @GetMapping("/approved")
    public List<Request> getApproved() {
        return requestService.getApprovedRequests();
    }


    /**
     * Возвращает список всех запросов со статусом "pending".
     * Используется модератором для проверки новых обращений.
     *
     * @return список необработанных запросов
     */
    @GetMapping("/pending")
    public List<Request> findAll() {
        return requestService.getPendingRequests();
    }

    /**
     * Обновляет статус запроса.
     *
     * @param id - id запроса
     * @param status - статус запроса (pending, approved, done)
     *
     * @return - обновлённый объект Request
     */
    @PostMapping("/setStatus")
    public Request setStatus(
            @RequestParam("id") Long id,
            @RequestParam("status") String status
    ) {
        return requestService.updateStatus(id, status);
    }

    /**
     * Удаляет запрос по указанному ID.
     *
     * @param id - id удаляемого запроса
     */
    @DeleteMapping("/delete/{id}")
    public void deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
    }
}