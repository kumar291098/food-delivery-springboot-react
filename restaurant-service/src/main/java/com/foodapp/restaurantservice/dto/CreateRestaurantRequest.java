package com.foodapp.restaurantservice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreateRestaurantRequest {

	@NotBlank
	private String name;

	@NotBlank
	private String cuisine;

	@NotBlank
	private String address;

	@NotBlank
	private String phoneNumber;

	@NotNull
	private Double rating;

	@Valid
	@NotEmpty
	private List<MenuItemRequest> menuItems;

	private String ownerEmail;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCuisine() {
		return cuisine;
	}

	public void setCuisine(String cuisine) {
		this.cuisine = cuisine;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public void setPhoneNumber(String phoneNumber) {
		this.phoneNumber = phoneNumber;
	}

	public Double getRating() {
		return rating;
	}

	public void setRating(Double rating) {
		this.rating = rating;
	}

	public List<MenuItemRequest> getMenuItems() {
		return menuItems;
	}

	public void setMenuItems(List<MenuItemRequest> menuItems) {
		this.menuItems = menuItems;
	}

	public String getOwnerEmail() {
		return ownerEmail;
	}

	public void setOwnerEmail(String ownerEmail) {
		this.ownerEmail = ownerEmail;
	}
}
