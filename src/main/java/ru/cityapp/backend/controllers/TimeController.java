package ru.cityapp.backend.controllers;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
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
}