package ru.cityapp.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.cityapp.backend.entities.Request;

import java.util.List;

public interface RequestRepository extends JpaRepository<Request, Long> {

    // все запросы, одобренные модератором
    List<Request> findByStatus(String status);

    // запросы конкретного пользователя
    List<Request> findByUserId(Long userId);

    //Сортировка по дате добавления
    @Query("SELECT r FROM Request r WHERE r.status IN :statuses ORDER BY r.created_at DESC")
    List<Request> findApprovedSorted(List<String> statuses);
}
