package ru.cityapp.backend.Configurations;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;


//Это для нормального поиска картинки вне папки src! типа, когда приходит запрос "НАДИ МНЕ КРАТИНКУ, МРАЗЬ" Он ее ищет в uploads, avatars, а то в SRC они при добавлении не отображаются, пока сервак не обновишь
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:uploads/avatars/");
    }
}