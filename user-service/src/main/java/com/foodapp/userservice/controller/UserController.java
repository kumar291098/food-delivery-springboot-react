package com.foodapp.userservice.controller;

import com.foodapp.userservice.dto.LoginRequest;
import com.foodapp.userservice.dto.LoginResponse;
import com.foodapp.userservice.dto.RegisterRequest;
import com.foodapp.userservice.dto.UpdateUserRequest;
import com.foodapp.userservice.dto.UserResponse;
import com.foodapp.userservice.service.UserService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/register")
	public ResponseEntity<UserResponse> register(@Valid @RequestBody RegisterRequest request) {
		return ResponseEntity.status(HttpStatus.CREATED).body(userService.register(request));
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
		return ResponseEntity.ok(userService.login(request));
	}

	@GetMapping("/{id}")
	public ResponseEntity<UserResponse> getById(@PathVariable("id") Long userId) {
		return ResponseEntity.ok(userService.getById(userId));
	}

	@PutMapping("/{id}")
	public ResponseEntity<UserResponse> update(
			@PathVariable("id") Long userId,
			@Valid @RequestBody UpdateUserRequest request) {
		return ResponseEntity.ok(userService.update(userId, request));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Map<String, String>> delete(@PathVariable("id") Long userId) {
		userService.delete(userId);
		return ResponseEntity.ok(Map.of("message", "User deactivated successfully"));
	}
}
