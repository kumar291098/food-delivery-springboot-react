package com.foodapp.restaurantservice.service;

import com.foodapp.restaurantservice.dto.CreateRestaurantRequest;
import com.foodapp.restaurantservice.dto.MenuItemRequest;
import com.foodapp.restaurantservice.dto.MenuItemResponse;
import com.foodapp.restaurantservice.dto.RestaurantResponse;
import com.foodapp.restaurantservice.entity.MenuItem;
import com.foodapp.restaurantservice.entity.Restaurant;
import com.foodapp.restaurantservice.repository.MenuItemRepository;
import com.foodapp.restaurantservice.repository.RestaurantRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RestaurantService {

	private final RestaurantRepository restaurantRepository;
	private final MenuItemRepository menuItemRepository;

	public RestaurantService(RestaurantRepository restaurantRepository, MenuItemRepository menuItemRepository) {
		this.restaurantRepository = restaurantRepository;
		this.menuItemRepository = menuItemRepository;
	}

	@Transactional(readOnly = true)
	public List<RestaurantResponse> getAllRestaurants() {
		return restaurantRepository.findByActiveTrueOrderByNameAsc().stream()
				.map(this::mapRestaurant)
				.toList();
	}

	@Transactional(readOnly = true)
	public RestaurantResponse getRestaurantById(Long restaurantId) {
		return mapRestaurant(findRestaurant(restaurantId));
	}

	@Transactional
	public RestaurantResponse createRestaurant(CreateRestaurantRequest request) {
		Restaurant restaurant = new Restaurant();
		restaurant.setName(request.getName().trim());
		restaurant.setCuisine(request.getCuisine().trim());
		restaurant.setAddress(request.getAddress().trim());
		restaurant.setPhoneNumber(request.getPhoneNumber().trim());
		restaurant.setRating(request.getRating());
		restaurant.setOwnerEmail(request.getOwnerEmail() != null ? request.getOwnerEmail().trim().toLowerCase() : null);
		restaurant.setActive(true);

		for (MenuItemRequest itemRequest : request.getMenuItems()) {
			MenuItem menuItem = new MenuItem();
			menuItem.setName(itemRequest.getName().trim());
			menuItem.setDescription(itemRequest.getDescription().trim());
			menuItem.setPrice(itemRequest.getPrice());
			menuItem.setAvailable(Boolean.TRUE.equals(itemRequest.getAvailable()));
			restaurant.addMenuItem(menuItem);
		}

		return mapRestaurant(restaurantRepository.save(restaurant));
	}

	@Transactional(readOnly = true)
	public List<MenuItemResponse> getMenu(Long restaurantId) {
		findRestaurant(restaurantId);
		return menuItemRepository.findByRestaurantIdAndAvailableTrueOrderByNameAsc(restaurantId).stream()
				.map(this::mapMenuItem)
				.toList();
	}

	@Transactional(readOnly = true)
	public RestaurantResponse getRestaurantByOwner(String ownerEmail) {
		Restaurant restaurant = restaurantRepository.findByOwnerEmail(ownerEmail.trim().toLowerCase())
				.orElseThrow(() -> new IllegalArgumentException("No restaurant found for owner: " + ownerEmail));
		return mapRestaurant(restaurant);
	}

	@Transactional
	public MenuItemResponse addMenuItem(Long restaurantId, MenuItemRequest request) {
		Restaurant restaurant = findRestaurant(restaurantId);
		MenuItem menuItem = new MenuItem();
		menuItem.setName(request.getName().trim());
		menuItem.setDescription(request.getDescription().trim());
		menuItem.setPrice(request.getPrice());
		menuItem.setAvailable(request.getAvailable() != null ? request.getAvailable() : true);
		restaurant.addMenuItem(menuItem);
		menuItemRepository.save(menuItem);
		return mapMenuItem(menuItem);
	}

	private Restaurant findRestaurant(Long restaurantId) {
		return restaurantRepository.findById(restaurantId)
				.orElseThrow(() -> new IllegalArgumentException("Restaurant not found with id: " + restaurantId));
	}

	private RestaurantResponse mapRestaurant(Restaurant restaurant) {
		RestaurantResponse response = new RestaurantResponse();
		response.setId(restaurant.getId());
		response.setName(restaurant.getName());
		response.setCuisine(restaurant.getCuisine());
		response.setAddress(restaurant.getAddress());
		response.setPhoneNumber(restaurant.getPhoneNumber());
		response.setRating(restaurant.getRating());
		response.setActive(restaurant.getActive());
		response.setOwnerEmail(restaurant.getOwnerEmail());
		response.setMenuItems(restaurant.getMenuItems().stream().map(this::mapMenuItem).toList());
		return response;
	}

	private MenuItemResponse mapMenuItem(MenuItem menuItem) {
		MenuItemResponse response = new MenuItemResponse();
		response.setId(menuItem.getId());
		response.setName(menuItem.getName());
		response.setDescription(menuItem.getDescription());
		response.setPrice(menuItem.getPrice());
		response.setAvailable(menuItem.getAvailable());
		return response;
	}
}
