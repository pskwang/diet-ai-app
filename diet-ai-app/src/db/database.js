import * as SQLite from 'expo-sqlite';

let db; // 데이터베이스 연결 객체 (전역 변수)

/**
 * 데이터베이스를 초기화하고 필요한 모든 테이블을 생성합니다.
 * (users 테이블 생성 로직을 여기에 포함하여 초기화 안정성을 높였습니다.)
 */
export const initDatabase = async () => {
  try {
    // 1. 데이터베이스 파일 열기/생성
    db = await SQLite.openDatabaseAsync('diet_ai_app.db');
    console.log('✅ Database opened successfully.');
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // 2. user_info 테이블 생성
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

    // 3. exercises 테이블 생성
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

    // 4. meals 테이블 생성
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

    // 5. videos 테이블 생성 (유튜브 URL 포함)
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

    // 6. users 테이블 생성 (로그인/회원가입용)
    await db.runAsync(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );`
    );
    console.log('✅ Users table created or already exists.');


    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

/* ---------------------------- 운동 관련 ---------------------------- */

const checkDbInitialized = () => {
    if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
};

export const addExercise = async (date, type, duration, calories, distance, incline, speed, level, sets, reps, weight) => {
  checkDbInitialized();
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
  checkDbInitialized();
  try {
    const result = await db.runAsync(`UPDATE exercises SET calories = ? WHERE id = ?;`, [calories, exerciseId]);
    return result.rowsAffected;
  } catch (error) {
    console.error(`Error updating exercise ID ${exerciseId} calories:`, error);
    throw error;
  }
};

export const getExercises = async () => {
  checkDbInitialized();
  try {
    // getAllAsync는 DB가 연결되어 있으면 오류 없이 데이터를 가져와야 합니다.
    const allRows = await db.getAllAsync(`SELECT * FROM exercises ORDER BY date DESC, id DESC;`);
    return allRows;
  } catch (error) {
    console.error('Error getting exercises:', error);
    throw error;
  }
};

export const deleteExercise = async (id) => {
  checkDbInitialized();
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
  checkDbInitialized();
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
  checkDbInitialized();
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
  checkDbInitialized();
  try {
    const allRows = await db.getAllAsync(`SELECT * FROM meals ORDER BY date DESC, id DESC;`);
    return allRows;
  } catch (error) {
    console.error('Error getting meals:', error);
    throw error;
  }
};

export const deleteMeal = async (id) => {
  checkDbInitialized();
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
  checkDbInitialized();
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
  checkDbInitialized();
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
  checkDbInitialized();
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
  checkDbInitialized();
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
  checkDbInitialized();
  try {
    const result = await db.runAsync(`DELETE FROM videos WHERE id = ?;`, [id]);
    return result.rowsAffected;
  } catch (error) {
    console.error('❌ Error deleting video:', error);
    throw error;
  }
};
      
/* ---------------------------- 로그인 / 회원가입 ---------------------------- */

// ⚠️ 참고: initUsersTable 함수는 initDatabase에 통합되어 삭제되었습니다.

/**
 * 회원가입
 */
export const addUser = async (email, password) => {
  checkDbInitialized();
  try {
    const result = await db.runAsync(
      `INSERT INTO users (email, password) VALUES (?, ?);`,
      [email, password]
    );
    console.log('✅ User registered:', email);
    return result.lastInsertRowId;
  } catch (error) {
    console.error('❌ Error adding user:', error);
    // Unique 제약조건 오류 (이미 존재하는 이메일)는 여기서 발생할 수 있습니다.
    throw error; 
  }
};

/**
 * 이메일로 사용자 조회 (로그인 확인용)
 */
export const getUserByEmail = async (email) => {
  checkDbInitialized();
  try {
    const user = await db.getFirstAsync(
      `SELECT * FROM users WHERE email = ?;`,
      [email]
    );
    return user || null;
  } catch (error) {
    console.error('❌ Error fetching user by email:', error);
    throw error;
  }
};

/**
 * 사용자 삭제 (옵션)
 */
export const deleteUser = async (id) => {
  checkDbInitialized();
  try {
    const result = await db.runAsync(`DELETE FROM users WHERE id = ?;`, [id]);
    return result.rowsAffected;
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
};