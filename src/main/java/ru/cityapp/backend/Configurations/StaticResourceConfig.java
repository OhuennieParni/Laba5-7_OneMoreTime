package ru.cityapp.backend.Configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


/**
 * Конфигурация статических ресурсов.
 * Настраивает обработку URL, которые должны отдавать статические файлы
 * (аватары, изображения новостей, изображения запросов),
 * загруженные пользователями и сохранённые вне каталога resources.
 * Spring по умолчанию обслуживает файлы только из /static и /public,
 * поэтому здесь создаются явные обработчики путей, которые указывают
 * на реальные директории файловой системы (uploads/...).
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:uploads/avatars/");

        registry.addResourceHandler("/requests/**")
                .addResourceLocations("file:uploads/requests/");

        registry.addResourceHandler("/newsImages/**")
                .addResourceLocations("file:uploads/newsImages/");
    }
}