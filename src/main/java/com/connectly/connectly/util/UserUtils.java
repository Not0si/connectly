package com.connectly.connectly.util;

import java.security.SecureRandom;
import java.util.Random;

public class UserUtils {
    private static final String CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Random random = new Random();

    public static String generateRandomHexColor() {
        int color = random.nextInt(0xFFFFFF + 1); // 0xFFFFFF is the maximum hex color value
        return String.format("#%06X", color);
    }

    public static String generateRandomAvatar() {
        int num = random.nextInt(1, 28);
        return "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_%d.png".formatted(num);
    }

    public static String generateSessionCode() {
        int length = 60;
        StringBuilder sessionCode = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = RANDOM.nextInt(CHARACTERS.length());
            sessionCode.append(CHARACTERS.charAt(index));
        }
        return sessionCode.toString();
    }
}
