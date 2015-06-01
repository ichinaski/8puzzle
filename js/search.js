function State(cells, parentID, action, cost) {
    this.cells = cells;
    this.parentID = parentID;
    this.action = action;
    this.cost = cost;
}

State.prototype.getID = function () {
    return this.cells.toString();
}

State.prototype.getZero = function () {
    for (var x=0; x<this.cells.length; x++) {
        for (var y=0; y<this.cells.length; y++) {
            if (!this.cells[x][y]) {
                return {x: x, y: y};
            }
        }
    }
    return null;
}

State.prototype.succesors = function () {
  var cells = this.cells;
  var actions = {
      0: { x: 0,  y: -1 }, // Up
      1: { x: 1,  y: 0 },  // Right
      2: { x: 0,  y: 1 },  // Down
      3: { x: -1, y: 0 }   // Left
  };

  var succ = [];
  for (var action in actions) {
    var zero = this.getZero();
    var x = zero.x - actions[action].x;
    var y = zero.y - actions[action].y;
    if (x > -1 && x < cells.length && y > -1 && y < cells.length) {
      var succCells = [];
      for (var i=0; i<cells.length; i++) {
          succCells[i] = cells[i].slice(0);
      }
      
      // swap zero and target cell
      var tmp = succCells[x][y];
      succCells[x][y] = null;
      succCells[zero.x][zero.y] = tmp;

      succ.push({cells:succCells, action:action});
    }
  }

  return succ;
}

function equals(a1, a2) {
    for (var x=0; x<a1.length; x++) {
        for (var y=0; y<a1.length; y++) {
            if (a1[x][y] != a2[x][y]) {
                return false;
            }
        }
    }
    return true;
}

function search(start, goal) {
    console.log("search() - " + start + " -- " + goal);
    // FIXME
    var hCost = function(cells) {
      var cost = 0;
      for (var x=0; x<cells.length; x++) {
        for (var y=0; y<cells.length; y++) {
          if (cells[x][y] != goal[x][y]) {
              // increase the cost for each tile out of the goal position
              cost++;
          }
        }
      }
      return cost;
    }

    this.openSet = new PQueue();
    this.closedSet = {};

    var state = new State(start, null, null, 0);
    openSet.push(state, 0);

    while (openSet.size() > 0) {
        var state = openSet.pop();

        // Only consider non-expanded states
        if (!(state.getID() in closedSet)) {
            // Store the node in the closed list, with a reference to its parent
            closedSet[state.getID()] = state;

            if (equals(state.cells, goal)) {
                var path = [];
                while (state && state.action != null) {
                    path.push(state.action);
                    state = closedSet[state.parentID];
                }
                return path.reverse();
            }

            // Add the states not expanded into the openSet
            var succ = state.succesors();
            succ.forEach(function(s) {
                succState = new State(s.cells, state.getID(), s.action, state.cost + 1)
                if (!(succState.getID() in closedSet)) {
                    openSet.push(succState, succState.cost+hCost(succState.cells));
                }
            });
        }
    }
    console.log("path not found");
    return null;
}
