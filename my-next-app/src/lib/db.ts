import mysql, { RowDataPacket } from "mysql2/promise";

// DB 접속 정보 (env 환경 변수에서 가져오기)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || "3306", 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 데이터베이스 연결 테스트 함수
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('✅ 데이터베이스 연결 성공');
    return true;
  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error);
    console.error('HOST', process.env.DB_HOST)
    console.error('USER', process.env.DB_USER)
    console.error('PWD', process.env.DB_PASSWORD)
    console.error('DB', process.env.DB_NAME)
    console.error('PORT', process.env.DB_PORT)

    return false;
  }
}

type QueryParam = string | number | boolean | null;

// 쿼리 실행 함수 (타입 안전성 보장)
export async function executeQuery<T extends RowDataPacket>(
  query: string,
  params: QueryParam[] = []
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('쿼리 실행 오류:', error);
    throw new Error(`Database query failed: ${error}`);
  }
}

export default pool;
