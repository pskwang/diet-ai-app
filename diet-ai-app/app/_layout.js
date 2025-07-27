import { Tabs } from 'expo-router';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen name="meal/input" options={{ title: '식단 입력' }} />
      <Tabs.Screen name="meal/list" options={{ title: '식단 리스트' }} />
      <Tabs.Screen name="exercise/input" options={{ title: '운동 입력' }} />
      <Tabs.Screen name="exercise/list" options={{ title: '운동 리스트' }} />
    </Tabs>
  );
}
