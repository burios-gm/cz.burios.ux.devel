package cz.burios.ux.darwin.db.dao;

import java.lang.reflect.Field;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import cz.burios.ux.darwin.db.DBContext;

public class DSLSelect {
	
	private List<String> selectedColumns = new ArrayList<>();
	private String tableName;
	private final List<String> joins = new ArrayList<>();
	private String whereClause;
	private List<Object> whereParams = new ArrayList<>();
	private String orderByClause;
	private String groupByClause;
	private Integer limitValue;
	private Integer offsetValue;

	// vybrané sloupce
	public DSLSelect select(Object... columns) {
		selectedColumns.clear();
		if (columns != null) {
			for (Object col : columns) {
				selectedColumns.add(col.toString());
			}
		}
		return this;
	}

	// tabulka
	public DSLSelect from(String tableName) {
		this.tableName = tableName;
		return this;
	}

	// JOIN
	public DSLSelect join(String joinClause) {
		joins.add(joinClause);
		return this;
	}
    
	// WHERE s parametry
	public DSLSelect where(String condition, Object... params) {
		this.whereClause = condition;
		this.whereParams.clear();
		if (params != null) {
			for (Object p : params) {
				this.whereParams.add(p);
			}
		}
		return this;
	}

	public DSLSelect orderBy(String column, String direction) {
		this.orderByClause = column + " " + direction;
		return this;
	}

	public DSLSelect groupBy(String column) {
		this.groupByClause = column;
		return this;
	}

	public DSLSelect limit(int n) {
		this.limitValue = n;
		return this;
	}

	public DSLSelect offset(int n) {
		this.offsetValue = n;
		return this;
	}

	// provedení SELECT
	public List<BasicRecord> execute() throws Exception {
		StringBuilder sql = new StringBuilder("SELECT ");

		if (selectedColumns.isEmpty()) {
			sql.append("*");
		} else {
			sql.append(String.join(", ", selectedColumns));
		}

		sql.append(" FROM ").append(tableName);

		for (String j : joins) {
			sql.append(" ").append(j);
		}

		if (whereClause != null)
			sql.append(" WHERE ").append(whereClause);
		if (groupByClause != null)
			sql.append(" GROUP BY ").append(groupByClause);
		if (orderByClause != null)
			sql.append(" ORDER BY ").append(orderByClause);
		if (limitValue != null)
			sql.append(" LIMIT ").append(limitValue);
		if (offsetValue != null)
			sql.append(" OFFSET ").append(offsetValue);

		List<BasicRecord> list = new ArrayList<>();
		try (Connection conn = DBContext.getDataSource().getConnection();
			PreparedStatement ps = conn.prepareStatement(sql.toString())) {

			for (int i = 0; i < whereParams.size(); i++) {
				ps.setObject(i + 1, whereParams.get(i));
			}

			try (ResultSet rs = ps.executeQuery()) {
				while (rs.next()) {
					list.add(mapRow(rs));
				}
			}
		}
		return list;
	}

	/**
	 * <pre>
	 * Metoda podporuje mapování výsledků přímo na POJO.
	 * - Alias sloupců se automaticky převádí na camelCase → file_name → fileName.
	 * - pokud POJO obsahuje odpovídající field, hodnota se nastaví reflexí.
	 * - DSL styl zůstává čistý: select(...).from(...).where(...).mapTo(FileRecord.class).
	 * </pre>
	 * 
	 * @param <T>
	 * @param type
	 * @return
	 * @throws Exception
	 */
	public <T> List<T> mapTo(Class<T> type) throws Exception {
		StringBuilder sql = new StringBuilder("SELECT ");

		if (selectedColumns.isEmpty()) {
			sql.append("*");
		} else {
			sql.append(String.join(", ", selectedColumns));
		}
		sql.append(" FROM ").append(tableName);

		for (String j : joins) {
			sql.append(" ").append(j);
		}
		if (whereClause != null)
			sql.append(" WHERE ").append(whereClause);
		if (groupByClause != null)
			sql.append(" GROUP BY ").append(groupByClause);
		if (orderByClause != null)
			sql.append(" ORDER BY ").append(orderByClause);
		if (limitValue != null)
			sql.append(" LIMIT ").append(limitValue);
		if (offsetValue != null)
			sql.append(" OFFSET ").append(offsetValue);

		List<T> list = new ArrayList<>();
		try (Connection conn = DBContext.getDataSource().getConnection();
			PreparedStatement ps = conn.prepareStatement(sql.toString())) {
			for (int i = 0; i < whereParams.size(); i++) {
				ps.setObject(i + 1, whereParams.get(i));
			}
			try (ResultSet rs = ps.executeQuery()) {
				while (rs.next()) {
					list.add(mapRowToPojo(rs, type));
				}
			}
		}
		return list;
	}

	private <T> T mapRowToPojo(ResultSet rs, Class<T> type) throws Exception {
		T obj = type.getDeclaredConstructor().newInstance();
		int cols = rs.getMetaData().getColumnCount();
		for (int i = 1; i <= cols; i++) {
			String colLabel = rs.getMetaData().getColumnLabel(i);
			Object value = rs.getObject(i);
			String camelName = toCamelCase(colLabel);

			try {
				Field field = type.getDeclaredField(camelName);
				field.setAccessible(true);
				field.set(obj, value);
			} catch (NoSuchFieldException ignored) {
				// pokud POJO nemá field, přeskočíme
			}
		}
		return obj;
	}

    // -----------------------------------------------------------------------
	
	private BasicRecord mapRow(ResultSet rs) throws SQLException {
		BasicRecord record = new BasicRecord();
		int cols = rs.getMetaData().getColumnCount();
		for (int i = 1; i <= cols; i++) {
			String colName = rs.getMetaData().getColumnLabel(i);
			Object value = rs.getObject(i);
			record.put(colName, value);
			// record.put(toCamelCase(colName), value);
		}
		return record;
	}
	
	/**
	 * převod snake_case / lowercase na camelCase
	 * @param input
	 * @return
	 */
	private String toCamelCase(String input) {
		StringBuilder sb = new StringBuilder();
		boolean upperNext = false;
		for (char c : input.toCharArray()) {
			if (c == '_' || c == ' ') {
				upperNext = true;
			} else {
				if (upperNext) {
					sb.append(Character.toUpperCase(c));
					upperNext = false;
				} else {
					sb.append(Character.toLowerCase(c));
				}
			}
		}
		return sb.toString();
	}
}