package com.connectly.connectly.config.security;


import com.connectly.connectly.model.redis.SessionProfile;
import com.connectly.connectly.model.database.User;
import com.connectly.connectly.service.database.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class UPAuthProviderConfig implements AuthenticationProvider {
    private UserService userService;

    @Autowired
    public UPAuthProviderConfig(UserService userService) {
        this.userService = userService;
    }


    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String name = authentication.getName();
        String password = authentication.getCredentials().toString();

        if (name.trim().length() <= 3) {
            throw new AuthenticationException("Username must be more than 3 characters") {
            };
        }

        if (password.trim().length() <= 8) {
            throw new AuthenticationException("Password must be more than 8 characters") {
            };
        }

        User user = userService.registerUser(name, password);

        if (user == null) {
            throw new BadCredentialsException("Bad Credentials");
        }

        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.getRole().getName()));

        SessionProfile sessionProfile = new SessionProfile();
        sessionProfile.setAuthorities(authorities);
        sessionProfile.setUserName(name);


        return new UsernamePasswordAuthenticationToken(sessionProfile, password, authorities);
    }


    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}
