// created by Evan Heaton on 09/05/17

var player1;
var player2;
var bullets;

var WINDOW_X = 500;
var WINDOW_Y = 500;

function setup() {
	createCanvas(500, 500);
	player1 = new player(1, 50, 200);
	player2 = new player(2, 250, 200);
	bullets = new bulletArray();
	frameRate(50); // set the frame rate to 50fps

	stroke(0, 0, 0, 0);
}

function draw() {
	background(220, 220, 220); // grey background
	evaluateKeys();
	player1.display();
	player2.display();

	bullets.advance(); // move the bullets forward one frame and then check for collisions
	bullets.display();

	fill(0, 0, 0);
	stroke(0, 0, 0);
	textSize(12);
	player1.evaluateMovingDirection();
	// text("player1 driving direction: " + player1.driving_direction, 10, 400);
	// text("player1 moving direction: " + player1.moving_direction.right, 10, 420);

	// Reset the tanks to know which key is being held down
	player1.resetKeys();
	player2.resetKeys();
}

// bullet object
function bullet(x0, y0, angle0, color) {
	this.x = x0;
	this.y = y0;
	this.angle = angle0;
	this.color = { red: color.red, green: color.green, blue: color.blue};
	this.diameter = 5;
	this.speed = 5;

	this.display = function() {
		fill(this.color.red, this.color.green, this.color.blue);
		stroke(this.color.red-80, this.color.green-80, this.color.blue-80);
		ellipse(this.x, this.y, this.diameter, this.diameter);
	}

	this.advance = function() {
		this.x = this.x + this.speed * Math.cos(this.angle);
		this.y = this.y + this.speed * Math.sin(this.angle);
	}

	this.collidesWith = function(player) {
		return (this.x - player.x)*(this.x - player.x) + (this.y - player.y)*(this.y - player.y) < (player.diameter/2)*(player.diameter/2);
	}
}

// player object
function player(num, xo, yo) {
	this.player_number = num;
	this.x = xo;
	this.y = yo;
	this.health = 40;
	this.visible = true;
	this.color = { red: random(255) + 30, green: random(255) + 30, blue: random(255) + 30};
	this.diameter = 30;
	this.cannon_size = 22;
	this.speed = 2;
	this.rotation = 0;
	this.last_moved_direction_rad = 0;
	this.moving_direction = { left: false, right: false, up: false, down: false };
	this.moving_direction_rad = 0;
	this.driving_direction = 0;
	this.driving_direction_speed = 0.2; //how much the driving_direction can change in a single frame

	this.exploding = false;
	this.exploding_frame = 0;

	this.approachDrivingDirection = function() {
		// adding 2PI to everything to avoid weirdness with
		if ((this.moving_direction_rad - this.driving_direction) > PI ) {
			// reverse the turning rules I think?
		}

		if (Math.abs(this.moving_direction_rad - this.driving_direction) > this.driving_direction_speed) {
			if (this.moving_direction_rad > this.driving_direction) {
			this.driving_direction += this.driving_direction_speed;
			} else {
				this.driving_direction -= this.driving_direction_speed;
			}
		} else {
			this.driving_direction = this.moving_direction_rad;
		}
	}

	this.moveLeft = function() {
		this.moving_direction.left = true;
		this.x -= this.speed;
	}
	this.moveRight = function() {
		this.moving_direction.right = true;
		this.x += this.speed;
	}
	this.moveUp = function() {
		this.moving_direction.up = true;
		this.y -= this.speed;
	}
	this.moveDown = function() {
		this.moving_direction.down = true;
		this.y += this.speed;
	}

	this.turnClockwise = function() {
		this.rotation += 0.1;
		if (this.rotation > 2*PI)
			this.rotation -= 2*PI;
	}
	this.turnCounterClockwise = function() {
		this.rotation -= 0.1;
		if (this.rotation < 0)
			this.rotation += 2*PI;
	}

	this.resetKeys = function() {
		this.moving_direction = { left: false, right: false, up: false, down: false };
	}

	this.evaluateMovingDirection = function() {
		var vertical, horizontal;
		if (this.moving_direction.up == this.moving_direction.down) {
			vertical = 0;
		} else if (this.moving_direction.up) {
			vertical = 1;
		} else {
			vertical = -1;
		}
		if (this.moving_direction.left == this.moving_direction.right) {
			horizontal = 0;
		} else if (this.moving_direction.left) {
			horizontal = -1;
		} else {
			horizontal = 1;
		}

		// determine radian angle of current movement
		if (horizontal == 0 && vertical == 0) {
			// nothing
		} else if (horizontal == 1 && vertical == 0) {
			this.moving_direction_rad = 0;
		} else if (horizontal == 1 && vertical == 1) {
			this.moving_direction_rad = 0.25*PI;
		} else if (horizontal == 0 && vertical == 1) {
			this.moving_direction_rad = 0.50*PI;
		} else if (horizontal == -1 && vertical == 1) {
			this.moving_direction_rad = 0.75*PI;
		} else if (horizontal == -1 && vertical == 0) {
			this.moving_direction_rad = PI;
		} else if (horizontal == -1 && vertical == -1) {
			this.moving_direction_rad = 1.25*PI;
		} else if (horizontal == 0 && vertical == -1) {
			this.moving_direction_rad = 1.5*PI;
		} else if (horizontal == 1 && vertical == -1) {
			this.moving_direction_rad = 1.75*PI;
		}

	}

	this.takeDamage = function() {
		console.log("player " + this.player_number + " hit!");
		if (this.health == 1) {
			this.explode();
		} else {
			this.health--;
		}
	}

	this.explode = function() {
		this.exploding = true;
	}

	this.display = function() {

		//remov this
		this.evaluateMovingDirection();
		this.approachDrivingDirection();

		if (this.visible) {
			// draw the treads
			push();
			stroke(0, 0, 0, 0);
			fill(this.color.red - 30, this.color.green - 30, this.color.blue - 30);
			translate(this.x, this.y);
			rotate(PI-this.driving_direction);
			rect(-(this.diameter+10)/2, -(this.diameter-4)/2, this.diameter + 10, this.diameter - 4);
			pop();
			// draw top layer of tank
			push();
			stroke(0, 0, 0, 0);
			fill(this.color.red, this.color.green, this.color.blue);
			translate(this.x, this.y);
			rotate(this.rotation);
			ellipse(0, 0, this.diameter, this.diameter);
			fill(0, 0, 0);
			rect(0, -1, this.cannon_size, 2);
			pop();
			// draw health bar
			push();
			translate(this.x, this.y);
			stroke(0, 0, 0, 0);
			fill(255, 0, 0);
			rect(-20, -30, 40, 5);
			fill(0, 255, 0);
			rect(-20, -30, this.health, 5);
			pop();
		}

		if (this.exploding) {
			this.exploding_frame++;
			if (this.exploding_frame < 30) {
				stroke(0, 0, 0, 0);
				fill(100 + this.exploding_frame*5, 130 - this.exploding_frame*5, 0);
				ellipse(this.x, this.y, this.exploding_frame*2, this.exploding_frame*2);
			} else if (this.exploding_frame == 30) {
				this.visible = false;
			} else if (this.exploding_frame > 30 && this.exploding_frame < 60) {
				stroke(0, 0, 0, 0);
				fill(255, 0, 0, (30-(this.exploding_frame-30))*8);
				ellipse(this.x, this.y, 60-(this.exploding_frame-30)*2, 60-(this.exploding_frame-30)*2);
			} else if (this.exploding_frame >=60) {
				this.exploding = false;
			}
		}

	}
}

