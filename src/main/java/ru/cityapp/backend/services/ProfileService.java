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

/**
 * Сервис, отвечающий за работу с профилем текущего пользователя.
 * Реализует:
 *  - получение данных авторизованного пользователя;
 *  - изменение личной информации (ФИО, email, дата рождения);
 *  - обновление аватара с удалением старого файла;
 *  - проверку уникальности email и ФИО;
 *  - проверку авторизации через HttpSession.
 */
@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Возвращает данные профиля текущего авторизованного пользователя.
     *
     * @param session - текущая HTTP-сессия
     * @return - объект UserDto, содержащий публичные данные пользователя
     */
    public UserDto getProfile(HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");

        if (userId == null) {
            throw new RuntimeException("Вы не авторизованы");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        return new UserDto(user);
    }

    /**
     * Обновляет профиль текущего пользователя.
     *
     * @param session - текущая HTTP-сессия (для userId)
     * @param fullName - новое ФИО
     * @param email - новая почта
     * @param birthDate - новая дата рождения
     * @param avatar - новый файл-аватар (не обязательно)
     * @return обновлённые данные пользователя в формате DTO
     */
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

        user.setFullName(fullName);
        user.setEmail(email);
        user.setBirthDate(birthDate);

        if (avatar != null && !avatar.isEmpty()) {

            deleteOldAvatar(user);

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

    /**
     * Функция, удаляющая старый аватар пользователя из хранилища сервера
     * @param user - объект пользователя
     */
    private void deleteOldAvatar(User user) {

        String oldPath = user.getAvatarPath();

        if (oldPath == null) return;

        Path filePath = Paths.get("uploads").resolve(oldPath.replace("/avatars/", "avatars/"));

        try {
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("Старая аватарка удалена: " + filePath);
            }
        } catch (Exception e) {
            System.out.println("Не удалось удалить старый аватар: " + filePath);
        }
    }
}
