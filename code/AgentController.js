inlets = 1;
outlets = 1;


var maxAgents   = 128;
var agents      = new Array(maxAgents);

var moveTask    = new Task(UpdateMovement, this);
var deltaTime   = 30;
var speed       = 20

for(var i = 0; i < maxAgents; i++){
    agents[i] = {
        "id" : i,
        "position": new Vector(0.0, 0.0, 0.0),
        "polar" : new Vector (0.0, 0.0, 1.0) // aed
    };
}

function release(agentId){
    post(agents[agentId].position.x); 
    moveTask.cancel();
    moveTask.interval = deltaTime;
    moveTask.repeat();
}

function lock(agentId){

}

function stop(){
    moveTask.cancel();
}

function UpdateMovement(){
    var dt = deltaTime * 0.001;
    for(var i = 0; i < 5; i++){
        agents[i].polar.x += dt * speed * Math.PI / 180.0;
        if(agents[i].polar.x >= 2.0 * Math.PI)
            agents[i].polar.x = 0.0;
        
        agents[i].position.x =  agents[i].polar.z * Math.cos(agents[i].polar.x);
        agents[i].position.y =  agents[i].polar.z * Math.sin(agents[i].polar.x);

        outlet(0, ["agent" + i, agents[i].position.x * 1000, agents[i].position.y * 1000, agents[i].position.z * 1000]);
    }
}
UpdateMovement.local = 1;

//https://evanw.github.io/lightgl.js/docs/vector.html

function Vector(x, y, z) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
  }

Vector.prototype = {
    negative: function() {
      return new Vector(-this.x, -this.y, -this.z);
    },
    add: function(v) {
      if (v instanceof Vector) return new Vector(this.x + v.x, this.y + v.y, this.z + v.z);
      else return new Vector(this.x + v, this.y + v, this.z + v);
    },
    subtract: function(v) {
      if (v instanceof Vector) return new Vector(this.x - v.x, this.y - v.y, this.z - v.z);
      else return new Vector(this.x - v, this.y - v, this.z - v);
    },
    multiply: function(v) {
      if (v instanceof Vector) return new Vector(this.x * v.x, this.y * v.y, this.z * v.z);
      else return new Vector(this.x * v, this.y * v, this.z * v);
    },
    divide: function(v) {
      if (v instanceof Vector) return new Vector(this.x / v.x, this.y / v.y, this.z / v.z);
      else return new Vector(this.x / v, this.y / v, this.z / v);
    },
    equals: function(v) {
      return this.x == v.x && this.y == v.y && this.z == v.z;
    },
    dot: function(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    },
    cross: function(v) {
      return new Vector(
        this.y * v.z - this.z * v.y,
        this.z * v.x - this.x * v.z,
        this.x * v.y - this.y * v.x
      );
    },
    length: function() {
      return Math.sqrt(this.dot(this));
    },
    unit: function() {
      return this.divide(this.length());
    },
    min: function() {
      return Math.min(Math.min(this.x, this.y), this.z);
    },
    max: function() {
      return Math.max(Math.max(this.x, this.y), this.z);
    },
    toAngles: function() {
      return {
        theta: Math.atan2(this.z, this.x),
        phi: Math.asin(this.y / this.length())
      };
    },
    angleTo: function(a) {
      return Math.acos(this.dot(a) / (this.length() * a.length()));
    },
    toArray: function(n) {
      return [this.x, this.y, this.z].slice(0, n || 3);
    },
    clone: function() {
      return new Vector(this.x, this.y, this.z);
    },
    init: function(x, y, z) {
      this.x = x; this.y = y; this.z = z;
      return this;
    }
  };
  
  Vector.negative = function(a, b) {
    b.x = -a.x; b.y = -a.y; b.z = -a.z;
    return b;
  };
  Vector.add = function(a, b, c) {
    if (b instanceof Vector) { c.x = a.x + b.x; c.y = a.y + b.y; c.z = a.z + b.z; }
    else { c.x = a.x + b; c.y = a.y + b; c.z = a.z + b; }
    return c;
  };
  Vector.subtract = function(a, b, c) {
    if (b instanceof Vector) { c.x = a.x - b.x; c.y = a.y - b.y; c.z = a.z - b.z; }
    else { c.x = a.x - b; c.y = a.y - b; c.z = a.z - b; }
    return c;
  };
  Vector.multiply = function(a, b, c) {
    if (b instanceof Vector) { c.x = a.x * b.x; c.y = a.y * b.y; c.z = a.z * b.z; }
    else { c.x = a.x * b; c.y = a.y * b; c.z = a.z * b; }
    return c;
  };
  Vector.divide = function(a, b, c) {
    if (b instanceof Vector) { c.x = a.x / b.x; c.y = a.y / b.y; c.z = a.z / b.z; }
    else { c.x = a.x / b; c.y = a.y / b; c.z = a.z / b; }
    return c;
  };
  Vector.cross = function(a, b, c) {
    c.x = a.y * b.z - a.z * b.y;
    c.y = a.z * b.x - a.x * b.z;
    c.z = a.x * b.y - a.y * b.x;
    return c;
  };
  Vector.unit = function(a, b) {
    var length = a.length();
    b.x = a.x / length;
    b.y = a.y / length;
    b.z = a.z / length;
    return b;
  };
  Vector.fromAngles = function(theta, phi) {
    return new Vector(Math.cos(theta) * Math.cos(phi), Math.sin(phi), Math.sin(theta) * Math.cos(phi));
  };
  Vector.randomDirection = function() {
    return Vector.fromAngles(Math.random() * Math.PI * 2, Math.asin(Math.random() * 2 - 1));
  };
  Vector.min = function(a, b) {
    return new Vector(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
  };
  Vector.max = function(a, b) {
    return new Vector(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
  };
  Vector.lerp = function(a, b, fraction) {
    return b.subtract(a).multiply(fraction).add(a);
  };
  Vector.fromArray = function(a) {
    return new Vector(a[0], a[1], a[2]);
  };
  Vector.angleBetween = function(a, b) {
    return a.angleTo(b);
  };

