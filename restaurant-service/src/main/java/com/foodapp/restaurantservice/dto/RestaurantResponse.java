package com.foodapp.restaurantservice.dto;

import java.util.List;

public class RestaurantResponse {

	private Long id;
	private String name;
	private String cuisine;
	private String address;
	private String phoneNumber;
	private Double rating;
	private Boolean active;
	private List<MenuItemResponse> menuItems;

	private String ownerEmail;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

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

	public Boolean getActive() {
		return active;
	}

	public void setActive(Boolean active) {
		this.active = active;
	}

	public List<MenuItemResponse> getMenuItems() {
		return menuItems;
	}

	public void setMenuItems(List<MenuItemResponse> menuItems) {
		this.menuItems = menuItems;
	}

	public String getOwnerEmail() {
		return ownerEmail;
	}

	public void setOwnerEmail(String ownerEmail) {
		this.ownerEmail = ownerEmail;
	}
}
