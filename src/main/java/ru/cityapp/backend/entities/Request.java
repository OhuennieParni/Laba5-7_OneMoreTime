package ru.cityapp.backend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Сущность Request — пользовательская заявка (обращение).
 */
@Data
@Entity
@Table(name = "requests")
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // автор заявки
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String status;

    private String imagePath;

    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    /**
     * Автоматически вызывается при создании записи
     * Устанавливает:
     *  - дату создания;
     *  - дату обновления;
     *  - статус "pending" по умолчанию.
     */
    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        updated_at = LocalDateTime.now();
        if (status == null) status = "pending";
    }

    /**
     * Автоматически вызывается при обновлении записи.
     * Обновляет поле updated_at.
     */
    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

    /**
     * Форматированная дата создания для фронтенда.
     * Пример: "14.02.25 18:41"
     * @return - строка с датой создания
     */
    @JsonProperty("createdAtFormatted")
    public String getCreatedAtFormatted() {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd.MM.yy HH:mm");
        return created_at.format(f);
    }

    /**
     * Форматированная дата обновления для фронтенда.
     *
     * @return - строка с датой последнего обновления
     */
    @JsonProperty("updatedAtFormatted")
    public String getUpdatedAtFormatted() {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd.MM.yy HH:mm");
        return updated_at.format(f);
    }
}