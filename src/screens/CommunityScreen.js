import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet } from 'react-native';

export default function CommunityScreen() {
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);

  const handlePost = () => {
    if (!post.trim()) return;
    const newPost = {
      id: Date.now().toString(),
      content: post.trim(),
    };
    setPosts([newPost, ...posts]);
    setPost('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>커뮤니티</Text>

      <TextInput
        style={styles.input}
        placeholder="내용을 입력하세요..."
        value={post}
        onChangeText={setPost}
        multiline
      />
      <Button title="글 작성" onPress={handlePost} />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postBox}>
            <Text style={styles.postText}>{item.content}</Text>
          </View>
        )}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 5,
    padding: 10, marginBottom: 10, height: 80, textAlignVertical: 'top'
  },
  postBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
  },
  postText: { fontSize: 16 },
});
import { insertPost, getPosts } from '../db/database';
import { useEffect } from 'react';

// 글 저장
const handlePost = () => {
  if (!post.trim()) return;
  insertPost(post.trim());
  setPost('');
  loadPosts(); // 다시 불러오기
};

// 글 불러오기
const loadPosts = () => {
  getPosts((data) => setPosts(data));
};

useEffect(() => {
  loadPosts();
}, []);
