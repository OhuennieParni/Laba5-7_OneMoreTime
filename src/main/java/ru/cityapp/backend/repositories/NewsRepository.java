package ru.cityapp.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.cityapp.backend.entities.News;

import java.util.List;

public interface NewsRepository extends JpaRepository<News, Long> {
    List<News> findAllByOrderByIdDesc();
}
