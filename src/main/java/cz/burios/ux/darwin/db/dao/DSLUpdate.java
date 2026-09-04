package cz.burios.ux.darwin.db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;

import cz.burios.ux.darwin.db.DBContext;

public class DSLUpdate {
	private String tableName;
	private BasicRecord values;
	private String whereClause;
	private List<Object> whereParams = new ArrayList<>();

	public DSLUpdate update(String tableName) {
		this.tableName = tableName;
		return this;
	}

	public DSLUpdate set(BasicRecord record) {
		this.values = record;
		return this;
	}

	public DSLUpdate where(String condition, Object... params) {
		this.whereClause = condition;
		this.whereParams.clear();
		if (params != null) {
			for (Object p : params) {
				this.whereParams.add(p);
			}
		}
		return this;
	}

	public void execute() throws Exception {
		StringBuilder sql = new StringBuilder("UPDATE ").append(tableName).append(" SET ");
		List<Object> updateParams = new ArrayList<>();
		for (String col : values.keySet()) {
			sql.append(col).append("=?,");
			updateParams.add(values.get(col));
		}
		sql.setLength(sql.length() - 1);
		sql.append(" WHERE ").append(whereClause);

		try (Connection conn = DBContext.getDataSource().getConnection();
				PreparedStatement ps = conn.prepareStatement(sql.toString())) {
			int idx = 1;
			for (Object val : updateParams) {
				ps.setObject(idx++, val);
			}
			for (Object val : whereParams) {
				ps.setObject(idx++, val);
			}
			ps.executeUpdate();
		}
	}
}