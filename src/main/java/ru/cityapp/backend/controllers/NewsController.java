package ru.cityapp.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.NewsDTO;
import ru.cityapp.backend.services.NewsService;

import java.util.List;

/**
 * Контроллер для работы с новостями.
 * Предоставляет API для:
 *  - получения списка всех новостей;
 *  - добавления новой новости;
 *  - обновления существующей новости
 * Файлы изображений передаются через Multipart.
 */
@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    /**
     * Возвращает список всех новостей
     *
     * @return - список всех новостей в формате DTO
     */
    @GetMapping
    public List<NewsDTO> getAllNews() {
        return newsService.getAllNews();
    }

    /**
     * Добавляет новую новость
     *
     * @param news_header - заголовок новости
     * @param news_body - основной текст новости
     * @param creating_date - дата создания
     * @param created_by - автор
     * @param image - Изображение к новости (не обязательно)
     *
     * @return - список новостей после добавления
     */
    @PostMapping("/addNews")
    public List<NewsDTO> addNews(@RequestParam("news_header") String news_header,
                                 @RequestParam("news_body") String news_body,
                                 @RequestParam("creating_date") String creating_date,
                                 @RequestParam("created_by") String created_by,
                                 @RequestParam(value = "image", required = false) MultipartFile image) {
        return newsService.addNews(news_header,news_body,creating_date,created_by,image);
    }

    /**
     * Обновляет существующую новость по её ID.
     *
     * @param id - id новости
     * @param news_header - новый заголовок
     * @param news_body - новый текст новости
     * @param creating_date - новая дата создания
     * @param created_by - новый автор
     * @param image - новое изображение (не обязательно)
     * @return - список новостей после обновления
     */
    @PostMapping("/update")
    public List<NewsDTO> updateNews(@RequestParam("id") long id,
                                    @RequestParam("news_header") String news_header,
                                    @RequestParam("news_body") String news_body,
                                    @RequestParam("creating_date") String creating_date,
                                    @RequestParam("created_by") String created_by,
                                    @RequestParam(value = "image", required = false) MultipartFile image) {
        return newsService.updateNews(id,news_header,news_body,creating_date,created_by,image);
    }
}
