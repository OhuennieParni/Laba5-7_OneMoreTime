package ru.cityapp.backend.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.UserDto;
import ru.cityapp.backend.services.ProfileService;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleError(RuntimeException ex) {
        return Map.of("error", ex.getMessage());
    }

    @Autowired
    private ProfileService profileService;

    // ---- получить данные профиля ----
    @GetMapping
    public UserDto getProfile(HttpSession session) {
        return profileService.getProfile(session);
    }

    // ---- обновить профиль ----
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
