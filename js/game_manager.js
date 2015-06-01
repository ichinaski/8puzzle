function GameManager(size, InputManager, Actuator) {
    this.size           = size; // Size of the grid
    this.inputManager   = new InputManager;
    this.actuator       = new Actuator;

    this.startTiles     = 2;

    this.inputManager.on("move", this.move.bind(this));
    this.inputManager.on("restart", this.restart.bind(this));
    this.inputManager.on("solve", this.solve.bind(this));

    this.restart();
}

// Set up and restart the game
GameManager.prototype.restart = function () {
    this.grid        = new Grid(this.size);
    this.score       = 0;

    // Add the initial tiles
    this.addStartTiles();

    // Apply 400 random moves to the initial state
    // Kind of naive, but ensures the puzzle is solvable.
    for (var i=0; i<400; i++) {
        var action = Math.floor(Math.random() * 4);
        this.move(action);
    }
    this.score = 0;// Restart score

    // Update the actuator
    this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
    for (var x=0; x<this.size; x++) {
        for (var y=0; y<this.size; y++) {
            if (!(x == 0 && y == 0)) {
                var tile = new Tile({x:x, y:y}, x+y*3);
                this.grid.insertTile(tile);
            }
        }
    }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
    this.actuator.actuate(this.grid, {
        score: this.score
    });
};

// Save all tile positions
GameManager.prototype.prepareTiles = function () {
    this.grid.eachCell(function (x, y, tile) {
        if (tile) {
            tile.savePosition();
        }
    });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
    this.grid.cells[tile.x][tile.y] = null;
    this.grid.cells[cell.x][cell.y] = tile;
    tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
    // 0: up, 1: right, 2: down, 3: left
    var self = this;
    var cell, tile;

    var vector     = this.getVector(direction);
    var traversals = this.buildTraversals(vector);
    var moved      = false;

    // Save the current tile positions and remove merger information
    this.prepareTiles();

    // Traverse the grid in the right direction and move tiles
    traversals.x.forEach(function (x) {
        traversals.y.forEach(function (y) {
            cell = { x: x, y: y };
            tile = self.grid.cellContent(cell);

            if (tile && !moved) {
                var positions = self.findFarthestPosition(cell, vector);
                self.moveTile(tile, positions.farthest);
                if (!self.positionsEqual(cell, tile)) {
                    moved = true; // The tile moved from its original cell!
                }
            }
        });
    });

    if (moved) {
        this.score++;
        this.actuate();
    }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
    // Vectors representing tile movement
    var map = {
        0: { x: 0,  y: -1 }, // Up
        1: { x: 1,  y: 0 },  // Right
        2: { x: 0,  y: 1 },  // Down
        3: { x: -1, y: 0 }   // Left
    };

    return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
    var traversals = { x: [], y: [] };

    for (var pos = 0; pos < this.size; pos++) {
        traversals.x.push(pos);
        traversals.y.push(pos);
    }

    // Always traverse from the farthest cell in the chosen direction
    if (vector.x === 1) traversals.x = traversals.x.reverse();
    if (vector.y === 1) traversals.y = traversals.y.reverse();

    return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
    var previous;

    // Progress towards the vector direction until an obstacle is found
    do {
        previous = cell;
        cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
    } while (this.grid.withinBounds(cell) &&
            this.grid.cellAvailable(cell));

    return {
        farthest: previous,
            next: cell // Used to check if a merge is required
    };
};

GameManager.prototype.positionsEqual = function (first, second) {
    return first.x === second.x && first.y === second.y;
};

GameManager.prototype.availableMoves = function() {
    var actions = [];
    var zero = this.grid.availableCells()[0];// single one
    for (var action in [0, 1, 2, 3]) {
        var vector = this.getVector(action);
        var x = zero.x - vector.x;
        var y = zero.y - vector.y;
        if (x > -1 && x < this.size && y > -1 && y < this.size) {
            actions.push(action);
        }
    }
    return actions;
};

// moves continuously until game is over
GameManager.prototype.solve = function() {
    var start = [];
    this.grid.eachCell(function(x, y, tile) {
        if (start.length <= x) {
            start.push([]);
        }

        start[x][y] = tile ? tile.value : null;
    });
    var goal = [[null, 3, 6], [1, 4, 7], [2, 5, 8]];
    var path = search(start, goal);

    if (!path) {
        return;// TODO: Show error message?
    }

    var self = this;
    // We reverse the path in order to pop() elements form the tail.
    // This is slightly naive, since the path could be returned this
    // way from Search()... but... meh.
    var reversed = path.reverse();
    var walk = function(actions) {
        if (actions.length > 0) {
            self.move(actions.pop());
            setTimeout(function(){
                walk(actions);
            }, 600);
        }
    }

    walk(reversed);
};
