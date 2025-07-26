import * as SQLite from 'expo-sqlite';

let db; // 데이터베이스 객체를 저장할 변수

// 데이터베이스 초기화 함수: Promise를 반환하여 외부에서 await 가능하도록 함
export const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    try {
      // 데이터베이스 열기 시도
      db = SQLite.openDatabase('diet.db');
      console.log('✅ DB 열기 시도: diet.db');

      // 트랜잭션을 사용하여 테이블 생성
      db.transaction(
        tx => {
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS meals (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              date TEXT,
              mealType TEXT,
              food TEXT,
              calories INTEGER
            );`,
            [], // SQL 인자 없음
            () => {
              console.log('✅ 테이블 생성 완료');
              resolve(); // 테이블 생성 성공 시 Promise resolve
            },
            (_, error) => {
              console.error('❌ 테이블 생성 실패:', error);
              reject(error); // 테이블 생성 실패 시 Promise reject
              return false; // 트랜잭션 롤백
            }
          );
        },
        (error) => { // 트랜잭션 자체 실패 시 (예: DB 열기 실패)
          console.error('❌ DB 트랜잭션 오류:', error);
          reject(error); // 트랜잭션 오류 시 Promise reject
        },
        () => { // 트랜잭션 성공 콜백 (executeSql 성공 콜백과 함께 호출됨)
          console.log('✅ DB 트랜잭션 커밋 완료');
          // resolve()는 executeSql 성공 콜백에서 이미 호출됨
        }
      );
    } catch (error) {
      // openDatabase 호출 자체가 실패했을 때 (예: SQLite가 정의되지 않았을 때)
      console.error('❌ initDatabase 함수 자체에서 오류 발생 (SQLite.openDatabase 문제):', error);
      reject(error); // initDatabase 실패 시 Promise reject
    }
  });
};

// 식단 추가 함수 (Promise 반환)
export const insertMeal = (meal) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      const error = new Error('DB가 초기화되지 않았습니다. 식단 추가 실패.');
      console.error('❌ ' + error.message);
      reject(error);
      return;
    }
    db.transaction(tx => {
      tx.executeSql(
        `INSERT INTO meals (date, mealType, food, calories) VALUES (?, ?, ?, ?);`,
        [meal.date, meal.mealType, meal.food, meal.calories],
        (_, result) => {
          console.log('✅ 식단 추가 성공');
          resolve(result); // 성공 시 Promise resolve
        },
        (_, error) => {
          console.error('❌ 식단 추가 실패:', error);
          reject(error); // 실패 시 Promise reject
          return false; // 트랜잭션 롤백
        }
      );
    });
  });
};

// 전체 식단 가져오기 함수 (Promise 반환)
export const getMeals = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      const error = new Error('DB가 초기화되지 않았습니다. 식단 조회 실패.');
      console.error('❌ ' + error.message);
      reject(error);
      return;
    }
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM meals ORDER BY id DESC;', // 최신 항목이 먼저 오도록 정렬
        [],
        (_, { rows }) => {
          console.log('✅ 식단 조회 성공');
          resolve(rows._array); // 성공 시 Promise resolve
        },
        (_, error) => {
          console.error('❌ 식단 조회 실패:', error);
          reject(error); // 실패 시 Promise reject
          return false;
        }
      );
    });
  });
};

// 식단 삭제 함수 (Promise 반환)
export const deleteMeal = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      const error = new Error('DB가 초기화되지 않았습니다. 식단 삭제 실패.');
      console.error('❌ ' + error.message);
      reject(error);
      return;
    }
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM meals WHERE id = ?;',
        [id],
        (_, result) => {
          console.log('✅ 식단 삭제 성공');
          resolve(result); // 성공 시 Promise resolve
        },
        (_, error) => {
          console.error('❌ 식단 삭제 실패:', error);
          reject(error); // 실패 시 Promise reject
          return false;
        }
      );
    });
  });
};
