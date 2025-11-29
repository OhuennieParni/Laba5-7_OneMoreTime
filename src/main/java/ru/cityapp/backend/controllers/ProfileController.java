package ru.cityapp.backend.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.UserDto;
import ru.cityapp.backend.services.ProfileService;

import java.util.Map;

/**
 * Контроллер для работы с профилем текущего пользователя.
 * Позволяет:
 * - получить данные авторизованного пользователя;
 * - обновить профиль (ФИО, email, дату рождения, аватар).
 * Все операции привязаны к текущей HTTP-сессии.
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    /**
     * Обработка RuntimeException, возникающих в процессе работы методов контроллера.
     * Возвращает JSON вида {"error": "..."} и HTTP-статус 400.
     *
     * @param ex - выброшенное исключение
     * @return - карта с сообщением об ошибке
     */
    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleError(RuntimeException ex) {
        return Map.of("error", ex.getMessage());
    }

    @Autowired
    private ProfileService profileService;

    /**
     * Возвращает профиль текущего авторизованного пользователя.
     * Если пользователь не авторизован — сервис сам вернёт DTO с authenticated=false.
     *
     * @param session - текущая HTTP-сессия
     * @return - UserDto с информацией о пользователе
     */
    @GetMapping
    public UserDto getProfile(HttpSession session) {
        return profileService.getProfile(session);
    }

    /**
     * Обновляет данные профиля текущего пользователя.
     *
     * @param session - текущая HTTP-сессия
     * @param fullName - новое ФИО
     * @param email - новая почта
     * @param birthDate - новая дата рождения
     * @param avatar - новый аватар (необязательно)
     *
     * @return - обновленные данные профиля
     */
    @PostMapping(value = "/update", consumes = "multipart/form-data")
    public UserDto updateProfile(
            HttpSession session,
            @RequestParam("fullName") String fullName,
            @RequestParam("email") String email,
            @RequestParam("birthDate") String birthDate,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar
    ) {
        return profileService.updateProfile(session, fullName, email, birthDate, avatar);
    }
}
