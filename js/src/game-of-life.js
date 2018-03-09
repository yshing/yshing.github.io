'use strict';
(function () {
  function GameOfLife(canvas) {
    var self = this;
    var board = [];
    var cells = [];
    var ctx = canvas.getContext('2d');
    var cellSize = 10;
    var row = 0;
    var column = 0;
    var lastUdate = +new Date();
    self.paused = false;
    self.generation = 0;
    this.countNearbyLives = function (cRow, cColumn) {
      var liveCount = 0;
      var northRow,southRow,westColumn,eastColumn;
      board[cRow - 1] ? northRow = cRow - 1 : northRow = row - 1;
      board[cRow + 1] ? southRow = cRow + 1 : southRow = 0;
      board[cRow][cColumn - 1] ? westColumn = cColumn - 1 : westColumn = column - 1;
      board[cRow][cColumn + 1] ? eastColumn = cColumn + 1 : eastColumn = 0;

      liveCount += board[northRow][westColumn].living;
      liveCount += board[northRow][cColumn    ].living;
      liveCount += board[northRow][eastColumn].living;
      liveCount += board[cRow    ][westColumn].living;
      liveCount += board[cRow    ][eastColumn].living;
      liveCount += board[southRow][westColumn].living;
      liveCount += board[southRow][cColumn    ].living;
      liveCount += board[southRow][eastColumn].living;
      return liveCount;
      /* too slow */
      // return [-1, 0, +1].map(function (i) {
      //  return [-1, 0, +1].map(function (j) {
      //    if (i === j && j === 0) return 0;
      //    return board[row + i][column + j].living;
      //  }).reduce(sumReducer, 0);
      // }).reduce(sumReducer, 0);
    };
    this.draw = function () {
      ctx.fillStyle = 'rgba( 50, 50, 50, 0.4 )';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      iterateRedrawCell(function (cell) {
        if (cell.living) cell.draw(ctx);
      });
    };
    this.update = function (frame) {
      var now = +new Date();
      if (now - lastUdate < 100) return;
      lastUdate = now;
      iterateRedrawCell(function (cell) {
        cell.update();
      });
      iterateRedrawCell(function (cell) {
        cell.living = cell.nextGen;
        // if (cell.living!==cell.netGen) console.log('change')
      });
      // console.log(frame)
      self.draw();
    };
    this.init = function () {
      ensureCanvas();
      iterateRedrawCell(function (cell){
        Math.random()<0.1 ? cell.living = true : cell.living = false;
      });
      window.addEventListener('resize', ensureCanvas);
      requestAnimationFrame (self.update);
    };
    this.play = function (frame) {
      if (!self.paused) {
        self.update(frame);
        requestAnimationFrame (self.play);
      }
    };
    this.radioactive = function () {
      if (!self.paused){
        cells.filter(function (cell) {
          if (Math.random() < 0.005) {
            cell.living = !cell.living;
          }
        });
      }
    };
    this.init();
    function ensureCanvas() {
      canvas.setAttribute('width', window.innerWidth);
      canvas.setAttribute('height', window.innerHeight);
      var rows = Math.ceil(canvas.height / cellSize);
      var columns = Math.ceil(canvas.width / cellSize);
      for (var r = 0; r < rows; r++) {
        if (!board[r])board[r] = [];
        for (var c = 0; c < columns; c++) {
          if (!board[r][c]) {
            board[r][c] = new Cell(r, c);
            cells.push(board[r][c]);
          }
        }
      }
      setInterval(self.radioactive, 1000 * 30);
      row = rows;
      column = columns;
    }
    function iterateRedrawCell(callback) {
      for (var r = 0; r < row; r += 1) {
        for (var c = 0; c < column; c += 1) {
          callback(board[r][c]);
        }
      }
    }
    function Cell(row, column) {
      var cell = this;
      this.living = 0;
      this.x = cellSize * column;
      this.y = cellSize * row;
      this.nextGen = 0;
      this.update = function () {
        try{
          var neighbours = self.countNearbyLives(row, column);
          /* Birth Rule */
          if (neighbours === 3) {
            cell.nextGen = 1;
            return;
          }
          // /* Death Rule */
          // if (Math.rand() < 0.2) {
          //  ceil.nextGen = 0;
          //  return;
          // }
          if (neighbours > 3 || neighbours < 2) {
            cell.nextGen = 0;
            return;
          }
        } catch (e){};
        cell.nextGen = cell.living;
        // console.log(neighbours)
      };
      this.draw = function () {
        if (cell.living) {
          ctx.beginPath();
          // ctx.rect(this.x, this.y, cellSize-1, cellSize-1);
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x + cellSize - 1, this.y);
          ctx.lineTo(this.x + (cellSize - 1) / 2, this.y + cellSize - 1);
          ctx.fillStyle = 'rgba(66, 220, 244, 0.8)';
          ctx.fill();
          ctx.closePath();
        }
      };
    }
  }
  // function sumReducer(prev, current){
  //  return prev + current;
  // }
  var GOL =  new GameOfLife(document.getElementById('game-of-life'));
  GOL.play();
})();
