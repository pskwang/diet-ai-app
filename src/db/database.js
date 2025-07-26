import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('meals.db');

export const createTables = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        calories INTEGER
      );`,
      [],
      () => { console.log('테이블 생성 성공'); },
      (txObj, error) => { console.error('테이블 생성 실패', error); }
    );
  });
};

// 나머지 함수들도 위에서 만든 것처럼 작성

export const getMeals = (setMeals) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM meals;',
      [],
      (_, { rows: { _array } }) => {
        setMeals(_array);
      },
      (txObj, error) => {
        console.error('getMeals 오류:', error);
      }
    );
  });
};

export const deleteMeal = (id, onSuccess, onError) => {
  db.transaction(tx => {
    tx.executeSql(
      'DELETE FROM meals WHERE id = ?;',
      [id],
      () => {
        console.log(`id ${id} 식단 삭제 완료`);
        if (onSuccess) onSuccess();
      },
      (txObj, error) => {
        console.error('deleteMeal 오류:', error);
        if (onError) onError(error);
      }
    );
  });
};

export const addMeal = (name, calories, onSuccess, onError) => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO meals (name, calories) VALUES (?, ?);',
      [name, calories],
      () => {
        console.log('식단 추가 완료');
        if (onSuccess) onSuccess();
      },
      (txObj, error) => {
        console.error('addMeal 오류:', error);
        if (onError) onError(error);
      }
    );
  });
};
