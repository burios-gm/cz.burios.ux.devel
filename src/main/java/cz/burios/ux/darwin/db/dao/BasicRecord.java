package cz.burios.ux.darwin.db.dao;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;

public class BasicRecord extends LinkedHashMap<String, Object> {

	public void setString(String column, String value) {
		put(column, value);
	}

	public String getString(String column) {
		Object val = get(column);
		return val != null ? val.toString() : null;
	}

	public void setBigInteger(String column, BigInteger value) {
		put(column, value);
	}

	public BigInteger getBigInteger(String column) {
		Object val = get(column);
		return val instanceof BigInteger ? (BigInteger) val : val != null ? new BigInteger(val.toString()) : null;
	}

	public void setBigDecimal(String column, BigDecimal value) {
		put(column, value);
	}

	public BigDecimal getBigDecimal(String column) {
		Object val = get(column);
		return val instanceof BigDecimal ? (BigDecimal) val : val != null ? new BigDecimal(val.toString()) : null;
	}

	public void setBoolean(String column, Boolean value) {
		put(column, value);
	}

	public Boolean getBoolean(String column) {
		Object val = get(column);
		return val instanceof Boolean ? (Boolean) val : val != null ? Boolean.valueOf(val.toString()) : null;
	}

	public void setLocalDate(String column, LocalDate value) {
		put(column, value);
	}

	public LocalDate getLocalDate(String column) {
		Object val = get(column);
		return val instanceof LocalDate ? (LocalDate) val : null;
	}

	public void setLocalDateTime(String column, LocalDateTime value) {
		put(column, value);
	}

	public LocalDateTime getLocalDateTime(String column) {
		Object val = get(column);
		return val instanceof LocalDateTime ? (LocalDateTime) val : null;
	}
}