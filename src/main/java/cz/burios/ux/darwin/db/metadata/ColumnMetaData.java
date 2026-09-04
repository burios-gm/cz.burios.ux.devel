package cz.burios.ux.darwin.db.metadata;

public class ColumnMetaData {
	
	public final String name;
	public final int dataType;
	public final String typeName;
	public final int size;
	public final boolean nullable;

	public ColumnMetaData(String name, int dataType, String typeName, int size, boolean nullable) {
		this.name = name;
		this.dataType = dataType;
		this.typeName = typeName;
		this.size = size;
		this.nullable = nullable;
	}
}