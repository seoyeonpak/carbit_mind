const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // path 모듈 추가
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../frontend/src'))); // 정적 파일 제공

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/src/1-main.html')); // 파일 경로 수정
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});