package com.example.urlshortener.util;

public class Base62 {

    private static final String CHARACTERS =
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

    private Base62() {
    }

    public static String encode(long number) {

        if (number == 0) {
            return "0";
        }

        StringBuilder result = new StringBuilder();

        while (number > 0) {

            int remainder = (int) (number % 62);

            result.append(CHARACTERS.charAt(remainder));

            number = number / 62;
        }

        return result.reverse().toString();
    }

    public static long decode(String value) {

        long result = 0;

        for (char character : value.toCharArray()) {

            int digit = CHARACTERS.indexOf(character);

            if (digit == -1) {
                throw new IllegalArgumentException(
                        "Invalid Base62 character: " + character
                );
            }

            result = result * 62 + digit;
        }

        return result;
    }
}