// bullet array object
function bulletArray() {
	this.bullets = [[], []];

	this.player1Shoot = function() {
		this.bullets[0].push(new bullet(player1.x, player1.y, player1.rotation, player1.color));
	}

	this.player2Shoot = function() {
		this.bullets[1].push(new bullet(player2.x, player2.y, player2.rotation, player2.color));
	}

	this.display = function() {
		for (var i=0; i<this.bullets.length; i++) {
			for (var j=0; j<this.bullets[i].length; j++) {
				this.bullets[i][j].display();
			}
		}
	}

	this.advance = function() {
		for (var i=0; i<this.bullets.length; i++) {
			for (var j=0; j<this.bullets[i].length; j++) {
				// if the bullet is out of bounds, remove it.
				if (this.bullets[i][j].x > WINDOW_X || this.bullets[i][j].y > WINDOW_Y || this.bullets[i][j].x < 0 || this.bullets[i][j].y < 0) {
					this.bullets[i].splice(j, 1);
				} else { // otherwise advance it
					this.bullets[i][j].advance();
					if (i == 0) { // player 1's bullets
						if (this.bullets[i][j].collidesWith(player2)) {
							this.bullets[i].splice(j, 1);
							player2.takeDamage();
						}
					} else { // player 2's bullets
						if (this.bullets[i][j].collidesWith(player1)) {
							this.bullets[i].splice(j, 1);
							player1.takeDamage();
						}
					}
				}
			}
		}
	}
}

function evaluateKeys() {
	// player 1 controls
	if (keyIsDown(LEFT_ARROW)) {
		player1.moveLeft();
	}
	if (keyIsDown(RIGHT_ARROW)) {
		player1.moveRight();
	}
	if (keyIsDown(UP_ARROW)) {
		player1.moveUp();
	}
	if (keyIsDown(DOWN_ARROW)) {
		player1.moveDown();
	}
	if (keyIsDown(190)) { // <
		player1.turnClockwise();
	}
	if (keyIsDown(188)) { // >
		player1.turnCounterClockwise();
	}

	// player 2
	if (keyIsDown(65)) { // A
		player2.moveLeft();
	}
	if (keyIsDown(68)) { // D
		player2.moveRight();
	}
	if (keyIsDown(87)) { // W
		player2.moveUp();
	}
	if (keyIsDown(83)) { // S
		player2.moveDown();
	}
	if (keyIsDown(70)) { // F
		player2.turnClockwise();
	}
	if (keyIsDown(71)) { // G
		player2.turnCounterClockwise();
	}
}

function keyPressed() {
	// player 1 shoot
	if (keyCode == 16) {
		bullets.player1Shoot();
	}

	// player 2 shoot
	if (keyCode == 32) {
		bullets.player2Shoot();
	}
}
