package ru.cityapp.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.cityapp.backend.entities.Request;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {

    // все запросы, одобренные модератором
    List<Request> findByStatus(String status);

    // запросы конкретного пользователя
    List<Request> findByUserId(Long userId);
}
