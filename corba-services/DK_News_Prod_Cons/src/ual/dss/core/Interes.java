package ual.dss.core;

public enum Interes {
	ALTA("alta"),
	MEDIA("media"),
	BAJA("baja");

	private final String value;

	Interes(String value) {
		this.value = value;
	}

	public String getValue() {
		return value;
	}

	public static Interes fromValue(String value) {
		if (value == null) {
			return null;
		}
		String normalized = value.trim().toLowerCase();
		for (Interes interes : values()) {
			if (interes.value.equals(normalized)) {
				return interes;
			}
		}
		return null;
	}

	@Override
	public String toString() {
		return value;
	}
}
