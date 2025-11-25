package ru.cityapp.backend.controllers;

import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ru.cityapp.backend.entities.Request;
import ru.cityapp.backend.services.RequestsService;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
public class RequestsController {

    @Autowired
    private RequestsService requestService;

    @PostMapping(value = "/AddRequest",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Request addRequest(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "image", required = false) MultipartFile image,
            HttpSession session) {

        return requestService.addRequest(title, description, image, session);
    }

    // Запросы для главной страницы (approved)
    @GetMapping("/approved")
    public List<Request> getApproved() {
        return requestService.getApprovedRequests();
    }

    // Модератор видит все pending
    @GetMapping("/pending")
    public List<Request> getPending() {
        return requestService.getPendingRequests();
    }

    // Модератор меняет статус
    @PostMapping("/setStatus")
    public Request setStatus(
            @RequestParam("id") Long id,
            @RequestParam("status") String status
    ) {
        return requestService.updateStatus(id, status);
    }
}