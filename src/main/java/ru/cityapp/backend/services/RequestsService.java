package ru.cityapp.backend.services;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.entities.Request;
import ru.cityapp.backend.entities.User;
import ru.cityapp.backend.repositories.RequestRepository;
import ru.cityapp.backend.repositories.UserRepository;

import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class RequestsService {

    @Autowired
    private RequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    public Request addRequest(String title,
                              String description,
                              MultipartFile image,
                              HttpSession session) {

        Long userId = (Long) session.getAttribute("userId");
        if (userId == null)
            throw new RuntimeException("Вы не авторизованы");

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Request r = new Request();
        r.setUser(user);
        r.setTitle(title);
        r.setDescription(description);
        r.setStatus("pending");

        // ---------- Сохранение картинки ----------
        if (image != null && !image.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();

                Path uploadPath = Paths.get("uploads/requests");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(
                        image.getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );

                r.setImagePath("/requests/" + fileName);

            } catch (Exception e) {
                throw new RuntimeException("Ошибка сохранения изображения");
            }
        }

        return requestRepository.save(r);
    }
    // -------------------------
    //   ЗАПРОСЫ НА ГЛАВНУЮ
    // -------------------------
    public List<Request> getApprovedRequests() {
        return requestRepository.findByStatus("approved");
    }

    // -------------------------
    //   ДЛЯ МОДЕРАТОРА
    // -------------------------
    public List<Request> getPendingRequests() {
        return requestRepository.findAll();
    }

    // -------------------------
    //   УТВЕРЖДЕНИЕ / ОТКЛОНЕНИЕ
    // -------------------------
    public Request updateStatus(Long id, String newStatus) {

        Request req = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Запрос не найден"));

        req.setStatus(newStatus);
        return requestRepository.save(req);
    }
}