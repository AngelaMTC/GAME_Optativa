window.addEventListener("load", function () {

  //EL diseño usado en el .html:
  const canvas = document.getElementById("canvas1");
  const ctx = canvas.getContext("2d");

  //Diseño del juego:
  canvas.width = 800;
  canvas.height = 800;

  //Conguración para moverse:
  class InputHandler {
    constructor(game) {
      this.game = game;
      //Uso de teclas para subir o bajar:
      window.addEventListener("keydown", e => {
        if (((e.key === "ArrowUp") || (e.key === "ArrowDown")
        ) && (this.game.keys.indexOf(e.key) === -1)) {
          this.game.keys.push(e.key);
        } else if (e.key === ' ') {
          this.game.player.shootTop();
        }
        console.log(this.game.keys);
      });

      window.addEventListener("keyup", e => {
        if (this.game.keys.indexOf(e.key) > -1) {
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
        console.log(this.game.keys);
      });

    }
  }
  //Aquí se hace la clase del proyectil para que este tenga su funcionamiento:
  class Projectile {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      // El diseño del proyectil:
      this.width = 10;
      this.height = 3;
      //Rapidez del proyectil:
      this.speed = 2;
      this.markedForDeletion = false;
    }

    update() {
      this.x += this.speed;
      if (this.x > this.game.width * 0.8) {
        this.markedForDeletion = true;
      }
    }

    draw(context) {
      context.fillStyle = "yellow";
      context.fillRect(this.x, this.y, this.width, this.height);
    }


  }

  //Funcionamiento del jugador:
  class Player {
    constructor(game) {
      this.game = game;
      this.width = 120;
      this.height = 190;
      this.x = 20;
      this.y = 100;
      this.speedY = 0.5;
      this.maxSpeed = 1;
      this.projectiles = [];
    }

    //Para que el usuario pueda moverse:
    update() {
      this.y += this.speedY;
      if (this.game.keys.includes("ArrowUp")) {
        this.speedY = -2;
      } else if (this.game.keys.includes("ArrowDown")) {
        this.speedY = 2;
      } else {
        this.speedY = 0;
      }

      //Configuración de proyectiles, para cuando toque un enemigo se elimine:
      this.y += this.speedY;
      this.projectiles.forEach(projectile => {
        projectile.update();
      });

      this.projectiles = this.projectiles.filter(projectile => !projectile.markedForDeletion);

    }

    //Estilo del proyectil:
    draw(context) {
      context.fillStyle = "#41babf ";
      context.fillRect(this.x, this.y, this.width, this.height);
      this.projectiles.forEach(projectile => {
        projectile.draw(context);
      });

    }

    shootTop() {
      if (this.game.ammo > 0) {
        this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30));
        this.game.ammo--;
      }

    }

  }

  //Configuración de enemigo:
  class Enemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markedForDeletion = false;
      this.lives = 8;
      this.score = this.lives;
    }

    //Movilidad del enemigo:
    update() {
      this.x += this.speedX;
      if (this.x + this.width < 0) {
        this.markedForDeletion = true;
      }
    }

    //Estilo del enemigo:
    draw(context) {
      context.fillStyle = "red";
      context.fillRect(this.x, this.y, this.width, this.height);
      context.fillStyle = "black";
      context.font = "20px Times Roman";
      context.fillText(this.lives, this.x, this.y);
    }
  }

  //Tipo de enemigo:
  class Angler1 extends Enemy {
    constructor(game) {
      super(game);
      this.width = 228 * 0.2;
      this.height = 169 * 0.2;
      this.y = Math.random() * (this.game.height * 0.9 - this.height);

    }
  }

  //Imagen de fondo específicado:
  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 2000;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }

    update() {
      if (this.x <= -this.width) this.x = 0;
      else this.x -= this.game.speed * this.speedModifier;
    }

    //Diseño:
    draw(context) {
      context.drawImage(this.image, this.x, this.y);
    }
  }

  //Configuración del fondo:
  class BackGround {
    constructor(game) {
      this.game = game;
      this.image1 = document.getElementById("layer1");
      this.image2 = document.getElementById("layer2");
      this.image3 = document.getElementById("layer3");
      this.image4 = document.getElementById("layer4");

      this.layer1 = new Layer(this.game, this.image1, 0.2);
      this.layer2 = new Layer(this.game, this.image2, 0.5);
      this.layer3 = new Layer(this.game, this.image3, 3);
      this.layer4 = new Layer(this.game, this.image4, 1);

      this.layers = [this.layer1, this.layer2, this.layer3, this.layer4];
    }

    update() {
      this.layers.forEach(layer => layer.update());
    }

    draw(context) {
      this.layers.forEach(layer => layer.draw(context));
    }

  }

  //Diseño de fondo:
  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 40;
      this.fontFamily = "Helvetica";
      this.color = "white";
    }

    //Diseño del fondo:
    draw(context) {
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.shadowColor = "black";
      context.font = this.fontSize + "px " + this.fontFamily;
      context.fillText("Score " + this.game.score, 20, 40);
      for (let i = 0; i < this.game.ammo; i++) {
        context.fillRect(20 + 5 * i, 50, 3, 20);
      }
      const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
      context.fillText("Timer: " + formattedTime, 20, 100);
      if (this.game.gameOver) {
        context.textAlign = "center";
        let message1;
        let message2;
        if (this.game.score > this.game.winningScore) {
          message1 = "¡Felicidades!";
          message2 = "Has ganado.";
        } else {
          message1 = "GAME OVER";
          message2 = "Has perdido, inténtalo de nuevo.";
        }
        context.font = "50px " + this.fontFamily;
        context.fillText(message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 20);
        context.font = "25px " + this.fontFamily;
        context.fillText(message2,
          this.game.width * 0.5,
          this.game.height * 0.5 + 20);
      }

      context.restore();
    }
  }
