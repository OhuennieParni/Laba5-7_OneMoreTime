package ru.cityapp.backend.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.NewsDTO;
import ru.cityapp.backend.services.NewsService;

import java.util.List;

@RestController
@RequestMapping("/api/news")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @GetMapping
    public List<NewsDTO> getAllNews() {
        return newsService.getAllNews();
    }

    @PostMapping("/addNews")
    public List<NewsDTO> addNews(@RequestParam("news_header") String news_header,
                                 @RequestParam("news_body") String news_body,
                                 @RequestParam("creating_date") String creating_date,
                                 @RequestParam("created_by") String created_by,
                                 @RequestParam(value = "image", required = false) MultipartFile image) {
        return newsService.addNews(news_header,news_body,creating_date,created_by,image);
    }
}
