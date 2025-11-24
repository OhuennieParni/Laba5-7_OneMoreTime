package ru.cityapp.backend.services;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.UserDto;
import ru.cityapp.backend.entities.User;
import ru.cityapp.backend.repositories.UserRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    public UserDto getProfile(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            throw new RuntimeException("Вы не авторизованы");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        return new UserDto(user);
    }

    public UserDto updateProfile(HttpSession session,
                                 String fullName,
                                 String email,
                                 String birthDate,
                                 MultipartFile avatar) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            throw new RuntimeException("Вы не авторизованы");

        User existingEmail = userRepository.findByEmail(email);
        if (existingEmail != null && !existingEmail.getId().equals(userId)) {
            throw new RuntimeException("Пользователь с таким Email уже существует");
        }

        User existingFullName = userRepository.findByFullName(fullName);
        if (existingFullName != null && !existingFullName.getId().equals(userId)) {
            throw new RuntimeException("Пользователь с таким ФИО уже существует");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        // --- обновление текстовых данных ---
        user.setFullName(fullName);
        user.setEmail(email);
        user.setBirthDate(birthDate);

        // --- обновление аватара ---
        if (avatar != null && !avatar.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/avatars");

                if (!Files.exists(uploadPath))
                    Files.createDirectories(uploadPath);

                Files.copy(
                        avatar.getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );

                user.setAvatarPath("/avatars/" + fileName);

            } catch (Exception ex) {
                throw new RuntimeException("Ошибка сохранения аватара");
            }
        }

        userRepository.save(user);

        return new UserDto(user);
    }
}