//Configuración del juego:
  class Game {
    constructor(width, height) {
      //Diseño:
      this.width = width;
      this.height = height;
      //Declarando al jugador:
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      //Declarando el fondo:
      this.backGround = new BackGround(this);
      this.keys = [];
      //Configuraciones de la munición (tiempo, intérvalo):
      this.ammo = 10;
      this.ammoTimer = 0;
      this.ammoInterval = 500;
      this.maxAmmo = 50;
      //Configuración de los enemigos (tiempo, intérvalo):
      this.enemies = [];
      this.enemiesTimer = 0;
      this.enemiesInterval = 1000;
      //Estado falso de que aún no se ha perdido en el juego:
      this.gameOver = false;
      // La cuenta de cuanto llevas:
      this.score = 0;
      //Si ganas el juego es la cuenta:
      this.winningScore = 10;
      this.gameTime = 0;
      //Tiempo de duración del juego:
      this.timeLimit = 10000;
      //Rapidez del juego:
      this.speed = 1;
    }

    update(deltaTime) {
      if (!this.gameOver) this.gameTime += deltaTime;
      if (this.gameTime > this.timeLimit) this.gameOver = true;
      this.backGround.update();
      this.player.update();
      if (this.ammoTimer > this.ammoInterval) {
        if (this.ammo < this.maxAmmo) {
          this.ammo++;
          this.ammoTimer = 0;
        }
      } else {
        this.ammoTimer += deltaTime;
      }

      //Al tocar cada enemigo con la bala, este reaccione:
      this.enemies.forEach(enemy => {
        enemy.update();
        if (this.checkCollition(this.player, enemy)) {
          enemy.markedForDeletion = true;
        }
        this.player.projectiles.forEach(projectile => {
          if (this.checkCollition(projectile, enemy)) {
            enemy.lives--;
            projectile.markedForDeletion = true;
            if (enemy.lives <= 0) {
              enemy.markedForDeletion = true;
              if (!this.gameOver) this.score += enemy.score;
              if (this.score > this.winningScore) {
                this.gameOver = true;
              }
            }
          }
        });
      });

      //Se agrega enemigo dependiendo del tiempo, intérvalo y el juego:
      this.enemies = this.enemies.filter(enemy => !enemy.markedForDeletion);

      if (this.enemiesTimer > this.enemiesInterval && !this.gameOver) {
        this.addEnemy();
        this.enemiesTimer = 0;
      } else {
        this.enemiesTimer += deltaTime;
      }

    }

    // Se le dibuja el fondo y el jugador:
    draw(context) {
      this.backGround.draw(context);
      this.player.draw(context);
      this.ui.draw(context);

      this.enemies.forEach(enemy => {
        enemy.draw(context);
      });
    }

    //Agregación de enemigos:
    addEnemy() {
      this.enemies.push(new Angler1(this));
    }

    checkCollition(rect1, rect2) {
      return (rect1.x < rect2.x + rect2.width
        && rect1.x + rect1.width > rect2.x
        && rect1.y < rect2.y + rect2.height
        && rect1.height + rect1.y > rect2.y
      );
    }

  }

  const game = new Game(canvas.width, canvas.height);
  let lastTime = 0;

  //Animaciones:
  function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate(0);
});