package ru.cityapp.backend.DataTransferObject;

import lombok.Data;
import ru.cityapp.backend.entities.User;

@Data
public class UserDto {
    private boolean authenticated;
    private Long id;
    private String fullName;
    private String email;
    private int visits;
    private String role;
    private String avatarUrl;
    private String birthdate;

    // ✔ Конструктор для авторизованного пользователя
    public UserDto(User u) {
        this.authenticated = true;
        this.id = u.getId();
        this.fullName = u.getFullName();
        this.email = u.getEmail();
        this.visits = u.getVisits();
        this.role = u.getRole();
        this.avatarUrl = u.getAvatarPath();
        this.birthdate = u.getBirthDate();
    }

    // ✔ Конструктор для гостя
    public UserDto() {
        this.authenticated = false;
        this.id = null;
        this.fullName = null;
        this.email = null;
        this.visits = 0;
        this.role = "guest";
    }
}