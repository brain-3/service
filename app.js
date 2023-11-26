const express = require('express')
const app = express()
const port = 3000
const { Sequelize, DataTypes} = require('sequelize');
app.set("view engine", "ejs");
app.set('views','./views');
app.use(express.json());
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/pre', (req,res) => {res.render('pre')});


const sequelize = new Sequelize('db1', 'root', 'root0000', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
  });
  const User = sequelize.define('users', {
    id: {
       type: DataTypes.INTEGER,
       autoIncrement: true, //고유값
       primaryKey: true
     },
     username: {
        type:DataTypes.STRING
     },
     email: {
       type: DataTypes.STRING
     },
     password: {
       type: DataTypes.STRING
     },
   })

   const Evaluation = sequelize.define('evaluation', {
    id: {
       type: DataTypes.INTEGER,
       autoIncrement: true, //고유값
       primaryKey: true
     },
     ratings: {
      type: DataTypes.INTEGER
     },
     // 평가 받은 사람
     user_id: {
      type: DataTypes.INTEGER
     },
     // 평가한 사람
     judge_id: {
      type: DataTypes.INTEGER
     }
   })

// 코싸인 유사성 계산 함수
async function cosineSimilarity(user1_id, user2_id) {
  let dotProduct = 0;
  let normUser1 = 0;
  let normUser2 = 0;

  
  const evalutaions_user1 = await Evaluation.findAll({
    where: {
      judge_id: user1_id
    }
  })

  const evaluation_user_ids = evalutaions_user1.map(e => e.dataValues.user_id)
  for (const user_id of evaluation_user_ids) {
    
    const result1 = await Evaluation.findOne({
      where: {
        user_id: user_id,
        judge_id: user1_id
      }
    })
    const result2 = await Evaluation.findOne({
      where: {
        user_id: user_id,
        judge_id: user2_id
      }
    })
    if (result1 && result2) {
      let score_user1 = result1.dataValues.ratings;
      let score_user2 = result2.dataValues.ratings;
      console.log('scroe_user1 : ' + score_user1);
      console.log('scroe_user2 : ' + score_user2);
      dotProduct += score_user1 * score_user2;
      console.log('dotProduct : ' + dotProduct);
      if (score_user1 !== 0) {
        normUser1 += Math.pow(score_user1, 2);
      }
      if (score_user2 !== 0) {
        normUser2 += Math.pow(score_user2, 2);
      }
      console.log('normUser1 : ' + normUser1);
      console.log('normUser2 : ' + normUser2);
      console.log("------------------------")
    }
  }

  // similarity 오류
  const similarity = dotProduct / (Math.sqrt(normUser1) * Math.sqrt(normUser2));
  console.log("similarity 결과값 - 직접 계산 : " +  similarity);
  console.log("similarity 결과값 - 직접 계산 : " + (36 / (Math.sqrt(81) * Math.sqrt(16))));
  console.log("cosineSimilarity 함수 끝!!");
  if (isNaN(similarity)) {
    console.log("Nan이다")
    return 0;
  }
  console.log(similarity)
}

// 영화 추천 함수
async function recommendMovies(targetUser_id) {
  let bestMatch = null;
  let bestSimilarity = -1;

  const users = await User.findAll();
  for (const user of users) {
    if (user.dataValues.id !== targetUser_id) {
      const similarity = await cosineSimilarity(targetUser_id, user.dataValues.id);
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = user;
      } 
    }
  }
  console.log('bestMatch : ' + bestMatch);
  console.log('bestSimilarity : ' + bestSimilarity);
  return bestMatch;
}

   app.get('/', async(req,res) => {

    const recommendedMovies = await recommendMovies(1);
    
  res.render('home');
    
    // const users = await User.findAll();
    // const usersAndEvalutaions = [];

    

    // // 평가 정보 조회
    // for (let i = 0; i < users.length; i++) {
    //   const user = users[i];
    //   const evaluation = await Evaluation.findOne({
    //     where: {
    //       user_id: user.id
    //     }
    //   })
    //   console.log(evaluation);
    //   // let score = 0;
    //   // if (evaluation) {
    //   //   if (evaluation.dataValues.reliability) {
    //   //     score += evaluation.dataValues.reliability;
    //   //   }
    //   //   if (evaluation.dataValues.solving) {
    //   //     score += evaluation.dataValues.solving;
    //   //   }
    //   // }
    //   // usersAndEvalutaions.push({
    //   //   user: user.dataValues,
    //   //   score: score
    //   // })      
    // }


    // 점수가 높은 순으로 정렬
    // let sorted = usersAndEvalutaions.sort((a,b) => {
    //   if(a.score > b.score) return -1;
    //   if(a.score < b.score) return 1;
    //   return 0;
    // });
    // console.log(sorted);

    // 평가 정보를 조회해와서 평가 정보를 기준으로 정렬을 한다. 
    // 각 평가 항목 당 1점 -> 점수 많은 순으로 정렬
    // res.render('home', {users: sorted}) 

    // res.render('home', { users: users.dataValues })
   
  });
  
   app.get('/login', (req,res) => {res.render('login')});
   app.post('/login', async(req,res,) => {
    
    const inputEmail = req.body.email;
    const inputPassword = req.body.password;

    const user = await User.findOne({
      where: {
        email: inputEmail
      }
    });
    if (user === null) {
      res.send('가입되지 않은 계정입니다.');
      return;
    }
    
    if (user.password !== inputPassword) {
      res.send('비밀번호가 틀립니다.')
      return;
    }
    res.send("로그인 성공");
   })

  app.get('/new', (req, res) => {res.render('new')});
  app.post('/new',async(req, res,) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const jane = await User.create
    ({ username: req.body.username, email: req.body.email, password: req.body.password }); 
    res.send('"회원 가입 완료"');
  })

  app.get('/user', async(req,res) => {
    const users = await User.findAll();
    const evaluations = await Evaluation.findAll();
    res.render('user', { users: users, evaluations: evaluations })
});


// app.post('/login', async(req,res,) => {
    
//   const inputEmail = req.body.email;
//   const inputPassword = req.body.password;

//   const user = await User.findOne({
//     where: {
//       email: inputEmail
//     }
//   });
//   if (user === null) {
//     res.send('가입되지 않은 계정입니다.');
//     return;
//   }
  
//   if (user.password !== inputPassword) {
//     res.send('비밀번호가 틀립니다.')
//     return;
//   }
//   res.send("로그인 성공");
//  })
app.get('/eva', async(req,res) => {
  const users = await User.findAll();
  res.render('eva', {users: users})
});
app.post('/eva',async(req, res,) => {
  const ratings = req.body.ratings;
  const user_id = req.body.user_id;
  const judge_id = req.body.judge_id;
  const score = await Evaluation.create({
    ratings: ratings,
    user_id: user_id,
    judge_id: judge_id
  });
  res.send("제출 완료");
})

  app.listen(port, async () => {
    try {
      await sequelize.authenticate(); //체크 코드
      // await sequelize.sync({ force: true }); //express랑 db 공유
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
    console.log(`서버가 실행됩니다. http://localhost:${port}`);
  })
