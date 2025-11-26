package ru.cityapp.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.NewsDTO;
import ru.cityapp.backend.entities.News;
import ru.cityapp.backend.repositories.NewsRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class NewsService {

    @Autowired
    private NewsRepository newsRepository;

    public List<NewsDTO> getAllNews() {
        return newsRepository.findAllByOrderByIdDesc().stream()
                .map(NewsDTO::new)
                .toList();
    }

    public List<NewsDTO> addNews(String news_header, String news_body, String creating_date, String created_by, MultipartFile image) {
        News news = new News();
        news.setNews_header(news_header);
        news.setNews_body(news_body);
        news.setCreating_date(creating_date);
        news.setCreated_by(created_by);

        // ----- сохранение аватара -----
        if (image != null && !image.isEmpty()) {
            try {
                String fileName = UUID.randomUUID() + "_" + image.getOriginalFilename();
                Path uploadPath = Paths.get("uploads/newsImages");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Files.copy(
                        image.getInputStream(),
                        uploadPath.resolve(fileName),
                        StandardCopyOption.REPLACE_EXISTING
                );

                news.setImage_path("/newsImages/" + fileName);

            } catch (Exception e) {
                throw new RuntimeException("Ошибка сохранения аватара");
            }
        }

        
        News saved = newsRepository.save(news);

        return List.of(new NewsDTO(saved));
    }
}
