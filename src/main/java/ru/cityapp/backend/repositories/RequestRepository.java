package ru.cityapp.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ru.cityapp.backend.entities.Request;

import java.util.List;

/**
 * Репозиторий для работы с сущностью Request.
 * Предоставляет стандартные CRUD-операции через JpaRepository,
 * а также несколько дополнительных методов для выборки заявок по статусу,
 * пользователю и сортировке.
 */
public interface RequestRepository extends JpaRepository<Request, Long> {

    /**
     * Возвращает все заявки с указанным статусом.
     *
     * @param status - статус заявки
     * @return - список заявок с заданным статусом
     */
    List<Request> findByStatus(String status);

    /**
     *  Возвращает все заявки, созданные конкретным пользователем.
     *
     * @param userId - ID пользователя
     * @return - список заявок пользователя
     */
    List<Request> findByUserId(Long userId);

    /**
     * Возвращает отсортированные по дате создания заявки,
     *
     * @param statuses - список интересующих статусов
     * @return - отсортированный список заявок
     */
    @Query("SELECT r FROM Request r WHERE r.status IN :statuses ORDER BY r.created_at DESC")
    List<Request> findApprovedSorted(List<String> statuses);
}
