package ru.cityapp.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.cityapp.backend.entities.News;

import java.util.List;

/**
 * Репозиторий для работы с сущностью News.
 * Предоставляет стандартные CRUD-операции через JpaRepository,
 * а также содержит дополнительный метод для получения новостей
 * в порядке убывания ID (от новых к старым).
 */
public interface NewsRepository extends JpaRepository<News, Long> {
    /**
     * Возвращает все новости, отсортированные по ID в порядке убывания.
     *
     * @return - список новостей, отсортированных DESC
     */
    List<News> findAllByOrderByIdDesc();
}
