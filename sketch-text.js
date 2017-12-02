var inc = 0.1;
var scl = 20,
    zoff = 0;
var cols, rows, movement = 0;
var particles = [];
var flowfield;
var designSz = [250, 200, 100]; // size title1
var genSz = [30, 20, 10]; // size title 2
var genX, genY;
var scrn = 0;
var font, bbox, font2, bbox2;

/**
 * add font
 */
function preload() {
  font = loadFont('Oswald.ttf');
}
/**
 * params window show
 */
function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  setDisplay();
}

/**
 * resize navigator
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setDisplay();
}

function setDisplay() {
  if (windowWidth > 1024) {
    scrn = 0;
  }
  if (windowWidth <= 1024) {
    scrn = 1;
  }
  if (windowWidth <= 500) {
    scrn = 2;
  }

  // define cols
  cols = floor(width / scl);
  rows = floor(height / scl);
  points = [];
  points2 = [];
  particles = [];
  background(200);
  textFont(font);
  textSize(designSz[scrn]);

  //define text form
  bbox = font.textBounds('loan', width / 2, height / 2);
  genX = [bbox.x - 255, bbox.x - 155, bbox.x - 80];
  genY = [bbox.y + 38, bbox.y + 25, bbox.y + 13];

  var points = font.textToPoints('loan', (width / 2) - (bbox.w / 2), (height / 2));

  for (var i = 0; i < points.length; i++) {
    var pt = points[i];
    particles[i] = new Particle(pt.x, pt.y);
  }

  // define position of second title
  textSize(genSz[scrn]);
  bbox2 = font.textBounds('TRUONG', width / 2, height / 2);
  var points2 = font.textToPoints('TRUONG', genX[scrn], genY[scrn]);

  for (var i = 0; i < points2.length; i++) {
    var pt = points2[i];
    particles[points.length + i] = new Particle(pt.x, pt.y);
  }
  flowfield = new Array(cols);
  loop();
}

/**
 * loop draw
 */
function draw() {
  fill(200);
  noStroke();
  textSize(designSz[scrn]);
  text("loan", (width / 2) - (bbox.w / 2), (height / 2));
  textSize(genSz[scrn]);
  fill(200);
  text("TRUONG", genX[scrn] + 355, genY[scrn]);
  var yoff = 0;

  // calc flowfield
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = (x + y * cols);
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 4;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(0.4);
      flowfield[index] = v;
      xoff += inc;
    }
    yoff += inc;
    zoff += 0.001;
  }
  // update particles
  for (var i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
    if (particles[i].stop() == false) {
      noLoop();
    }
  }
}

/**
 * create Particles
 * @param {*} xPos 
 * @param {*} yPos 
 */
function Particle(xPos, yPos) {
  this.pos = createVector(xPos, yPos);
  this.vel = createVector(0, 0);
  this.acc = createVector(0, 0);
  this.maxspeed = 1.9;
  this.prevPos = this.pos.copy();
  this.life = 70;
  // update particles
  this.update = function () {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    if (this.life > 25) {
      this.life -= 0.33;
    } else {
      this.life -= 0.01;
    }
  }
  // follow the flow field
  this.follow = function (vectors) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    let force = vectors[index];
    this.applyForce(force);
  }
  // draw lines
  this.applyForce = function (force) {
    this.acc.add(force);
  }
  this.show = function () {
    stroke(0, 0, 60, this.life);
    strokeWeight(2);
    line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
    this.updatePrev();
  }
  //update position
  this.updatePrev = function () {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }
  // controller: border left, right, top, bottom
  this.edges = function () {
    if (this.pos.x > width) {
      this.pos.x = 0;
      this.updatePrev();
    }
    if (this.pos.x < 0) {
      this.pos.x = width;
      this.updatePrev();
    }
    if (this.pos.y > height) {
      this.pos.y = 0;
      this.updatePrev();
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
      this.updatePrev();
    }
  }
  this.stop = function () {
    if (this.life < 0) {
      return false;
    }
  }
}