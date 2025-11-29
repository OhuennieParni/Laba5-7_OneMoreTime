package ru.cityapp.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.DataTransferObject.NewsDTO;
import ru.cityapp.backend.entities.News;
import ru.cityapp.backend.repositories.NewsRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Сервис работы с новостями.
 * Реализует бизнес-логику:
 *  - получение всех новостей в обратном порядке;
 *  - создание новой новости с изображением;
 *  - обновление существующей новости;
 *  - удаление старой картинки при обновлении;
 *  - сохранение изображений в файловой системе.
 */
@Service
public class NewsService {

    @Autowired
    private NewsRepository newsRepository;

    /**
     * Возвращает список всех новостей, отсортированных по ID по убыванию.
     *
     * @return - список новостей в формате DTO
     */
    public List<NewsDTO> getAllNews() {
        return newsRepository.findAllByOrderByIdDesc().stream()
                .map(NewsDTO::new)
                .toList();
    }

    /**
     * Создает новую новость
     *
     * @param news_header - заголовок новости
     * @param news_body - основной текст новости
     * @param creating_date - дата создания
     * @param created_by - автор
     * @param image - картинка к новости (не обязательно)
     * @return - список, содержащий одну созданную новость в формате DTO
     */
    public List<NewsDTO> addNews(String news_header, String news_body, String creating_date, String created_by, MultipartFile image) {
        News news = new News();
        news.setNews_header(news_header);
        news.setNews_body(news_body);
        news.setCreating_date(creating_date);
        news.setCreated_by(created_by);

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
                throw new RuntimeException("Ошибка сохранения изображения");
            }
        }


        News saved = newsRepository.save(news);

        return List.of(new NewsDTO(saved));
    }

    /**
     * Обновляет существующую новость.
     *
     * @param id - id новости
     * @param news_header - новый заголовок
     * @param news_body - новая основная часть новости
     * @param creating_date - дата создания
     * @param created_by - атвор
     * @param image - картинка(не обязательно)
     * @return - список с обновлённой DTO новости
     */
    public List<NewsDTO> updateNews(long id, String news_header, String news_body, String creating_date, String created_by, MultipartFile image){

        News news = newsRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Новость не найдена"));

        news.setNews_header(news_header);
        news.setNews_body(news_body);
        news.setCreated_by(created_by);
        news.setCreating_date(creating_date);

        if(image != null && !image.isEmpty()) {
            try {
                deleteOldImage(news.getImage_path());

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
                throw new RuntimeException("Ошибка сохранения изображения");
            }
        }

        News saved = newsRepository.save(news);

        return List.of(new NewsDTO(saved));
    }

    /**
     * Удаляет старое изображение новости с диска.
     *
     * @param image_path - путь к изображению в формате "/newsImages/xxx.yyy"
     * @throws IOException - если файл не удалось удалить
     */
    private void deleteOldImage(String image_path) throws IOException {

        if(image_path == null || image_path.isEmpty()) {
            return;
        }
        String fileName = image_path.replace("newsImages/","");
        Path imagePath = Paths.get("uploads/newsImages").resolve(fileName);
        try {
            Files.deleteIfExists(imagePath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
