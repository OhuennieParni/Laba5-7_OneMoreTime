package ru.cityapp.backend.services;

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
import java.util.List;
import java.util.UUID;

/**
 * Сервис управления пользователями.
 * Предоставляет функциональность:
 *  - получение списка всех пользователей;
 *  - редактирование данных пользователя;
 *  - загрузку и замену аватара;
 *  - удаление старого аватара при замене;
 *  - блокировку и разблокировку;
 *  - удаление пользователя.
 */
@Service
public class ManageUsersService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Возвращает список всех пользователей, отсортированный по ID.
     *
     * @return - список DTO пользователей
     */
    public List<UserDto> getAllUsers() {
        return userRepository.findAllByOrderById().stream()
                .map(UserDto::new)
                .toList();
    }

    /**
     * Редактирует данные пользователя.
     *
     * @param id - id пользователя
     * @param fullName - новое ФИО
     * @param email - новая почта
     * @param birthDate - новая дата рождения
     * @param role - новая роль
     * @param avatar - новый аватар (не обязательно)
     * @return - обновлённый UserDto
     */
    public UserDto editUser(long id, String fullName, String email, String birthDate, String role, MultipartFile avatar) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден с id = " + id));

        user.setFullName(fullName);
        user.setEmail(email);
        user.setBirthDate(birthDate);
        user.setRole(role);

        if (avatar != null && !avatar.isEmpty()) {
            deleteOldAvatar(user);

            try {
                String fileName = UUID.randomUUID() + "_" + avatar.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/avatars");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path targetPath = uploadPath.resolve(fileName);
                Files.copy(avatar.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                user.setAvatarPath("/avatars/" + fileName);

            } catch (Exception ex) {
                throw new RuntimeException("Ошибка сохранения аватара: " + ex.getMessage());
            }
        }

        User saved = userRepository.save(user);
        return new UserDto(saved);
    }

    /**
     * Удаляет старый аватар пользователя из файловой системы.
     * Используется при обновлении аватара.
     *
     * @param user пользователь, чей аватар нужно удалить
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

    /**
     * Блокирует или разблокирует пользователя.
     * только admin может банить.
     *
     * @param id - id пользователя
     * @param bannedStatus - новый статус блокировки
     * @param role - роль вызывающего
     * @return - обновлённый UserDto
     */
    public UserDto banUser(Long id, boolean bannedStatus, String role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден с id = " + id));

        if (!"admin".equals(role)) {
            throw new RuntimeException("Нет прав для бана");
        }

        user.setBannedStatus(bannedStatus);

        User saved = userRepository.save(user);
        return new UserDto(saved);
    }

    /**
     * Удаляет пользователя из базы данных.
     * @param id - id удаляемого пользователя
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}