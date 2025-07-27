// src/db/database.js
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('meals.db');

export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        calories INTEGER
      );`
    );
  });
};

export const insertMeal = (name, calories, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO meals (name, calories) VALUES (?, ?)',
      [name, calories],
      (_, result) => callback(result),
      (_, error) => console.error(error)
    );
  });
};

export const getMeals = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM meals',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.error(error)
    );
  });
};

export const deleteMeal = (id) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM meals WHERE id = ?',
      [id],
      () => console.log(`Meal ${id} deleted.`),
      (_, error) => console.error(error)
    );
  });
};
// 운동 테이블도 만들기
export const createExerciseTable = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        duration INTEGER,
        calories INTEGER
      );`
    );
  });
};

// 운동 추가
export const insertExercise = (name, duration, calories, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO exercises (name, duration, calories) VALUES (?, ?, ?)',
      [name, duration, calories],
      (_, result) => callback(result),
      (_, error) => console.error(error)
    );
  });
};

// 운동 불러오기
export const getExercises = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM exercises',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => console.error(error)
    );
  });
};

// 운동 삭제
export const deleteExercise = (id) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM exercises WHERE id = ?',
      [id],
      () => console.log(`Exercise ${id} deleted.`),
      (_, error) => console.error(error)
    );
  });
};
