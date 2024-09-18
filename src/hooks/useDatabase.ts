import * as SQLite from 'expo-sqlite/legacy';

export function useDataBase() {
    const db = SQLite.openDatabase('workout_database');

    const executeSql = (
        sql: string,
        args: SQLite.SQLStatementArg[] = [],
        successCallback?: SQLite.SQLStatementCallback,
        errorCallback?: SQLite.SQLStatementErrorCallback
    ) => {
        return db.transaction((tx) => {
            tx.executeSql(
                sql,
                args,
                successCallback,
                errorCallback
            );
        });
    };

    const executeSqlBatch = (
        sqlStatements: {
            sql: string,
            args?: SQLite.SQLStatementArg[],
        }[],
        successCallback?: SQLite.SQLStatementCallback,
        errorCallback?: SQLite.SQLStatementErrorCallback
    ) => {
       return db.transaction((tx) => {
            sqlStatements.forEach(({ sql, args }) => {
                tx.executeSql(
                    sql,
                    args || []
                );
            }),
                successCallback,
                errorCallback
        });
    }

    return {
        executeSql,
        executeSqlBatch
    };
}