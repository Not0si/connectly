package com.connectly.connectly.Security;


import com.connectly.connectly.User.User;
import com.connectly.connectly.User.UserService;
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

        return new UsernamePasswordAuthenticationToken(name, password, authorities);
    }


    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.equals(UsernamePasswordAuthenticationToken.class);
    }
}
