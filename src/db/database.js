import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('diet.db');

// 테이블 생성 함수
export const createTables = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        mealType TEXT,
        food TEXT,
        calories INTEGER
      );`,
      [],
      () => console.log('테이블 생성 성공'),
      (_, error) => {
        console.error('테이블 생성 실패:', error);
        return false;
      }
    );
    // 필요하면 운동 기록 테이블 등 다른 테이블 생성도 여기에 추가
  });
};

// 식단 추가 함수
export const insertMeal = (meal, successCallback = () => {}, errorCallback = () => {}) => {
  db.transaction((tx) => {
    tx.executeSql(
      `INSERT INTO meals (date, mealType, food, calories) VALUES (?, ?, ?, ?);`,
      [meal.date, meal.mealType, meal.food, meal.calories],
      (_, result) => successCallback(result),
      (_, error) => {
        console.error('식단 추가 오류:', error);
        errorCallback(error);
        return false;
      }
    );
  });
};

// 전체 식단 가져오기 함수
export const getMeals = (callback = () => {}, errorCallback = () => {}) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM meals;',
      [],
      (_, { rows }) => callback(rows._array),
      (_, error) => {
        console.error('식단 조회 오류:', error);
        errorCallback(error);
        return false;
      }
    );
  });
};

// 식단 삭제 함수
export const deleteMeal = (id, successCallback = () => {}, errorCallback = () => {}) => {
  db.transaction((tx) => {
    tx.executeSql(
      'DELETE FROM meals WHERE id = ?;',
      [id],
      (_, result) => successCallback(result),
      (_, error) => {
        console.error('식단 삭제 오류:', error);
        errorCallback(error);
        return false;
      }
    );
  });
};
