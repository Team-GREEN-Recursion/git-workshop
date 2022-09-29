//---------------------- 定数部 --------------------------

const DROP_SPEED = 500;

//フィールドのサイズ
const FIELD_WIDTH = 12;
const FIELD_HEIGHT = 20;

//初期化したフィールド
let field = [];

//ブロック一つのサイズ（単位：ピクセル）
const BLOCK_SIZE = 30;

//テトロミノのサイズ（単位：ブロック）
const TETROMINO_SIZE = 4;

//テトロミノの定義
const TETROMINO_TYPES = [
  //空
  [],
  //I型
  [
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  //L型
  [
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  //J型
  [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  //T型
  [
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 0, 0],
    [0, 0, 0, 0],
  ],
  //□型
  [
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
  //Z型
  [
    [1, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  //S型
  [
    [0, 1, 1, 0],
    [1, 1, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
];

//テトロミノ本体
let tetromino;
//テトロミノ形状のインデックス
let typeIndex;
//乱数でテトロミノの形状を決めます（1~7番）
typeIndex = Math.floor(Math.random() * (TETROMINO_TYPES.length - 1)) + 1;
tetromino = TETROMINO_TYPES[typeIndex];

//落下開始地点の座標
const START_X = FIELD_WIDTH / 2 - TETROMINO_SIZE / 2;
const START_Y = 0;

//テトロミノの座標
let tetromino_x = START_X;
let tetromino_y = START_Y;

//テトロミノの色
const TETROMINO_COLORS = [
  "",
  "#ff0000",
  "#0000ff",
  "#ffff00",
  "#00ff00",
  "#ff7f00",
  "#7f00ff",
  "#ff00ff",
];

//キャンバス用意
//キャンバスのサイズ = ブロック一つのサイズ × フィールドサイズ
const CANVAS_SIZE_WIDTH = BLOCK_SIZE * FIELD_WIDTH;
const CANVAS_SIZE_HEIGHT = BLOCK_SIZE * FIELD_HEIGHT;
//キャンバス要素を取得します
let canvas = document.getElementById("canvasId");
//2dで描画するためのコンテキストを取得します
let context = canvas.getContext("2d");
//キャンバスの大きさ、罫線の太さを指定します
canvas.width = CANVAS_SIZE_WIDTH;
canvas.height = CANVAS_SIZE_HEIGHT;
canvas.style.border = "4px solid #555";

// setInterval, clearIntervalで使用します
let interval;

// ストップボタンで使用する、リピートフラグ
let repeatFlg = true;

// ゲームオーバーの判定用
let gameOverFlg = false;

// STOPボタンフラグ
let stopButtonFlg = false;

// ゲーム実行中かどうかを判定するフラグ
let gameStartFlg = false;

//---------------------- 実行部 --------------------------

document.getElementById("start-button").onclick = () => {
  if (!stopButtonFlg) {
    // ゲーム実行中をtrueにする
    gameStartFlg = true;

    // "スコア"と"消したライン数"を初期化します
    document.getElementById("score-count").innerHTML = 0;
    document.getElementById("line-count").innerHTML = 0;

    // ゲームオーバーフラグを初期化します
    if (gameOverFlg) gameOverFlg = false;

    //フィールドを初期化してから、フィールドを描画します
    init();

    // intervalの初期化
    onClearInterval();
    onSetInterval();

    drawField();
    //テトロミノがランダムに表示されます
    drawTetromino();
  }
};

// setIntervalを動かすラップ関数
function onSetInterval() {
  // DROP_SPEEDに一回第一引数の関数郡が実行されます
  interval = setInterval(() => {
    dropTetromino();
    drawField();
    drawTetromino();
    deleteCompletedLines();
    if (isGameOver()) gameOverFlg = true;
    if (gameOverFlg) {
      drawCaption("GAME OVER", 60, "yellow");
      return;
    }
  }, DROP_SPEED);
}

// clearIntervalを動かすラップ関数
function onClearInterval() {
  clearInterval(interval);
}

// ストップボタン押したときの処理
document.getElementById("stop-button").onclick = () => {
  // ゲーム実行中の場合のみ動きます
  if (gameStartFlg && !gameOverFlg) {
    if (stopButtonFlg) {
      // STOPボタンの時
      onStopButton();
      stopButtonFlg = false;
    } else {
      // RESTARTボタンの時
      onStopButton();
      stopButtonFlg = true;
    }
  }
};

//---------------------- 関数部 --------------------------

//フィールド上のブロックを初期化する関数
function init() {
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    field[y] = [];
    for (let x = 0; x < FIELD_WIDTH; x++) {
      field[y][x] = 0;
    }
  }
}

//ブロック一つを描画する関数
function drawBlock(x, y, colorIndex) {
  //新しい座標を定義します
  let pointX = x * BLOCK_SIZE;
  let pointY = y * BLOCK_SIZE;

  if (!colorIndex == 0) {
    //塗りつぶす色を指定します
    context.fillStyle = TETROMINO_COLORS[colorIndex];
    //塗りつぶしの四角形（Rect)を描画します
    context.fillRect(pointX, pointY, BLOCK_SIZE, BLOCK_SIZE);
  } else {
    // 0が渡されたら着地点の予想位置に灰色ブロックを描画
    context.fillStyle = "rgba(192,192,192,0.7)";
    context.fillRect(pointX, pointY, BLOCK_SIZE, BLOCK_SIZE);
  }

  //ブロックの輪郭
  context.strokeStyle = "black";
  /*
  2回目以降テトロミノの枠線が太くなってしまうのは、
  フィールドの太い線が引き継がれてしまっていたことが原因だったのでlineWidthを指定
  */
  context.lineWidth = 2;
  context.strokeRect(pointX, pointY, BLOCK_SIZE, BLOCK_SIZE);
}

//フィールド（ブロック）を描画する関数
function drawField() {
  //描画前に移動前の描画をクリア
  context.clearRect(0, 0, CANVAS_SIZE_WIDTH, CANVAS_SIZE_HEIGHT);
  for (let y = 0; y < FIELD_HEIGHT; y++) {
    for (let x = 0; x < FIELD_WIDTH; x++) {
      //field[y][x]が1のときにブロックを描画
      if (field[y][x]) {
        //フィールドの初期化後も固定したテトロミノの色情報は保持されるので、
        //colorIndexとしてfield[y][x]を渡すことで積まれたテトロミノを表示できます
        drawBlock(x, y, field[y][x]);
      }
    }
  }
}

//テトロミノを描画する関数
function drawTetromino() {
  //着地点の高さ
  let plus = 0;
  while (checkMove(0, plus + 1)) plus++;

  //テトロミノの配列をチェックし、形に合わせてブロックを描画します
  for (let y = 0; y < TETROMINO_SIZE; y++) {
    for (let x = 0; x < TETROMINO_SIZE; x++) {
      if (tetromino[y][x]) {
        //テトロミノのブロック
        drawBlock(tetromino_x + x, tetromino_y + y, typeIndex);

        //着地予測場所に色なしブロックを描画します
        drawBlock(tetromino_x + x, tetromino_y + y + plus, 0);
      }
    }
  }
}

// 移動可能かチェックを行う関数
function checkMove(mx, my, newTetromino) {
  // 引数の数が足りない場合はnewTetrominoに現在のテトロミノを格納
  if (newTetromino === undefined) newTetromino = tetromino;
  for (let y = 0; y < TETROMINO_SIZE; y++) {
    for (let x = 0; x < TETROMINO_SIZE; x++) {
      if (newTetromino[y][x]) {
        let nx = mx + tetromino_x + x;
        let ny = my + tetromino_y + y;
        if (
          nx < 0 ||
          nx >= FIELD_WIDTH ||
          ny >= FIELD_HEIGHT ||
          field[ny][nx]
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

// キーボード押下後の処理
document.onkeydown = function (e) {
  // ゲームオーバーフラグとリピートフラグが立っているならキーボード使用できなくする。
  if (gameOverFlg) return;
  if (!repeatFlg) return;
  switch (e.key) {
    case "ArrowLeft": // 左
      if (checkMove(-1, 0)) tetromino_x--;
      break;
    case "ArrowRight": // 右
      if (checkMove(1, 0)) tetromino_x++;
      break;
    case "ArrowDown": // 下
      if (checkMove(0, 1)) tetromino_y++;
      break;
    case "ArrowUp": // 上
      // テトロミノを移動できなくなるまで落とす
      while (checkMove(0, 1)) tetromino_y++;
      break;
    case "z": // zキー
      // rotate右
      let newTetrominoLeft = rotateLeft();
      // テトロミノ回転関数で返される回転後の座標設定する
      if (checkMove(0, 0, newTetrominoLeft)) tetromino = newTetrominoLeft;
      break;
    case "x": // xキー
      // rotate左
      let newTetrominoRight = rotateRight();
      // テトロミノ回転関数で返される回転後の座標設定する
      if (checkMove(0, 0, newTetrominoRight)) tetromino = newTetrominoRight;
      break;
  }
  // 再描画
  drawField();
  drawTetromino();
};

// テトロミノを右に回転する関数
function rotateRight() {
  // 回転後のテトロミノ格納用配列
  let newTetromino = [];

  // テトロミノを右回転
  for (let y = 0; y < TETROMINO_SIZE; y++) {
    newTetromino[y] = [];
    for (let x = 0; x < TETROMINO_SIZE; x++) {
      newTetromino[y][x] = tetromino[TETROMINO_SIZE - x - 1][y];
    }
  }

  return newTetromino;
}

// テトロミノを左に回転する関数
function rotateLeft() {
  // 回転後のテトロミノ格納用配列
  let newTetromino = [];

  // テトロミノを左回転
  for (let y = 0; y < TETROMINO_SIZE; y++) {
    newTetromino[y] = [];
    for (let x = 0; x < TETROMINO_SIZE; x++) {
      newTetromino[y][x] = tetromino[x][TETROMINO_SIZE - y - 1];
    }
  }

  return newTetromino;
}

function dropTetromino() {
  if (checkMove(0, 1, tetromino)) {
    tetromino_y++;
  } else {
    fixTetromino();
    appearNewTetro();
  }
}

function appearNewTetro() {
  // typeIndex = Math.floor(Math.random() * (TETROMINO_TYPES.length - 1)) + 1;
  typeIndex = 5;
  tetromino = TETROMINO_TYPES[typeIndex];

  //init new tetro's coordinate
  tetromino_x = START_X;
  tetromino_y = START_Y;
}

function fixTetromino() {
  for (let y = 0; y < TETROMINO_SIZE; y++) {
    for (let x = 0; x < TETROMINO_SIZE; x++) {
      if (tetromino[y][x]) {
        field[tetromino_y + y][tetromino_x + x] = typeIndex;
      }
    }
  }
}

function isGameOver() {
  if (checkMove(0, 0, tetromino)) return false;
  else return true;
}

function isLineCompleted(y) {
  for (let x = 0; x < FIELD_WIDTH; x++) {
    if (!field[y][x]) return false;
  }
  return true;
}

function deleteCompletedLines() {
  let completedLineIndex = [];

  for (let y = 0; y < FIELD_HEIGHT; y++) {
    if (isLineCompleted(y)) completedLineIndex.push(y);
  }

  // delete lines
  while (completedLineIndex.length) {
    // shift() remove the first element of the array
    let toDeleteLineIndex = completedLineIndex.shift();

    for (let ny = toDeleteLineIndex; ny > 0; ny--) {
      for (let nx = 0; nx < FIELD_WIDTH; nx++) {
        field[ny][nx] = field[ny - 1][nx];
      }
    }
  }
}

// ストップボタン関数
function onStopButton() {
  if (repeatFlg) {
    // インターバルを初期化
    onClearInterval();

    // PAUSEと画面に表示する
    if (!gameOverFlg) drawCaption("PAUSE", 60, "yellow");

    // STOPボタンの表示をRESTARTに変更
    document.getElementById("action").innerHTML = "RESTART";
    repeatFlg = false;
  } else {
    // インターバルを初期化して再度セットします
    onClearInterval();
    onSetInterval();
    // RESTARTボタンの表示をSTOPに変更
    document.getElementById("action").innerHTML = " STOP ";
    repeatFlg = true;
  }
}

// 画面中央に文字を表示する関数
function drawCaption(text, fontSize, fontColor) {
  // 表示位置
  let y = CANVAS_SIZE_HEIGHT / 2;
  let x = calculateCenterOfScreen(CANVAS_SIZE_WIDTH, fontSize, text.length);

  // フォントサイズ, フォントの種類
  context.font = `${fontSize}px 'pixel'`;
  // フォントの縁取りの色
  context.strokeStyle = "white";
  // フォントの色
  context.fillStyle = fontColor;
  // テキストの輪郭の描写
  context.strokeText(text, x, y);
  // テキストの塗りつぶしの描写
  context.fillText(text, x, y);
}

function calculateCenterOfScreen(canvasSize, fontSize, textLength) {
  // 画面半分のサイズ
  let screenHalfSize = canvasSize / 2;

  // ファントのサイズによって出現位置を調整する
  return screenHalfSize - ((textLength - 1) * (fontSize / 2)) / 2;
}
