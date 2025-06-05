import mysql from "mysql2/promise";

// // DB 접속 정보 (환경 변수에서 가져오기)
// // 이 값들은 Docker 실행 시 또는 서버 환경에 .env 파일 등으로 설정되어야 합니다.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
});

export async function queryDb<T extends mysql.RowDataPacket[]>(
  sql: string,
  params?: any[]
): Promise<T> {
  let connection;
  try {
    // 1. 풀에서 커넥션 가져오기
    connection = await pool.getConnection();

    // 2. SQL 쿼리 실행
    // connection.query<T>(sql, params)는 mysql2/promise 라이브러리의 타입 정의를 활용합니다.
    // SELECT 쿼리의 경우: T는 RowDataPacket[] (행 데이터 배열) 타입이 됩니다.
    const [results] = await connection.query<T>(sql, params);

    // 3. 결과 반환
    return results;
  } finally {
    // 4. 사용한 커넥션 반환 (에러 발생 여부와 관계없이 항상 실행)
    if (connection) {
      connection.release();
    }
  }
}

/*

// 헬퍼 함수: 특정 게시물 ID에 연결된 태그 목록 가져오기
async function getTagsForPost(postId: string): Promise<string[]> {
  const sql = `
    SELECT t.name
    FROM tags t
    INNER JOIN post_tags pt ON t.id = pt.tag_id
    WHERE pt.post_id = ?
  `;
  try {
    const results = await queryDb<RowDataPacket[]>(sql, [postId]);

    return results.map((tagRow: any) => tagRow.name);
  } 
}

//


*/

export default pool;

// // DB 접속 정보 (환경 변수에서 가져오기)
// // 이 값들은 Docker 실행 시 또는 서버 환경에 .env 파일 등으로 설정되어야 합니다.
// const dbConfig = {
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: parseInt(process.env.DB_PORT || "3306", 10),
// };

// // DB 커넥션 풀 생성 (*)
// // 애플리케이션 전체에서 이 풀을 사용하여 DB 커넥션을 얻습니다.
// //          => 커넥션을 열고 닫는 오버헤드를 줄일 수 있음
// let pool: mysql.Pool | null = null;

// // MySQL 커넥션 풀을 가져옵니다.
// // 풀이 아직 생성되지 않았다면 새로 생성하여 반환합니다. (=> 싱글톤 패턴).
// export function getDbPool(): mysql.Pool {
//   if (!pool) {
//     try {
//       // 환경 변수가 제대로 설정되었는지 간단히 확인
//       if (!dbConfig.host || !dbConfig.user || !dbConfig.database) {
//         console.error("DB 환경 변수를 확인해주세요.");
//         throw new Error(
//           "Database configuration is incomplete. Check environment variables."
//         );
//       }

//       pool = mysql.createPool({
//         ...dbConfig,
//         waitForConnections: true,
//         connectionLimit: 10, // 동시에 유지할 수 있는 최대 커넥션 수
//         queueLimit: 0, // connectionLimit에 도달했을 때 대기 큐의 최대 크기 (0은 무제한)
//         connectTimeout: 30000,
//       });
//       console.info("MySQL Connection Pool created successfully.");
//     } catch (error) {
//       console.error("Failed to create MySQL Connection Pool:", error);
//       // 에러를 다시 throw 하여 애플리케이션 초기화 단계에서 문제를 인지하도록 합니다.
//       throw new Error(
//         `Could not create database pool: ${
//           error instanceof Error ? error.message : String(error)
//         }`
//       );
//     }
//   }

//   // 이미 있으면 그거 반환
//   return pool;
// }

// /**
//  * DB 쿼리를 실행하는 헬퍼 함수입니다.
//  */
// export async function queryDb<
//   T extends mysql.RowDataPacket[] | mysql.OkPacket | mysql.ResultSetHeader
// >(sql: string, params?: any[]): Promise<T> {
//   const dbPool = getDbPool(); // 커넥션 풀 가져오기
//   let connection: mysql.PoolConnection | null = null;
//   try {
//     connection = await dbPool.getConnection(); // 풀에서 커넥션 가져오기
//     console.debug(
//       `Executing SQL: ${sql} with params: ${JSON.stringify(params)}`
//     );
//     const [results] = await connection.query<T>(sql, params);
//     return results;
//   } catch (error) {
//     console.error("DB Query Error:", error);
//     throw new Error(
//       `Database query failed: ${
//         error instanceof Error ? error.message : String(error)
//       }`
//     );
//   } finally {
//     if (connection) {
//       // 사용한 커넥션 반환
//       connection.release();
//     }
//   }
// }

// // 애플리케이션 종료 시 커넥션 풀을 닫는 함수
// // Next.js 환경에서는 명시적으로 호출할 필요가 없을 수 있음 (그니까 테스트에서 사용)
// export async function closeDbPool(): Promise<void> {
//   if (pool) {
//     try {
//       await pool.end();
//       pool = null;
//       console.info("MySQL Connection Pool closed successfully.");
//     } catch (error) {
//       console.error("Failed to close MySQL Connection Pool:", error);
//       throw error;
//     }
//   }
// }

// // src/lib/db.ts 에 임시 테스트 함수 추가
// export async function testDbConnection() {
//   console.log("!!!!!!!!!!!!!! Attempting to connect with config:", dbConfig);
//   let connection;
//   try {
//     connection = await mysql.createConnection(dbConfig);
//     console.log(
//       "!!!!!!!!!!!!!! Successfully connected to the database for test."
//     );
//     const [rows] = await connection.execute("SELECT 1 AS result");
//     console.log("!!!!!!!!!!!!!! Test query result:", (rows as any)[0].result);
//   } catch (error) {
//     console.error("!!!!!!!!!!!!!! Database connection test failed:", error);
//   } finally {
//     if (connection) {
//       await connection.end();
//       console.log("!!!!!!!!!!!!!! Test connection closed.");
//     }
//   }
// }
// // 이 함수를 서버 시작 시점이나 특정 API 라우트에서 호출하여 테스트
// // 예: src/app/page.tsx (서버 컴포넌트) 상단에서 testDbConnection(); 호출
