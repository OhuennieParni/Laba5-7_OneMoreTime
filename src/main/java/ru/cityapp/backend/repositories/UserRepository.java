package ru.cityapp.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.cityapp.backend.entities.User;

// JpaRepository<КлассEntity, ТипPrimaryKey>
public interface UserRepository extends JpaRepository<User, Long> {

    // поиск по email
    User findByEmail(String email);
    User findByFullName(String fullName);

    // проверка существования email
    boolean existsByEmail(String email);
    boolean existsByFullName(String fullName);
}