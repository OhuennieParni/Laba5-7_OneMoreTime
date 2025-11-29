package ru.cityapp.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

/**
 * Сущность User — представляет пользователя системы.
 */
@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String password;
    private String fullName;
    private String email;
    private String birthDate;

    private int visits;
    private boolean bannedStatus;
    private String role;
    private String avatarPath;
}