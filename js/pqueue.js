function Entry(item, priority) {
    this.item = item;
    this.priority = priority;
}

function PQueue() {
    this.heap = []
}

PQueue.prototype.size = function() {
    return this.heap.length;
}

PQueue.prototype.swap = function(index, parent) {
    var tmp = this.heap[index];
    this.heap[index] = this.heap[parent];
    this.heap[parent] = tmp;
}

PQueue.prototype.push = function(item, priority) {
    this.heap.push(new Entry(item, priority));

    // Bubble up to restore heap property
    var i = this.heap.length - 1, p = Math.floor((i - 1) / 2);
    while(p >= 0 && this.heap[i].priority < this.heap[p].priority) {
        this.swap(i, p);
        i = p;
        p = Math.floor((i - 1) / 2);
    }
}

PQueue.prototype.pop = function() {
    // move last leaf to root
    this.swap(this.heap.length - 1, 0);

    var entry = this.heap.pop();// Item to return

    // Bubble down to restore heap property
    var i = 0;
    var childL = 2 * i + 1, childR = childL + 1;

    while (this.heap.length > childL) {
        var child = childL;
        if (this.heap.length > childR && this.heap[childR].priority < this.heap[childL].priority) {
            child = childR;
        }

        if (this.heap[i].priority > this.heap[child].priority) {
            this.swap(i, child);

            i = child;
            childL = 2 * i + 1, childR = childL + 1;
        } else {
            break;
        }
    }

    return entry.item;
}
