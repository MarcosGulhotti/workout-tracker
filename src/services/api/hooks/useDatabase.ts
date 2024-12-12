import * as SQLite from 'expo-sqlite';

type SQLExec = {
    sql: string;
    args?: SQLite.SQLiteBindParams[];
}

export type SQLExecCallback = (args: SQLExec) => void;
export type SQLExecBatchCallback = (
    sqlStatements: { sql: string, args?: SQLite.SQLiteBindParams[] }[],
) => void;

export const database = SQLite.openDatabaseSync('workout_database');

export function useDataBase() {
    const executeSql: SQLExecCallback = ({
        sql,
        args
    }) => {
        const query = database.prepareSync(sql);

        return query.executeSync(args ?? []);
    };

    const executeSqlBatch: SQLExecBatchCallback = (
        sqlStatements: {
            sql: string,
            args?: SQLite.SQLiteBindParams[] | undefined,
        }[],
    ) => {

        sqlStatements.forEach(({ sql, args }) => {
            const query = database.prepareSync(sql);

            query.executeSync(args ?? []);
        });
    };

    return {
        executeSql,
        executeSqlBatch
    };
}
