import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('diet.db');

// ✅ 테이블 생성 (앱 처음 실행 시 1회만 호출)
export const createTables = () => {
  db.transaction(tx => {
    // 식단 테이블
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        calories INTEGER
      );`
    );

    // 운동 테이블
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        duration INTEGER
      );`
    );
  });
};

// ✅ 식단 추가
export const insertMeal = (name, calories) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO meals (name, calories) VALUES (?, ?);',
      [name, calories]
    );
  });
};

// ✅ 운동 추가
export const insertExercise = (name, duration) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO exercises (name, duration) VALUES (?, ?);',
      [name, duration]
    );
  });
};

// ✅ 식단 조회
export const getMeals = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM meals;',
      [],
      (_, { rows }) => callback(rows._array)
    );
  });
};

// ✅ 운동 조회
export const getExercises = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM exercises;',
      [],
      (_, { rows }) => callback(rows._array)
    );
  });
};
