package ru.cityapp.backend.entities;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

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

    @PrePersist
    protected void onCreate() {
        created_at = LocalDateTime.now();
        updated_at = LocalDateTime.now();
        if (status == null) status = "pending";
    }

    @PreUpdate
    protected void onUpdate() {
        updated_at = LocalDateTime.now();
    }

    @JsonProperty("createdAtFormatted")
    public String getCreatedAtFormatted() {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd.MM.yy HH:mm");
        return created_at.format(f);
    }

    @JsonProperty("updatedAtFormatted")
    public String getUpdatedAtFormatted() {
        DateTimeFormatter f = DateTimeFormatter.ofPattern("dd.MM.yy HH:mm");
        return updated_at.format(f);
    }
}