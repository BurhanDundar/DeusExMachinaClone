package com.northline.store.common.security;

import com.northline.store.user.entity.User;
import com.northline.store.user.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository users;
    public CustomUserDetailsService(UserRepository users) { this.users = users; }

    @Override public UserDetails loadUserByUsername(String email) {
        return UserPrincipal.from(users.findByEmailIgnoreCase(User.normalizeEmail(email))
                .orElseThrow(() -> new UsernameNotFoundException("Account not found")));
    }

    public UserPrincipal loadById(UUID id) {
        return UserPrincipal.from(users.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found")));
    }
}
