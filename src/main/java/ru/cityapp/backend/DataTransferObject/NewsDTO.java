package ru.cityapp.backend.DataTransferObject;

import lombok.Data;
import ru.cityapp.backend.entities.News;

/**
 * DTO (Data Transfer Object) для передачи данных о новости на клиент.
 */
@Data
public class NewsDTO {
    private Long id;
    private String news_header;
    private String news_body;
    private String creating_date;
    private String created_by;
    private String image_path;

    public NewsDTO(News n) {
        this.id = n.getId();
        this.news_header=n.getNews_header();
        this.news_body = n.getNews_body();
        this.creating_date=n.getCreating_date();
        this.created_by=n.getCreated_by();
        this.image_path=n.getImage_path();
    }
}
