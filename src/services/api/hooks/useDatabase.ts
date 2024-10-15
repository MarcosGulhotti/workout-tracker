import * as SQLite from 'expo-sqlite/legacy';

export type SQLExecCallback =  (sql: string, args?: SQLite.SQLStatementArg[], successCallback?: SQLite.SQLStatementCallback, errorCallback?: SQLite.SQLStatementErrorCallback) => void;
export type SQLExecBatchCallback = (sqlStatements: { sql: string, args?: SQLite.SQLStatementArg[] }[], successCallback?: SQLite.SQLStatementCallback, errorCallback?: SQLite.SQLStatementErrorCallback) => void;

export function useDataBase() {
    const db = SQLite.openDatabase('workout_database');

    const executeSql: SQLExecCallback = (
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

    const executeSqlBatch: SQLExecBatchCallback = (
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