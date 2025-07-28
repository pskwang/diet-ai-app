import * as SQLite from 'expo-sqlite';

// db 변수를 전역으로 선언하지 않고, initDatabase 함수에서 반환하도록 변경
let db;

/**
 * 데이터베이스를 초기화하고 필요한 테이블을 생성합니다.
 * 이 함수는 앱 시작 시 한 번만 호출되어야 합니다.
 * @returns {Promise<SQLite.SQLiteDatabase>} 초기화된 데이터베이스 인스턴스
 */
export const initDatabase = async () => {
  try {
    // 데이터베이스를 비동기적으로 엽니다.
    db = await SQLite.openDatabaseAsync('diet_ai_app.db');
    console.log('Database opened successfully.');

    // PRAGMA journal_mode = WAL; 설정은 성능 향상에 도움이 됩니다.
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // 트랜잭션 내에서 테이블 생성 작업을 수행합니다.
    await db.withTransactionAsync(async () => {
      // exercises 테이블 생성
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          duration INTEGER,
          calories INTEGER
        );`
      );
      console.log('Exercises table created or already exists.');

      // meals 테이블 생성
      await db.runAsync(
        `CREATE TABLE IF NOT EXISTS meals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          food_name TEXT NOT NULL,
          quantity REAL,
          calories INTEGER,
          protein REAL,
          carbs REAL,
          fat REAL
        );`
      );
      console.log('Meals table created or already exists.');
    });

    return db; // 초기화된 db 인스턴스를 반환합니다.
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error; // 에러를 다시 throw하여 호출자에게 알립니다.
  }
};

// --- Exercises 테이블 관련 함수 ---

/**
 * 운동 기록을 추가합니다.
 * @param {string} date - 운동 날짜 (YYYY-MM-DD)
 * @param {string} type - 운동 종류
 * @param {number} duration - 운동 시간 (분)
 * @param {number} calories - 소모 칼로리
 * @returns {Promise<number>} 추가된 기록의 ID
 */
export const addExercise = async (date, type, duration, calories) => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  try {
    const result = await db.runAsync(
      `INSERT INTO exercises (date, type, duration, calories) VALUES (?, ?, ?, ?);`,
      [date, type, duration, calories]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
};

/**
 * 모든 운동 기록을 가져옵니다.
 * @returns {Promise<Array<Object>>} 운동 기록 배열
 */
export const getExercises = async () => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  try {
    // orderBy()는 인덱스 누락으로 런타임 오류를 일으킬 수 있으므로,
    // 데이터를 가져온 후 JavaScript에서 정렬하는 것이 안전합니다.
    const allRows = await db.getAllAsync(`SELECT * FROM exercises;`);
    // 날짜를 기준으로 내림차순 정렬 (최신 날짜가 먼저 오도록)
    return allRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting exercises:', error);
    throw error;
  }
};

/**
 * 특정 ID의 운동 기록을 삭제합니다.
 * @param {number} id - 삭제할 운동 기록의 ID
 * @returns {Promise<number>} 삭제된 행의 수
 */
export const deleteExercise = async (id) => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  try {
    const result = await db.runAsync(
      `DELETE FROM exercises WHERE id = ?;`,
      [id]
    );
    return result.rowsAffected;
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
};

// --- Meals 테이블 관련 함수 ---

/**
 * 식사 기록을 추가합니다.
 * @param {string} date - 식사 날짜 (YYYY-MM-DD)
 * @param {string} type - 식사 종류 (아침, 점심, 저녁, 간식 등)
 * @param {string} food_name - 음식 이름
 * @param {number} quantity - 수량
 * @param {number} calories - 칼로리
 * @param {number} protein - 단백질 (g)
 * @param {number} carbs - 탄수화물 (g)
 * @param {number} fat - 지방 (g)
 * @returns {Promise<number>} 추가된 기록의 ID
 */
export const addMeal = async (date, type, food_name, quantity, calories, protein, carbs, fat) => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  try {
    const result = await db.runAsync(
      `INSERT INTO meals (date, type, food_name, quantity, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [date, type, food_name, quantity, calories, protein, carbs, fat]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};

/**
 * 모든 식사 기록을 가져옵니다.
 * @returns {Promise<Array<Object>>} 식사 기록 배열
 */
export const getMeals = async () => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  try {
    // orderBy()는 인덱스 누락으로 런타임 오류를 일으킬 수 있으므로,
    // 데이터를 가져온 후 JavaScript에서 정렬하는 것이 안전합니다.
    const allRows = await db.getAllAsync(`SELECT * FROM meals;`);
    // 날짜를 기준으로 내림차순 정렬 (최신 날짜가 먼저 오도록)
    return allRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
};

/**
 * 특정 ID의 식사 기록을 삭제합니다.
 * @param {number} id - 삭제할 식사 기록의 ID
 * @returns {Promise<number>} 삭제된 행의 수
 */
export const deleteMeal = async (id) => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  try {
    const result = await db.runAsync(
      `DELETE FROM meals WHERE id = ?;`,
      [id]
    );
    return result.rowsAffected;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};
