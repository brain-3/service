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
    const score_user1 = user1[movie];
    const score_user2 = user2[movie];
    dotProduct += score_user1 * score_user2;
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

module.exports = recommendMovies;