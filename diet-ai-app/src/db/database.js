// src/db/database.js
import { openDatabase } from 'expo-sqlite'; // 이렇게 변경

const db = openDatabase('meals.db'); // SQLite. 없이 바로 사용
// 한 번에 테이블 생성 함수
export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        calories INTEGER
      );`,
      [],
      () => console.log('meals table created or exists'),
      (_, error) => { console.error('Error creating meals table:', error); return true; }
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        duration INTEGER,
        calories INTEGER
      );`,
      [],
      () => console.log('exercises table created or exists'),
      (_, error) => { console.error('Error creating exercises table:', error); return true; }
    );
  });
};

// meals 관련 함수
export const insertMeal = (name, calories, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO meals (name, calories) VALUES (?, ?)',
      [name, calories],
      (_, result) => callback(result),
      (_, error) => { console.error('Error inserting meal:', error); return true; }
    );
  });
};

export const getMeals = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM meals',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => { console.error('Error fetching meals:', error); return true; }
    );
  });
};

export const deleteMeal = (id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM meals WHERE id = ?',
      [id],
      (_, result) => {
        console.log(`Meal ${id} deleted.`);
        if(callback) callback(result);
      },
      (_, error) => { console.error('Error deleting meal:', error); return true; }
    );
  });
};

// exercises 관련 함수
export const insertExercise = (name, duration, calories, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO exercises (name, duration, calories) VALUES (?, ?, ?)',
      [name, duration, calories],
      (_, result) => callback(result),
      (_, error) => { console.error('Error inserting exercise:', error); return true; }
    );
  });
};

export const getExercises = (callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM exercises',
      [],
      (_, { rows: { _array } }) => callback(_array),
      (_, error) => { console.error('Error fetching exercises:', error); return true; }
    );
  });
};

export const deleteExercise = (id, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM exercises WHERE id = ?',
      [id],
      (_, result) => {
        console.log(`Exercise ${id} deleted.`);
        if(callback) callback(result);
      },
      (_, error) => { console.error('Error deleting exercise:', error); return true; }
    );
  });
};
