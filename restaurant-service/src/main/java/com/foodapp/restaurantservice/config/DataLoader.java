package com.foodapp.restaurantservice.config;

import com.foodapp.restaurantservice.entity.MenuItem;
import com.foodapp.restaurantservice.entity.Restaurant;
import com.foodapp.restaurantservice.repository.RestaurantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

	@Bean
	CommandLineRunner seedRestaurants(RestaurantRepository restaurantRepository) {
		return args -> {
			if (restaurantRepository.count() > 0) {
				return;
			}

			Restaurant spiceGarden = new Restaurant();
			spiceGarden.setName("Spice Garden");
			spiceGarden.setCuisine("Indian");
			spiceGarden.setAddress("12 Residency Road");
			spiceGarden.setPhoneNumber("9999991111");
			spiceGarden.setRating(4.5);

			MenuItem biryani = new MenuItem();
			biryani.setName("Chicken Biryani");
			biryani.setDescription("Hyderabadi biryani with raita");
			biryani.setPrice(249.0);
			spiceGarden.addMenuItem(biryani);

			MenuItem paneer = new MenuItem();
			paneer.setName("Paneer Butter Masala");
			paneer.setDescription("Creamy curry with butter naan");
			paneer.setPrice(219.0);
			spiceGarden.addMenuItem(paneer);

			Restaurant urbanBowl = new Restaurant();
			urbanBowl.setName("Urban Bowl");
			urbanBowl.setCuisine("Healthy");
			urbanBowl.setAddress("44 Central Avenue");
			urbanBowl.setPhoneNumber("9999992222");
			urbanBowl.setRating(4.2);

			MenuItem bowl = new MenuItem();
			bowl.setName("Protein Bowl");
			bowl.setDescription("Rice, grilled chicken, veggies and sauce");
			bowl.setPrice(199.0);
			urbanBowl.addMenuItem(bowl);

			MenuItem smoothie = new MenuItem();
			smoothie.setName("Berry Smoothie");
			smoothie.setDescription("Mixed berries, yogurt and honey");
			smoothie.setPrice(129.0);
			urbanBowl.addMenuItem(smoothie);

			restaurantRepository.save(spiceGarden);
			restaurantRepository.save(urbanBowl);
		};
	}
}
