package cz.burios.ux.util;

import java.security.SecureRandom;

public class IdGenerator {
	private static final String CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
	private static final SecureRandom RANDOM = new SecureRandom();

	public static String generateId() {
		StringBuilder sb = new StringBuilder("FS02_");
		for (int i = 0; i < 15; i++) {
			int index = RANDOM.nextInt(CHARSET.length());
			sb.append(CHARSET.charAt(index));
		}
		return sb.toString();
	}

	public static String generateId(String preffix) {
		StringBuilder sb = new StringBuilder(preffix);
		for (int i = 0; i < 15; i++) {
			int index = RANDOM.nextInt(CHARSET.length());
			sb.append(CHARSET.charAt(index));
		}
		return sb.toString();
	}
}