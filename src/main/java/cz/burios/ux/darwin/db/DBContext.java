package cz.burios.ux.darwin.db;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import javax.sql.DataSource;

import cz.burios.ux.darwin.db.metadata.ColumnMetaData;
import cz.burios.ux.darwin.db.metadata.TableMetaData;

public class DBContext {

	private static DataSource dataSource;
	private static final Map<String, TableMetaData> tables = new LinkedHashMap<>();

	public static void setDataSource(DataSource ds) {
		dataSource = ds;
	}

	public static DataSource getDataSource() {
		return dataSource;
	}

	public static Connection getConnection() throws Exception {
		return dataSource.getConnection();
	}

	public static void addTable(TableMetaData table) {
		tables.put(table.name, table);
	}

	public static TableMetaData getTable(String name) {
		return tables.get(name);
	}

	public static Collection<TableMetaData> getTables() {
		return tables.values();
	}

	public static void initialize() throws Exception {
		try (Connection conn = getConnection()) {
			DatabaseMetaData meta = conn.getMetaData();
			try (ResultSet rsTables = meta.getTables(conn.getCatalog(), null, "%", new String[] { "TABLE" })) {
				while (rsTables.next()) {
					String tableName = rsTables.getString("TABLE_NAME");
					List<ColumnMetaData> cols = new ArrayList<>();
					try (ResultSet rsCols = meta.getColumns(conn.getCatalog(), null, tableName, "%")) {
						while (rsCols.next()) {
							cols.add(new ColumnMetaData(
									rsCols.getString("COLUMN_NAME"), 
									rsCols.getInt("DATA_TYPE"),
									rsCols.getString("TYPE_NAME"), 
									rsCols.getInt("COLUMN_SIZE"),
									"YES".equalsIgnoreCase(rsCols.getString("IS_NULLABLE"))));
						}
					}
					addTable(new TableMetaData(tableName, cols));
				}
			}
		}
	}
}