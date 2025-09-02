import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform, TouchableOpacity, ScrollView } from 'react-native';
import { addExercise } from '../../../src/db/database';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ExerciseInputScreen() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [incline, setIncline] = useState('');
  const [speed, setSpeed] = useState('');
  const [level, setLevel] = useState('');
  const [exerciseType, setExerciseType] = useState('유산소');
  const [muscleGroup, setMuscleGroup] = useState('가슴');
  const router = useRouter();

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const formattedDate = date.toISOString().split('T')[0];

  const handleAddExercise = async () => {
    if (exerciseType === '유산소') {
      if (!type) {
        Alert.alert('오류', '운동 종류를 선택해주세요.');
        return;
      }
      // 유산소 운동별 유효성 검사 및 데이터 저장 로직
      if (type === '산책') {
        if (!duration || !distance) {
          Alert.alert('오류', '지속 시간과 거리를 입력해주세요.');
          return;
        }
        await addExercise(formattedDate, type, parseInt(duration, 10), 0, parseFloat(distance), 0, 0, 0, 0, 0, 0);
        Alert.alert('성공', '산책 기록이 추가되었습니다.');
      } else if (type === '런닝머신') {
        if (!duration || !incline || !speed || !calories) {
          Alert.alert('오류', '지속 시간, 기울기, 속도, 칼로리를 입력해주세요.');
          return;
        }
        await addExercise(formattedDate, type, parseInt(duration, 10), parseInt(calories, 10), 0, parseFloat(incline), parseFloat(speed), 0, 0, 0, 0);
        Alert.alert('성공', '런닝머신 기록이 추가되었습니다.');
      } else if (type === '자전거') {
        if (!duration || !level || !calories) {
          Alert.alert('오류', '지속 시간, 레벨, 칼로리를 입력해주세요.');
          return;
        }
        await addExercise(formattedDate, type, parseInt(duration, 10), parseInt(calories, 10), 0, 0, 0, parseInt(level, 10), 0, 0, 0);
        Alert.alert('성공', '자전거 기록이 추가되었습니다.');
      } else {
        Alert.alert('오류', '유효한 유산소 운동 종류를 선택해주세요.');
        return;
      }
    } else { // 무산소
      if (!type || !sets || !reps || !weight) {
        Alert.alert('오류', '모든 필드를 입력해주세요.');
        return;
      }
      try {
        await addExercise(formattedDate, type, 0, 0, 0, 0, 0, 0, parseInt(sets, 10), parseInt(reps, 10), parseFloat(weight));
        Alert.alert('성공', '무산소 운동 기록이 추가되었습니다.');
      } catch (error) {
        console.error('무산소 운동 기록 추가 오류:', error);
        Alert.alert('오류', '무산소 운동 기록 추가에 실패했습니다: ' + error.message);
      }
    }

    setType('');
    setDuration('');
    setCalories('');
    setDistance('');
    setIncline('');
    setSpeed('');
    setLevel('');
    setSets('');
    setReps('');
    setWeight('');
    router.back();
  };

  const aerobicIcons = [
    { name: '산책', icon: 'walk', guide: '가벼운 속도로 걸으면서 유산소 운동을 합니다.' },
    { name: '런닝머신', icon: 'treadmill', guide: '실내에서 런닝머신을 사용해 유산소 운동을 합니다.' },
    { name: '자전거', icon: 'bike', guide: '실내/외 자전거를 사용해 유산소 운동을 합니다.' },
  ];

  const exerciseByMuscleGroup = {
    가슴: [
      { name: '벤치프레스', icon: 'weight-lifter', guide: '바벨을 가슴 위로 들어 올리고 내립니다.' },
      { name: '펙덱플라이', icon: 'butterfly', guide: '펙덱머신을 사용하여 가슴 근육을 모아줍니다.' },
      { name: '뉴텍인클라인체스트프레스', icon: 'weight-lifter', guide: '인클라인 각도에서 가슴을 밀어줍니다.' },
      { name: '와이드체스트', icon: 'arm-flex', guide: '손을 넓게 벌려 가슴 근육을 사용해 밀어줍니다.' },
    ],
    등: [
      { name: '데드리프트', icon: 'weight-lifter', guide: '바벨을 바닥에서 들어 올립니다.' },
      { name: '롱풀', icon: 'rowing', guide: '시티드 로우 머신에서 등 근육을 당겨줍니다.' },
      { name: '렛풀다운', icon: 'arm-flex', guide: '바를 머리 위에서 아래로 당겨줍니다.' },
      { name: '시티드로우', icon: 'rowing', guide: '머신에 앉아 등 근육을 사용해 당겨줍니다.' },
      { name: '헤머로우', icon: 'rowing', guide: '해머 머신을 사용하여 등을 당겨줍니다.' },
      { name: '와이드토크풀다운', icon: 'arm-flex', guide: '넓은 그립으로 바를 당겨줍니다.' },
      { name: '디와이로우', icon: 'rowing', guide: '특정 머신을 사용하여 등 근육을 당겨줍니다.' },
    ],
    어깨: [
      { name: '숄더프레스', icon: 'weight-lifter', guide: '머리 위로 무게를 들어 올립니다.' },
      { name: '페이스풀', icon: 'rope', guide: '케이블을 얼굴 쪽으로 당겨 어깨 후면을 자극합니다.' },
      { name: '덤벨킥백', icon: 'arm-flex', guide: '덤벨을 뒤로 차면서 삼두근을 사용합니다.' },
      { name: '사이드레터럴레이즈', icon: 'arm-flex', guide: '덤벨을 옆으로 들어 올립니다.' },
      { name: '숄더플라이벤트오버레터럴레이즈', icon: 'arm-flex', guide: '상체를 숙이고 덤벨을 들어 올립니다.' },
      { name: '프론트레이즈', icon: 'arm-flex', guide: '덤벨을 앞으로 들어 올립니다.' },
    ],
    하체: [
      { name: '레그프레스', icon: 'weight-lifter', guide: '다리로 무게를 밀어 올립니다.' },
      { name: '스쿼트', icon: 'human-legs', guide: '바벨을 어깨에 메고 앉았다 일어납니다.' },
      { name: '익스텐션', icon: 'leg-scan', guide: '무릎을 펴면서 허벅지 앞쪽을 단련합니다.' },
      { name: '레그컬 머신', icon: 'leg-scan', guide: '무릎을 구부리며 허벅지 뒤쪽을 단련합니다.' },
      { name: '아웃타이힙쓰러스트', icon: 'leg-scan', guide: '힙쓰러스트 동작으로 둔근을 강화합니다.' },
      { name: '고블릿스쿼트', icon: 'human-legs', guide: '덤벨을 가슴에 안고 스쿼트를 합니다.' },
    ],
    팔기타: [
      { name: '덤벨', icon: 'dumbbell', guide: '다양한 팔 운동에 사용됩니다.' },
      { name: '케이블머신', icon: 'rope', guide: '다양한 팔 운동에 사용됩니다.' },
      { name: '스미스머신', icon: 'barbell', guide: '안정적인 자세로 다양한 운동을 수행합니다.' },
      { name: '백익스텐션', icon: 'weight-lifter', guide: '허리 근육을 강화합니다.' },
      { name: '프리쳐컬', icon: 'arm-flex', guide: '이두근을 집중적으로 단련합니다.' },
      { name: '바이저바푸시다운', icon: 'weight-lifter', guide: '삼두근을 단련합니다.' },
      { name: '케이블푸시다운', icon: 'weight-lifter', guide: '케이블을 사용하여 삼두근을 단련합니다.' },
    ],
  };

  const muscleGroups = ['가슴', '등', '어깨', '하체', '팔기타'];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <View style={styles.typeContainer}>
          <TouchableOpacity
            style={[styles.typeButton, exerciseType === '유산소' && styles.selectedTypeButton]}
            onPress={() => {
              setExerciseType('유산소');
              setType('');
            }}
          >
            <Text style={[styles.typeText, exerciseType === '유산소' && styles.selectedTypeText]}>유산소</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, exerciseType === '무산소' && styles.selectedTypeButton]}
            onPress={() => {
              setExerciseType('무산소');
              setType('');
            }}
          >
            <Text style={[styles.typeText, exerciseType === '무산소' && styles.selectedTypeText]}>무산소</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>날짜:</Text>
        <TouchableOpacity onPress={showDatepicker}>
          <TextInput
            style={styles.input}
            value={formattedDate}
            editable={false}
            placeholder="날짜 선택"
          />
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            testID="datePicker"
            value={date}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        {exerciseType === '유산소' ? (
          <>
            <Text style={styles.label}>운동 종류:</Text>
            <View style={styles.iconContainer}>
              {aerobicIcons.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.iconButton, type === item.name && styles.selectedIconButton]}
                  onPress={() => {
                    setType(item.name);
                    setDuration('');
                    setCalories('');
                    setDistance('');
                    setIncline('');
                    setSpeed('');
                    setLevel('');
                  }}
                >
                  <MaterialCommunityIcons name={item.icon} size={30} color={type === item.name ? '#fff' : '#007AFF'} />
                  <Text style={styles.iconText}>{item.name}</Text>
                  <Text style={styles.guideText}>{item.guide}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {type === '산책' && (
              <>
                <Text style={styles.label}>지속 시간 (분):</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="예: 30"
                />
                <Text style={styles.label}>거리 (km):</Text>
                <TextInput
                  style={styles.input}
                  value={distance}
                  onChangeText={setDistance}
                  keyboardType="numeric"
                  placeholder="예: 2.5"
                />
              </>
            )}

            {type === '런닝머신' && (
              <>
                <Text style={styles.label}>지속 시간 (분):</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="예: 30"
                />
                <Text style={styles.label}>기울기 (%):</Text>
                <TextInput
                  style={styles.input}
                  value={incline}
                  onChangeText={setIncline}
                  keyboardType="numeric"
                  placeholder="예: 5"
                />
                <Text style={styles.label}>속도 (km/h):</Text>
                <TextInput
                  style={styles.input}
                  value={speed}
                  onChangeText={setSpeed}
                  keyboardType="numeric"
                  placeholder="예: 8"
                />
                <Text style={styles.label}>소모 칼로리 (kcal):</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="예: 300"
                />
              </>
            )}

            {type === '자전거' && (
              <>
                <Text style={styles.label}>지속 시간 (분):</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                  placeholder="예: 30"
                />
                <Text style={styles.label}>레벨:</Text>
                <TextInput
                  style={styles.input}
                  value={level}
                  onChangeText={setLevel}
                  keyboardType="numeric"
                  placeholder="예: 7"
                />
                <Text style={styles.label}>소모 칼로리 (kcal):</Text>
                <TextInput
                  style={styles.input}
                  value={calories}
                  onChangeText={setCalories}
                  keyboardType="numeric"
                  placeholder="예: 250"
                />
              </>
            )}

          </>
        ) : (
          <>
            <Text style={styles.label}>운동 부위:</Text>
            <View style={styles.muscleGroupContainer}>
              {muscleGroups.map((group, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.muscleGroupButton, muscleGroup === group && styles.selectedMuscleGroupButton]}
                  onPress={() => {
                    setMuscleGroup(group);
                    setType('');
                  }}
                >
                  <Text style={[styles.muscleGroupText, muscleGroup === group && styles.selectedMuscleGroupText]}>
                    {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>운동 종류:</Text>
            <View style={styles.iconContainer}>
              {exerciseByMuscleGroup[muscleGroup].map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.iconButton, type === item.name && styles.selectedIconButton]}
                  onPress={() => setType(item.name)}
                >
                  <MaterialCommunityIcons name={item.icon} size={30} color={type === item.name ? '#fff' : '#007AFF'} />
                  <Text style={styles.iconText}>{item.name}</Text>
                  <Text style={styles.guideText}>{item.guide}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>세트 수:</Text>
            <TextInput
              style={styles.input}
              value={sets}
              onChangeText={setSets}
              keyboardType="numeric"
              placeholder="예: 3"
            />
            <Text style={styles.label}>반복 횟수 (회):</Text>
            <TextInput
              style={styles.input}
              value={reps}
              onChangeText={setReps}
              keyboardType="numeric"
              placeholder="예: 10"
            />
            <Text style={styles.label}>무게 (kg):</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="예: 50"
            />
          </>
        )}
        <Button title="운동 기록 추가" onPress={handleAddExercise} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  selectedTypeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  typeText: {
    color: '#000',
  },
  selectedTypeText: {
    color: '#fff',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    fontSize: 16,
  },
  muscleGroupContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  muscleGroupButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    margin: 5,
  },
  selectedMuscleGroupButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  muscleGroupText: {
    fontSize: 14,
    color: '#333',
  },
  selectedMuscleGroupText: {
    color: '#fff',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '30%',
    marginBottom: 10,
    marginRight: 10,
  },
  selectedIconButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  iconText: {
    fontSize: 12,
    marginTop: 5,
    color: '#333',
  },
  guideText: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
});
