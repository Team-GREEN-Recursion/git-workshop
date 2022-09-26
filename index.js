//---------------------- 定数部 --------------------------

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
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
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
  "#FF1493",
  "#FF69B4",
  "#FF00FF",
  "#C71585",
  "#FF367F",
  "#EE82EE",
  "#CC0099",
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

//---------------------- 実行部 --------------------------

//フィールドを初期化してから、フィールドを描画します
init();
drawField();
//テトロミノがランダムに表示されます
drawTetromino();

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

// キーボード押下後の処理
// ===========================================
// TODO: checkMove作成後、
//       1.各キーの処理をコメントアウトの方に変更する
//       2.上キーの処理をコメントアウトを除く
//       3.zキーとxキーの該当箇所をコメントアウトのコードに変更する。
// ===========================================
document.onkeydown = function (e) {
  // ゲームオーバーフラグとリピートフラグが立っているならキーボード使用できなくする。
  //if (gameOverFlg) return;
  //if (!repeatFlg) return;
  switch (e.key) {
    case "ArrowLeft": // 左
      // if(checkMove(-1, 0) tetromino_x--;
      tetromino_x--;
      break;
    case "ArrowRight": // 右
      // if(checkMove(1,0)) tetromino_x++;
      tetromino_x++;
      break;
    case "ArrowDown": // 下
      // if(checkMove(0,1)) tetromino_y++;
      tetromino_y++;
      break;
    case "ArrowUp": // 上
      // テトロミノを最後まで落とす
      //while (checkMove(0,1)) tetromino_y++;
      break;
    case "z": // zキー
      // rotate右
      console.log(e.key);
      let newTetrominoLeft = rotateLeft();
      // chechMove作成後に切り替える
      // if (checkMove(0, 0, newTetromino)) tetromino = newTetrominoLeft;
      tetromino = newTetrominoLeft;
      break;
    case "x": // xキー
      // rotate左
      let newTetrominoRight = rotateRight();
      // chechMove作成後に切り替える
      // if (checkMove(0, 0, newTetromino)) tetromino = newTetrominoRight;
      tetromino = newTetrominoRight;
      break;
  }
  drawField();
  drawTetromino();
};

// ===========================================
// TODO: 以下の回転関数は一つに統合する（余裕あれば）
// ===========================================
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
