const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 사용자 데이터베이스 예시
const users = {
  'user1': {'movie1': 4, 'movie2': 5, 'movie3': 2},
  'user2': {'movie1': 5, 'movie2': 2, 'movie3': 4},
  'user3': {'movie1': 2, 'movie2': 4, 'movie3': 5}
};

// 코싸인 유사성 계산 함수
function cosineSimilarity(user1, user2) {
  const movies = Object.keys(user1);
  let dotProduct = 0;
  let normUser1 = 0;
  let normUser2 = 0;

  movies.forEach(movie => {
    dotProduct += user1[movie] * user2[movie];
    normUser1 += Math.pow(user1[movie], 2);
    normUser2 += Math.pow(user2[movie], 2);
  });

  const similarity = dotProduct / (Math.sqrt(normUser1) * Math.sqrt(normUser2));
  return similarity;
}

// 영화 추천 함수
function recommendMovies(targetUser) {
  let bestMatch = null;
  let bestSimilarity = -1;

  Object.keys(users).forEach(user => {
    if (user !== targetUser) {
      const similarity = cosineSimilarity(users[targetUser], users[user]);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = user;
      }
    }
  });

  return users[bestMatch];
}

app.use(bodyParser.json());

// 사용자에게 영화 추천 제공
app.post('/recommend', (req, res) => {
  const { user } = req.body;
  const recommendedMovies = recommendMovies(user);
  res.json({ recommendedMovies });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
