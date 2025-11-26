package ru.cityapp.backend.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "news")
public class News {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String news_header;
    private String news_body;
    private String creating_date;
    private String created_by;
    private String image_path;
}
