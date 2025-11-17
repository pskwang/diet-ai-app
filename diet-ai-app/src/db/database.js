// src/db/database.js
import * as SQLite from 'expo-sqlite';

let db = null; // 데이터베이스 연결 객체

/**
 * DB 초기화 함수
 */
export const initDatabase = async () => {
  if (db) return db; // 이미 초기화된 경우 재사용
  try {
    db = await SQLite.openDatabaseAsync('diet_ai_app.db');
    console.log('✅ Database opened successfully.');
    await db.execAsync(`PRAGMA journal_mode = WAL;`);

    // user_info 테이블
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS user_info (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        height REAL NOT NULL,
        weight REAL NOT NULL,
        target_weight REAL,
        gender TEXT,
        body_type TEXT,
        goal TEXT,
        period TEXT
      );
    `);

    // exercises 테이블
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS exercises (
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
      );
    `);

    // meals 테이블
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        type TEXT NOT NULL,
        food_name TEXT NOT NULL,
        quantity TEXT,
        calories INTEGER,
        protein REAL,
        carbs REAL,
        fat REAL
      );
    `);

    // videos 테이블
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        thumbnail TEXT,
        url TEXT
      );
    `);

    // users 테이블
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );
    `);

    console.log('✅ All tables created or already exist.');
    return db;
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
};

const checkDbInitialized = () => {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
};

/* ------------------ 사용자 정보 ------------------ */
export const setUserInfo = async (height, weight, targetWeight, gender, bodyType, goal, period) => {
  checkDbInitialized();
  try {
    const existing = await db.getFirstAsync(`SELECT * FROM user_info LIMIT 1;`);
    if (existing) {
      await db.runAsync(`
        UPDATE user_info
        SET height=?, weight=?, target_weight=?, gender=?, body_type=?, goal=?, period=?
        WHERE id=?;
      `, [height, weight, targetWeight, gender, bodyType, goal, period, existing.id]);
      console.log('✅ User Info updated.');
    } else {
      await db.runAsync(`
        INSERT INTO user_info (height, weight, target_weight, gender, body_type, goal, period)
        VALUES (?, ?, ?, ?, ?, ?, ?);
      `, [height, weight, targetWeight, gender, bodyType, goal, period]);
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
    return result || null;
  } catch (error) {
    console.error('❌ Error getting user info:', error);
    throw error;
  }
};

/* ------------------ 운동 기록 ------------------ */
export const addExercise = async (date, type, duration, calories, distance, incline, speed, level, sets, reps, weight) => {
  checkDbInitialized();
  const result = await db.runAsync(`
    INSERT INTO exercises (date,type,duration,calories,distance,incline,speed,level,sets,reps,weight)
    VALUES (?,?,?,?,?,?,?,?,?,?,?);
  `, [date,type,duration,calories,distance,incline,speed,level,sets,reps,weight]);
  return result.lastInsertRowId;
};

export const getExercises = async () => {
  checkDbInitialized();
  return await db.getAllAsync(`SELECT * FROM exercises ORDER BY date DESC, id DESC;`);
};

export const deleteExercise = async (id) => {
  checkDbInitialized();
  const result = await db.runAsync(`DELETE FROM exercises WHERE id=?;`, [id]);
  return result.rowsAffected;
};

/* ------------------ 식사 기록 ------------------ */
export const addMeal = async (date, type, food_name, quantity, calories, protein, carbs, fat) => {
  checkDbInitialized();
  const result = await db.runAsync(`
    INSERT INTO meals (date,type,food_name,quantity,calories,protein,carbs,fat)
    VALUES (?,?,?,?,?,?,?,?);
  `, [date,type,food_name,quantity,calories,protein,carbs,fat]);
  return result.lastInsertRowId;
};

export const getMeals = async () => {
  checkDbInitialized();
  return await db.getAllAsync(`SELECT * FROM meals ORDER BY date DESC, id DESC;`);
};

export const deleteMeal = async (id) => {
  checkDbInitialized();
  const result = await db.runAsync(`DELETE FROM meals WHERE id=?;`, [id]);
  return result.rowsAffected;
};

/* ------------------ 유저 관리 ------------------ */
export const addUser = async (email, password) => {
  checkDbInitialized();
  // 가입 전 중복 확인
  const existing = await getUserByEmail(email);
  if (existing) throw new Error('이미 등록된 이메일입니다.');
  const result = await db.runAsync(`INSERT INTO users (email,password) VALUES (?,?);`, [email,password]);
  return result.lastInsertRowId;
};

export const getUserByEmail = async (email) => {
  checkDbInitialized();
  return await db.getFirstAsync(`SELECT * FROM users WHERE email=?;`, [email]);
};

export const deleteUser = async (id) => {
  checkDbInitialized();
  const result = await db.runAsync(`DELETE FROM users WHERE id=?;`, [id]);
  return result.rowsAffected;
};

/* ------------------ 유튜브 영상 ------------------ */
export const addVideo = async (title, category, thumbnail, url) => {
  checkDbInitialized();
  const result = await db.runAsync(`
    INSERT INTO videos (title,category,thumbnail,url)
    VALUES (?,?,?,?);
  `, [title,category,thumbnail,url]);
  return result.lastInsertRowId;
};

export const getVideos = async (category) => {
  checkDbInitialized();
  return await db.getAllAsync(`SELECT * FROM videos WHERE category=? ORDER BY id DESC;`, [category]);
};

export const deleteVideo = async (id) => {
  checkDbInitialized();
  const result = await db.runAsync(`DELETE FROM videos WHERE id=?;`, [id]);
  return result.rowsAffected;
};
