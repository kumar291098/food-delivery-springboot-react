package com.foodapp.restaurantservice.repository;

import com.foodapp.restaurantservice.entity.Restaurant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

	List<Restaurant> findByActiveTrueOrderByNameAsc();

	Optional<Restaurant> findByOwnerEmail(String ownerEmail);
}
