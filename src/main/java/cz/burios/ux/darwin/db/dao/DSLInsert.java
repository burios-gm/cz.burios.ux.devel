package cz.burios.ux.darwin.db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;

import cz.burios.ux.darwin.db.DBContext;

public class DSLInsert {
	private String tableName;
	private BasicRecord values;

	public DSLInsert insert(String tableName) {
		this.tableName = tableName;
		return this;
	}

	public DSLInsert values(BasicRecord record) {
		this.values = record;
		return this;
	}

	public void execute() throws Exception {
		StringBuilder sql = new StringBuilder("INSERT INTO ").append(tableName).append(" (");
		StringBuilder placeholders = new StringBuilder(" VALUES (");

		List<Object> params = new ArrayList<>();
		for (String col : values.keySet()) {
			sql.append(col).append(",");
			placeholders.append("?,");
			params.add(values.get(col));
		}
		sql.setLength(sql.length() - 1);
		placeholders.setLength(placeholders.length() - 1);
		sql.append(")").append(placeholders).append(")");

		try (Connection conn = DBContext.getDataSource().getConnection();
				PreparedStatement ps = conn.prepareStatement(sql.toString())) {
			for (int i = 0; i < params.size(); i++) {
				ps.setObject(i + 1, params.get(i));
			}
			ps.executeUpdate();
		}
	}
}