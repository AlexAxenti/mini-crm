package com.alexaxenti.events_service_springboot.events;

import java.lang.management.ManagementFactory;
import java.security.SecureRandom;
import java.util.Locale;
import java.util.concurrent.atomic.AtomicInteger;

final class Cuid {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final AtomicInteger COUNTER = new AtomicInteger(RANDOM.nextInt(36 * 36 * 36 * 36));
    private static final String FINGERPRINT = pad(base36(hostHash()), 4);

    private Cuid() {
    }

    static String create() {
        return "c"
                + base36(System.currentTimeMillis())
                + pad(base36(COUNTER.getAndIncrement()), 4)
                + FINGERPRINT
                + randomBlock()
                + randomBlock();
    }

    private static String randomBlock() {
        return pad(base36(Math.abs(RANDOM.nextLong())), 8);
    }

    private static int hostHash() {
        return Math.abs(ManagementFactory.getRuntimeMXBean().getName().hashCode());
    }

    private static String base36(long value) {
        return Long.toString(value, 36).toLowerCase(Locale.ROOT);
    }

    private static String pad(String value, int length) {
        if (value.length() >= length) {
            return value.substring(value.length() - length);
        }

        return "0".repeat(length - value.length()) + value;
    }
}
