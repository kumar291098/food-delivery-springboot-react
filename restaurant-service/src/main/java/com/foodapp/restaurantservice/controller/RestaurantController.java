package com.foodapp.restaurantservice.controller;

import com.foodapp.restaurantservice.dto.CreateRestaurantRequest;
import com.foodapp.restaurantservice.dto.MenuItemRequest;
import com.foodapp.restaurantservice.dto.MenuItemResponse;
import com.foodapp.restaurantservice.dto.RestaurantResponse;
import com.foodapp.restaurantservice.service.RestaurantService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

	private final RestaurantService restaurantService;

	public RestaurantController(RestaurantService restaurantService) {
		this.restaurantService = restaurantService;
	}

	@GetMapping
	public ResponseEntity<List<RestaurantResponse>> getRestaurants() {
		return ResponseEntity.ok(restaurantService.getAllRestaurants());
	}

	@GetMapping("/{id}")
	public ResponseEntity<RestaurantResponse> getRestaurant(@PathVariable("id") Long restaurantId) {
		return ResponseEntity.ok(restaurantService.getRestaurantById(restaurantId));
	}

	@PostMapping
	public ResponseEntity<RestaurantResponse> createRestaurant(
			@Valid @RequestBody CreateRestaurantRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.createRestaurant(request));
	}

	@GetMapping("/{id}/menu")
	public ResponseEntity<List<MenuItemResponse>> getMenu(@PathVariable("id") Long restaurantId) {
		return ResponseEntity.ok(restaurantService.getMenu(restaurantId));
	}

	@GetMapping("/owner/{email}")
	public ResponseEntity<RestaurantResponse> getRestaurantByOwner(@PathVariable("email") String ownerEmail) {
		return ResponseEntity.ok(restaurantService.getRestaurantByOwner(ownerEmail));
	}

	@PostMapping("/{id}/menu")
	public ResponseEntity<MenuItemResponse> addMenuItem(
			@PathVariable("id") Long restaurantId,
			@Valid @RequestBody MenuItemRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.addMenuItem(restaurantId, request));
	}
}
