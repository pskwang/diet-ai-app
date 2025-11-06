import * as SQLite from 'expo-sqlite';

let db;

/**
 * 데이터베이스를 초기화하고 필요한 테이블을 생성합니다.
 */
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('diet_ai_app.db');
    console.log('✅ Database opened successfully.');
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // user_info 테이블
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
    console.log('✅ User Info table created or already exists.');

    // exercises 테이블
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
    console.log('✅ Exercises table created or already exists.');

    // meals 테이블
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        food_name TEXT NOT NULL,
        quantity TEXT,
        calories INTEGER,
        protein REAL,
        carbs REAL,
        fat REAL
      );`
    );
    console.log('✅ Meals table created or already exists.');

    // ✅ videos 테이블 (유튜브 URL 포함)
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        thumbnail TEXT,
        url TEXT
      );`
    );
    console.log('✅ Videos table created or already exists.');

    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

/* ---------------------------- 운동 관련 ---------------------------- */

export const addExercise = async (date, type, duration, calories, distance, incline, speed, level, sets, reps, weight) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(
      `INSERT INTO exercises (date, type, duration, calories, distance, incline, speed, level, sets, reps, weight)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [date, type, duration, calories, distance, incline, speed, level, sets, reps, weight]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding exercise:', error);
    throw error;
  }
};

export const updateExerciseCalories = async (exerciseId, calories) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(`UPDATE exercises SET calories = ? WHERE id = ?;`, [calories, exerciseId]);
    return result.rowsAffected;
  } catch (error) {
    console.error(`Error updating exercise ID ${exerciseId} calories:`, error);
    throw error;
  }
};

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

export const deleteExercise = async (id) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(`DELETE FROM exercises WHERE id = ?;`, [id]);
    return result.rowsAffected;
  } catch (error) {
    console.error('Error deleting exercise:', error);
    throw error;
  }
};

/* ---------------------------- 식사 관련 ---------------------------- */

export const addMeal = async (date, type, food_name, quantity, calories, protein, carbs, fat) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(
      `INSERT INTO meals (date, type, food_name, quantity, calories, protein, carbs, fat)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [date, type, food_name, quantity, calories, protein, carbs, fat]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding meal:', error);
    throw error;
  }
};

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

export const deleteMeal = async (id) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(`DELETE FROM meals WHERE id = ?;`, [id]);
    return result.rowsAffected;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

/* ---------------------------- 사용자 정보 ---------------------------- */

export const setUserInfo = async (height, weight, targetWeight, gender, bodyType, goal, period) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const existing = await db.getFirstAsync(`SELECT * FROM user_info LIMIT 1;`);
    if (existing) {
      await db.runAsync(
        `UPDATE user_info SET height = ?, weight = ?, target_weight = ?, gender = ?, body_type = ?, goal = ?, period = ? WHERE id = ?;`,
        [height, weight, targetWeight, gender, bodyType, goal, period, existing.id]
      );
      console.log('✅ User Info updated.');
    } else {
      await db.runAsync(
        `INSERT INTO user_info (height, weight, target_weight, gender, body_type, goal, period)
         VALUES (?, ?, ?, ?, ?, ?, ?);`,
        [height, weight, targetWeight, gender, bodyType, goal, period]
      );
      console.log('✅ User Info inserted.');
    }
  } catch (error) {
    console.error('❌ Error saving user info:', error);
    throw error;
  }
};

export const getUserInfo = async () => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.getFirstAsync(`SELECT * FROM user_info LIMIT 1;`);
    if (result) console.log('✅ User Info loaded:', result);
    else console.log('ℹ️ No User Info found.');
    return result || null;
  } catch (error) {
    console.error('❌ Error getting user info:', error);
    throw error;
  }
};

/* ---------------------------- 유튜브 영상 관련 ---------------------------- */

/**
 * 영상 정보를 추가합니다.
 */
export const addVideo = async (title, category, thumbnail, url) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(
      `INSERT INTO videos (title, category, thumbnail, url)
       VALUES (?, ?, ?, ?);`,
      [title, category, thumbnail, url]
    );
    console.log('✅ Video added:', title);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('❌ Error adding video:', error);
    throw error;
  }
};

/**
 * 카테고리별 영상을 가져옵니다.
 */
export const getVideos = async (category) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.getAllAsync(
      `SELECT * FROM videos WHERE category = ? ORDER BY id DESC;`,
      [category]
    );
    return result;
  } catch (error) {
    console.error('❌ Error getting videos:', error);
    throw error;
  }
};

/**
 * 특정 영상 삭제
 */
export const deleteVideo = async (id) => {
  if (!db) throw new Error('Database not initialized.');
  try {
    const result = await db.runAsync(`DELETE FROM videos WHERE id = ?;`, [id]);
    return result.rowsAffected;
  } catch (error) {
    console.error('❌ Error deleting video:', error);
    throw error;
  }
};
      