package com.northline.store.common.config;

import com.northline.store.common.security.CustomUserDetailsService;
import com.northline.store.common.security.JwtAuthenticationFilter;
import com.northline.store.common.security.RestAuthenticationEntryPoint;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder(12);
  }

  @Bean
  DaoAuthenticationProvider authenticationProvider(
    CustomUserDetailsService details,
    PasswordEncoder encoder
  ) {
    var provider = new DaoAuthenticationProvider();
    provider.setUserDetailsService(details);
    provider.setPasswordEncoder(encoder);
    return provider;
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
    throws Exception {
    return configuration.getAuthenticationManager();
  }

  @Bean
  SecurityFilterChain securityFilterChain(
    HttpSecurity http,
    JwtAuthenticationFilter jwtFilter,
    RestAuthenticationEntryPoint entryPoint,
    DaoAuthenticationProvider provider
  ) throws Exception {
    return http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> {})
      .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authenticationProvider(provider)
      .exceptionHandling(errors -> errors.authenticationEntryPoint(entryPoint))
      .authorizeHttpRequests(auth ->
        auth
          .requestMatchers("/api/auth/**", "/api/newsletter/subscriptions", "/actuator/health")
          .permitAll()
          .requestMatchers(
            org.springframework.http.HttpMethod.GET,
            "/api/products/**",
            "/api/categories/**",
            "/api/collections/**"
          )
          .permitAll()
          .requestMatchers("/api/users/**", "/api/cart/**", "/api/orders/**")
          .authenticated()
          .requestMatchers("/api/admin/**")
          .hasRole("ADMIN")
          .anyRequest()
          .denyAll()
      )
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
      .build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource(
    @Value("${app.cors.allowed-origins}") String allowedOrigins
  ) {
    var config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(",")).map(String::trim).toList());
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
    config.setAllowCredentials(true);
    config.setMaxAge(3600L);
    var source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
  }
}
