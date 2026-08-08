package com.northline.store.auth.dto;

import com.northline.store.user.dto.UserResponse;

public record AuthResponse(String accessToken, String tokenType, long expiresIn, UserResponse user) {}
