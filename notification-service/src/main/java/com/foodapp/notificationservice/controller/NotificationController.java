package com.foodapp.notificationservice.controller;

import com.foodapp.notificationservice.dto.NotificationRequest;
import com.foodapp.notificationservice.dto.NotificationResponse;
import com.foodapp.notificationservice.dto.OrderNotificationRequest;
import com.foodapp.notificationservice.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@PostMapping("/email")
	public ResponseEntity<NotificationResponse> sendEmail(@Valid @RequestBody NotificationRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.sendEmail(request));
	}

	@PostMapping("/sms")
	public ResponseEntity<NotificationResponse> sendSms(@Valid @RequestBody NotificationRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.sendSms(request));
	}

	@PostMapping("/order-update")
	public ResponseEntity<NotificationResponse> sendOrderUpdate(
			@Valid @RequestBody OrderNotificationRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.sendOrderUpdate(request));
	}
}
