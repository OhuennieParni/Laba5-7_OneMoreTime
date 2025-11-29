package ru.cityapp.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.services.ManageUsersService;
import ru.cityapp.backend.DataTransferObject.UserDto;

import java.util.List;

/**
 * Контроллер для административного управления пользователями.
 * Позволяет:
 *  - получать список всех пользователей;
 *  - редактировать данные пользователя;
 *  - блокировать/разблокировать пользователей;
 *  - удалять пользователей.
 * Все операции должны выполняться администратором (проверка прав в сервисе).
 */
@RestController
@RequestMapping("/api/manageUsers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ManageUsersController {

    private final ManageUsersService manageUsersService;

    /**
     * Возвращает список всех пользователей в кратком виде (UserDto).
     *
     * @return - список всех пользователей
     */
    @GetMapping
    public List<UserDto> getAllUsers() {
        return manageUsersService.getAllUsers();
    }

    /**
     * Редактирует данные существующего пользователя.
     *
     * @param id - id пользователя
     * @param fullName - новое ФИО
     * @param email - новая электронная почта
     * @param birthDate - новая дата рождения
     * @param role - новая роль
     * @param avatar - новый файл аватара (необязательно)
     * @return - обновленный UserDTO
     */
    @PostMapping("/editUser")
    public UserDto editUser(@RequestParam("id") long id,
                            @RequestParam("fullName") String fullName,
                            @RequestParam("email") String email,
                            @RequestParam("birthDate") String birthDate,
                            @RequestParam("role") String role,
                            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {

        return manageUsersService.editUser(id, fullName, email, birthDate, role, avatar);
    }

    /**
     * Блокирует или разблокирует пользователя
     *
     * @param id - id пользователя
     * @param bannedStatus - true — заблокировать; false — снять блокировку
     * @param role - роль отправителя запроса
     * @return - обновлённый UserDto
     */
    @PostMapping("/banUser")
    public UserDto banUser(@RequestParam("id") Long id,
                                    @RequestParam("bannedStatus") boolean bannedStatus,
                                    @RequestParam("role") String role) {
        return manageUsersService.banUser(id,bannedStatus,role);
    }

    /**
     * удаляет пользователя по id
     * @param id - id пользователя
     */
    @PostMapping("/delete")
    public void deleteUser(@RequestParam("id") Long id){
        manageUsersService.deleteUser(id);
    }
}
