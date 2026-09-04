package cz.burios.ux.darwin.db.dao;

public class DSL {

    public static DSLSelect select(Object... columns) {
        return new DSLSelect().select(columns);
    }

    public static DSLInsert insert(String tableName) {
        return new DSLInsert().insert(tableName);
    }

    public static DSLUpdate update(String tableName) {
        return new DSLUpdate().update(tableName);
    }

    public static DSLDelete delete(String tableName) {
        return new DSLDelete().delete(tableName);
    }
}