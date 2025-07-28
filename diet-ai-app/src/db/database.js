// src/db/database.js 파일 상단 변경
import { openDatabase } from 'expo-sqlite';

// 그리고 db 변수 선언 시 openDatabase를 바로 사용
const db = openDatabase('diet_ai_app.db');
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // exercises 테이블 생성
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          type TEXT NOT NULL,
          duration INTEGER,
          calories INTEGER
        );`,
        [],
        () => {
          console.log('Exercises table created or already exists.');
          // meals 테이블 생성
          tx.executeSql(
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
            );`,
            [],
            () => {
              console.log('Meals table created or already exists.');
              resolve();
            },
            (_, error) => {
              console.error('Error creating meals table:', error);
              reject(error);
            }
          );
        },
        (_, error) => {
          console.error('Error creating exercises table:', error);
          reject(error);
        }
      );
    });
  });
};

// --- Exercises 테이블 관련 함수 ---

export const addExercise = (date, type, duration, calories) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO exercises (date, type, duration, calories) VALUES (?, ?, ?, ?);`,
        [date, type, duration, calories],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getExercises = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM exercises ORDER BY date DESC;`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteExercise = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM exercises WHERE id = ?;`,
        [id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

// --- Meals 테이블 관련 함수 ---

export const addMeal = (date, type, food_name, quantity, calories, protein, carbs, fat) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO meals (date, type, food_name, quantity, calories, protein, carbs, fat) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
        [date, type, food_name, quantity, calories, protein, carbs, fat],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getMeals = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM meals ORDER BY date DESC;`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteMeal = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM meals WHERE id = ?;`,
        [id],
        (_, result) => resolve(result.rowsAffected),
        (_, error) => reject(error)
      );
    });
  });
};

