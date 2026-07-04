package com.foodapp.notificationservice.dto;

import java.time.LocalDateTime;

public class NotificationResponse {

	private String channel;
	private String recipient;
	private String status;
	private String message;
	private LocalDateTime sentAt;

	public NotificationResponse(String channel, String recipient, String status, String message,
			LocalDateTime sentAt) {
		this.channel = channel;
		this.recipient = recipient;
		this.status = status;
		this.message = message;
		this.sentAt = sentAt;
	}

	public String getChannel() {
		return channel;
	}

	public String getRecipient() {
		return recipient;
	}

	public String getStatus() {
		return status;
	}

	public String getMessage() {
		return message;
	}

	public LocalDateTime getSentAt() {
		return sentAt;
	}
}
