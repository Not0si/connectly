package com.connectly.connectly.Session;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class SessionProfileService {
    private SessionProfileRepository sessionProfileRepository;
    private final String cookieKey = "SESSION_TOKEN";
    private final String registrationPrefix = "connectly:session:";
    private final int sessionDuration = 60 * 60;


    @Autowired
    public SessionProfileService(SessionProfileRepository sessionRepository) {
        this.sessionProfileRepository = sessionRepository;
    }

    public String getCookieKey() {
        return cookieKey;
    }

    private String generateOpaqueToken() {
        String opaqueToken;
        Optional<SessionProfile> session;

        do {
            opaqueToken = UUID.randomUUID().toString();
            session = sessionProfileRepository.findById(opaqueToken);
        } while (session.isPresent());

        return opaqueToken;
    }

    private String getSessionCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();

        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieKey.equals(cookie.getName())) {
                    String cookieValue = cookie.getValue();
                    return cookieValue;
                }
            }
        }

        return null;
    }

    private void clearAllCookies(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                cookie.setValue("");
                cookie.setPath("/"); // Set the cookie path to ensure it matches the path in which they were set
                cookie.setMaxAge(0); // Expire the cookie
                response.addCookie(cookie); // Add the expired cookie back to the response
            }
        }
    }

    public List<SessionInformation> getAllSessions(Object principal, boolean includeExpiredSessions) {
        return List.of();
    }


    public SessionProfile getSessionInformation(String opaqueToken) {
        Optional<SessionProfile> session = sessionProfileRepository.findById(registrationPrefix + opaqueToken);

        if (session.isPresent()) {
            return session.get();
        }

        return null;
    }


    private void registerNewSession(String sessionId, Object principal) {

        SessionProfile sessionProfile = new SessionProfile();
        sessionProfile.setOpaqueToken(registrationPrefix + sessionId);
//        sessionProfile.setUserName(userName);

        sessionProfileRepository.save(sessionProfile);
    }

    public void registerNewSession(HttpServletResponse response, Object principal) {
        String opaqueToken = generateOpaqueToken();

        Cookie cookie = new Cookie(cookieKey, opaqueToken);
        cookie.setHttpOnly(true);  // Make the cookie HttpOnly
        cookie.setSecure(true);    // Ensure the cookie is sent only over HTTPS
        cookie.setPath("/");       // Make the cookie available for the entire domain
        cookie.setMaxAge(sessionDuration); // Set cookie expiration (1 hour in seconds)

        registerNewSession(opaqueToken, principal);
        response.addCookie(cookie);
    }


    public void removeSessionInformation(HttpServletRequest request, HttpServletResponse response) {
        String opaqueToken = getSessionCookie(request);

        if (opaqueToken != null) {
            sessionProfileRepository.deleteById(registrationPrefix + opaqueToken);
            Cookie cookie = new Cookie(cookieKey, null);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setMaxAge(0);
            cookie.setPath("/");

            response.addCookie(cookie);
        }

    }


    public void validateSessionInformation(HttpServletRequest request, HttpServletResponse response) {
        String opaqueToken = getSessionCookie(request);

        if (opaqueToken != null) {
            SessionProfile sessionProfile = getSessionInformation(opaqueToken);

            if (sessionProfile != null) {
                List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("client"));

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken("Lorem Ipsum", null, authorities);
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);


            } else {
                clearAllCookies(request, response);
            }

        }
    }
}
