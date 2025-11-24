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
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    // ---------- Регистрация ----------
    public UserDto register(
            String email,
            String fullName,
            String birthDate,
            String password,
            MultipartFile avatar,
            HttpSession session
    ) {
        if (userRepository.existsByEmail(email))
            throw new RuntimeException("Пользователь с таким Email уже существует");
        if (userRepository.existsByFullName(fullName))
            throw new RuntimeException("Пользователь с таким ФИО уже существует");

        User user = new User();
        user.setEmail(email);
        user.setFullName(fullName);
        user.setBirthDate(birthDate);
        user.setPassword(password);
        user.setRole("user");
        user.setVisits(0);

        // ----- сохранение аватара -----
        if (avatar != null && !avatar.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/avatars");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(
                        avatar.getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );

                user.setAvatarPath("/uploads/avatars/" + fileName);

            } catch (Exception e) {
                throw new RuntimeException("Ошибка сохранения аватара");
            }
        }

        User saved = userRepository.save(user);

        // ---- автоматически логиним ----
        session.setAttribute("userId", saved.getId());

        return new UserDto(saved);
    }




    // ------------ Логин -------------
    public UserDto login(String email, String password) {
        User user = userRepository.findByEmail(email);

        if (user == null)
            throw new RuntimeException("Пользователь не найден");

        if (!user.getPassword().equals(password))
            throw new RuntimeException("Неверный пароль");

        // увеличиваем visits
        user.setVisits(user.getVisits() + 1);
        userRepository.save(user);

        return new UserDto(user);
    }

    // ---------- whoami ----------
    public UserDto whoAmI(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            return new UserDto(); // гость
        }

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return new UserDto(); // тоже гость
        }

        return new UserDto(user);  // авторизованный пользователь
    }
}