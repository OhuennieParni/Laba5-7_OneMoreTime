package ru.cityapp.backend.controllers;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api")
public class TimeController {

    @GetMapping("/time")
    public Map<String, String> getTime() {

        LocalTime now = LocalTime.now();
        String time = now.format(DateTimeFormatter.ofPattern("HH:mm:ss"));

        return Map.of("time", time);
    }

    @GetMapping("/getServerDate")
    public Map<String, LocalDateTime> getDate() {
        Map<String, LocalDateTime> response = new HashMap<>();
        response.put("date", LocalDateTime.now());
        return response;
    }
}