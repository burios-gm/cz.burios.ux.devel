package cz.burios.ux.darwin.db.metadata;

import java.util.Collections;
import java.util.List;

public class TableMetaData {
	
	public final String name;
	public final List<ColumnMetaData> columns;

	public TableMetaData(String name, List<ColumnMetaData> columns) {
		this.name = name;
		this.columns = Collections.unmodifiableList(columns);
	}
}