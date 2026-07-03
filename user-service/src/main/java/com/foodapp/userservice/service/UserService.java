package com.foodapp.userservice.service;

import com.foodapp.userservice.dto.LoginRequest;
import com.foodapp.userservice.dto.LoginResponse;
import com.foodapp.userservice.dto.RegisterRequest;
import com.foodapp.userservice.dto.UpdateUserRequest;
import com.foodapp.userservice.dto.UserResponse;
import com.foodapp.userservice.entity.User;
import com.foodapp.userservice.exception.ConflictException;
import com.foodapp.userservice.exception.ResourceNotFoundException;
import com.foodapp.userservice.exception.UnauthorizedException;
import com.foodapp.userservice.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

	private final UserRepository userRepository;
	private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Transactional
	public UserResponse register(RegisterRequest request) {
		if (userRepository.existsByEmail(request.getEmail())) {
			throw new ConflictException("Email already registered");
		}

		User user = new User();
		user.setEmail(request.getEmail().trim().toLowerCase());
		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		user.setFirstName(request.getFirstName().trim());
		user.setLastName(request.getLastName().trim());
		user.setPhoneNumber(request.getPhoneNumber().trim());
		user.setAddress(request.getAddress().trim());

		User saved = userRepository.save(user);
		return mapToUserResponse(saved);
	}

	@Transactional(readOnly = true)
	public LoginResponse login(LoginRequest request) {
		User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
				.orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

		if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
			throw new UnauthorizedException("Invalid email or password");
		}

		return new LoginResponse("Login successful", mapToUserResponse(user));
	}

	@Transactional(readOnly = true)
	public UserResponse getById(Long userId) {
		User user = findByIdOrThrow(userId);
		return mapToUserResponse(user);
	}

	@Transactional
	public UserResponse update(Long userId, UpdateUserRequest request) {
		User user = findByIdOrThrow(userId);
		user.setFirstName(request.getFirstName().trim());
		user.setLastName(request.getLastName().trim());
		user.setPhoneNumber(request.getPhoneNumber().trim());
		user.setAddress(request.getAddress().trim());
		return mapToUserResponse(userRepository.save(user));
	}

	@Transactional
	public void delete(Long userId) {
		User user = findByIdOrThrow(userId);
		user.setActive(false);
		userRepository.save(user);
	}

	private User findByIdOrThrow(Long userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
	}

	private UserResponse mapToUserResponse(User user) {
		UserResponse response = new UserResponse();
		response.setId(user.getId());
		response.setEmail(user.getEmail());
		response.setFirstName(user.getFirstName());
		response.setLastName(user.getLastName());
		response.setPhoneNumber(user.getPhoneNumber());
		response.setAddress(user.getAddress());
		response.setCreatedDate(user.getCreatedDate());
		response.setActive(user.isActive());
		return response;
	}
}
