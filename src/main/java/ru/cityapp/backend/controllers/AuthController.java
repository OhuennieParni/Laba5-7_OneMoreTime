package ru.cityapp.backend.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.UserDto;
import ru.cityapp.backend.entities.User;
import ru.cityapp.backend.services.AuthService;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleError(RuntimeException ex) {
        return Map.of("error", ex.getMessage());
    }

    @Autowired
    private AuthService authService;

    // -----------------------------
    //       РЕГИСТРАЦИЯ
    // -----------------------------
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserDto register(
            @RequestParam("email") String email,
            @RequestParam("fullName") String fullName,
            @RequestParam("birthDate") String birthDate,
            @RequestParam("password") String password,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            HttpSession session
    ) {
        return authService.register(email, fullName, birthDate, password, avatar, session);
    }


    // -----------------------------
    //          ЛОГИН
    // -----------------------------
    @PostMapping("/login")
    public UserDto login(@RequestBody User loginData, HttpSession session) {

        UserDto dto = authService.login(loginData.getEmail(), loginData.getPassword());

        // если вошёл успешно — сохраняем userId в сессию
        session.setAttribute("userId", dto.getId());

        return dto;
    }

    // -----------------------------
    //      ПРОВЕРКА СЕССИИ
    // -----------------------------
    @GetMapping("/whoAmI")
    public UserDto whoAmI(HttpSession session) {
        return authService.whoAmI(session);
    }

    // -----------------------------
    //           ВЫХОД
    // -----------------------------
    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }
}