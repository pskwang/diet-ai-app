import * as SQLite from 'expo-sqlite';

let db;

/**
 * 데이터베이스를 초기화하고 필요한 테이블을 생성합니다.
 */
export const initDatabase = async () => {
  try {
    // await SQLite.deleteDatabaseAsync('diet_ai_app.db');
    db = await SQLite.openDatabaseAsync('diet_ai_app.db');
    console.log('Database opened successfully.');
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // user_info 테이블 스키마 변경 (새로운 필드 추가)
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS user_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        target_weight REAL,
        gender TEXT,
        body_type TEXT,
        goal TEXT,
        period TEXT
      );`
    );
    console.log('User Info table created or already exists.');

    // exercises 테이블 스키마 변경 (새로운 필드 추가)
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        duration INTEGER,
        calories INTEGER,
        distance REAL,
        incline REAL,
        speed REAL,
        level INTEGER,
        sets INTEGER,
        reps INTEGER,
        weight REAL
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

    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

/**
 * 운동 기록을 추가합니다.
 */
export const addExercise = async (date, type, duration, calories, distance, incline, speed, level, sets, reps, weight) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(
      `INSERT INTO exercises (date, type, duration, calories, distance, incline, speed, level, sets, reps, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [date, type, duration, calories, distance, incline, speed, level, sets, reps, weight]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
};

/**
 * 모든 운동 기록을 가져옵니다.
 */
export const getExercises = async () => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const allRows = await db.getAllAsync(`SELECT * FROM exercises ORDER BY date DESC, id DESC;`);
    return allRows;
  } catch (error) {
    console.error('Error getting exercises:', error);
    throw error;
  }
};

/**
 * 특정 ID의 운동 기록을 삭제합니다.
 */
export const deleteExercise = async (id) => {
  if (!db) throw new Error('Database not initialized.');
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

/**
 * 식사 기록을 추가합니다.
 */
export const addMeal = async (date, type, food_name, quantity, calories, protein, carbs, fat) => {
  if (!db) throw new Error('Database not initialized.');
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
 * AI가 계산한 칼로리 및 영양 성분을 업데이트합니다.
 */
export const updateMealCalories = async (mealId, calories, protein, carbs, fat) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(
      `UPDATE meals SET calories = ?, protein = ?, carbs = ?, fat = ? WHERE id = ?;`,
      [calories, protein, carbs, fat, mealId]
    );
    return result.rowsAffected;
  } catch (error) {
    console.error(`Error updating meal ID ${mealId} calories:`, error);
    throw error;
  }
};

/**
 * 모든 식사 기록을 가져옵니다.
 */
export const getMeals = async () => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const allRows = await db.getAllAsync(`SELECT * FROM meals ORDER BY date DESC, id DESC;`);
    return allRows;
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
};

/**
 * 특정 ID의 식사 기록을 삭제합니다.
 */
export const deleteMeal = async (id) => {
  if (!db) throw new Error('Database not initialized.');
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

/**
 * 사용자 정보를 저장합니다. 기존 정보가 있으면 업데이트합니다.
 */
export const setUserInfo = async (height, weight, targetWeight, gender, bodyType, goal, period) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const existing = await db.getFirstAsync(`SELECT * FROM user_info LIMIT 1;`);
    if (existing) {
      await db.runAsync(
        `UPDATE user_info SET height = ?, weight = ?, target_weight = ?, gender = ?, body_type = ?, goal = ?, period = ? WHERE id = ?;`,
        [height, weight, targetWeight, gender, bodyType, goal, period, existing.id]
      );
    } else {
      await db.runAsync(
        `INSERT INTO user_info (height, weight, target_weight, gender, body_type, goal, period) VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [height, weight, targetWeight, gender, bodyType, goal, period]
      );
    }
  } catch (error) {
    console.error('Error saving user info:', error);
    throw error;
  }
};

/**
 * 사용자 정보를 가져옵니다.
 */
export const getUserInfo = async () => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.getFirstAsync(`SELECT * FROM user_info LIMIT 1;`);
    return result || null;
  } catch (error) {
    console.error('Error getting user info:', error);
    throw error;
  }
};
