package com.foodapp.orderservice.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateOrderStatusRequest {

	@NotBlank
	private String status;

	private String driverEmail;
	private String driverName;

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public String getDriverEmail() {
		return driverEmail;
	}

	public void setDriverEmail(String driverEmail) {
		this.driverEmail = driverEmail;
	}

	public String getDriverName() {
		return driverName;
	}

	public void setDriverName(String driverName) {
		this.driverName = driverName;
	}
}
