package com.foodapp.notificationservice.service;

import com.foodapp.notificationservice.dto.NotificationRequest;
import com.foodapp.notificationservice.dto.NotificationResponse;
import com.foodapp.notificationservice.dto.OrderNotificationRequest;
import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

	private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

	private final JavaMailSender javaMailSender;

	public NotificationService(JavaMailSender javaMailSender) {
		this.javaMailSender = javaMailSender;
	}

	public NotificationResponse sendEmail(NotificationRequest request) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setTo(request.getRecipient().trim());
		message.setSubject(request.getSubject().trim());
		message.setText(request.getMessage().trim());

		try {
			javaMailSender.send(message);
			return new NotificationResponse("EMAIL", request.getRecipient(), "SENT",
					"Email sent successfully", LocalDateTime.now());
		}
		catch (Exception ex) {
			log.warn("Email send fallback activated for recipient {}: {}", request.getRecipient(), ex.getMessage());
			return new NotificationResponse("EMAIL", request.getRecipient(), "SIMULATED",
					"Mail server unavailable, notification recorded only", LocalDateTime.now());
		}
	}

	public NotificationResponse sendSms(NotificationRequest request) {
		log.info("Simulated SMS to {} with subject {}", request.getRecipient(), request.getSubject());
		return new NotificationResponse("SMS", request.getRecipient(), "SENT",
				"SMS notification simulated successfully", LocalDateTime.now());
	}

	public NotificationResponse sendOrderUpdate(OrderNotificationRequest request) {
		String body = "Order " + request.getOrderId() + " for user " + request.getUserId()
				+ " is now " + request.getStatus() + ".";
		NotificationRequest emailRequest = new NotificationRequest();
		emailRequest.setRecipient(request.getCustomerEmail());
		emailRequest.setSubject("Order Status Update");
		emailRequest.setMessage(body);
		return sendEmail(emailRequest);
	}
}
