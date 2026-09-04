package cz.burios.ux.darwin.db.dao;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;

import cz.burios.ux.darwin.db.DBContext;

public class DSLDelete {
	
	private String tableName;
	private String whereClause;
	private List<Object> whereParams = new ArrayList<>();

	public DSLDelete delete(String tableName) {
		this.tableName = tableName;
		return this;
	}

	public DSLDelete where(String condition, Object... params) {
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
		String sql = "DELETE FROM " + tableName + " WHERE " + whereClause;
		try (Connection conn = DBContext.getDataSource().getConnection();
			PreparedStatement ps = conn.prepareStatement(sql)) {
			for (int i = 0; i < whereParams.size(); i++) {
				ps.setObject(i + 1, whereParams.get(i));
			}
			ps.executeUpdate();
		}
	}
}