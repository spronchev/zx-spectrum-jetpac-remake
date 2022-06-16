import Phaser from 'phaser'
import Laser from "../models/laser";
import Fuel from "../models/fuel";
import Rocket from "../models/rocket";
import Player from "../models/player";
import Statics from "../utils/statics";

export default class GameScene extends Phaser.Scene
{
    constructor()
    {
        super('game-scene')

        this.player = undefined
        this.cursors = undefined
        this.lasers = undefined
        this.platforms = undefined
        this.enemies = undefined
        this.enemiesLevelTwo = undefined
        this.fuel = undefined
        this.fuelTube = undefined
        this.fuelTube2 = undefined
        this.rocket = undefined
        this.rocket1 = undefined
        this.rocket2 = undefined
        this.rocket3 = undefined
        this.rocketParts = undefined
        this.spacebar = undefined
        this.engineLeft = undefined
        this.engineRight = undefined
        this.rocketDestination = undefined
        this.timerLevelTwo = undefined
        this.scoreText = undefined
        this.livesText = undefined
        this.gems = undefined
        this.toResetTube = false
        this.reCreateFuel = false
        this.turnedLeft = false
        this.gameStopped = false
        this.rocketAssembled = false
        this.readyToFly = false
        this.needsLevelUp = false
        this.playerFlying = false
        this.followingPlayer = false
        this.invincible = false
        this.spawningGem = false
        this.score = 0
        this.fuelGathered = 0
        this.lastFired = 0
        this.level = 1
        this.lives = 10
        this.multiplier = 0.85
    }

    preload()
    {
        this.load.image('bg', 'assets/bg.png')
        this.load.image('ground', 'assets/platform.png')
        this.load.image('ground-m', 'assets/platform-m.png')
        this.load.image('ground-s', 'assets/platform-s.png')
        this.load.image('fuel', 'assets/fuel.png')
        this.load.image('boom', 'assets/boom.png')
        this.load.image('boom2', 'assets/boom.png')
        this.load.image('rocket', 'assets/ship.png')
        this.load.image('rocket-one', 'assets/ship-part-one.png')
        this.load.image('rocket-two', 'assets/ship-part-two.png')
        this.load.image('rocket-three', 'assets/ship-part-three.png')
        this.load.image('engine', 'assets/engine.png')
        this.load.image('rocket-part', 'assets/rocket-part.png')
        this.load.image('gem-red', 'assets/gem-red.png')
        this.load.image('gem-white', 'assets/gem-white.png')
        this.load.image('gem-green', 'assets/gem-green.png')
        this.load.image('gem-blue', 'assets/gem-blue.png')
        this.load.spritesheet('invader', 'assets/invader1.png', { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet('invader2', 'assets/invader2.png', { frameWidth: 32, frameHeight: 32 })
        this.load.spritesheet('shooter-3', 'assets/shooter.png', { frameWidth: 59.66, frameHeight: 58 })
        this.load.spritesheet("beam", "assets/laser.png", { frameWidth: 128, frameHeight: 2 })
    }

    create()
    {
        this.add.image(400, 300, 'bg')

        const restricts = this.physics.add.staticGroup()
        restricts.create(0, 0, 'rocket-part').setSize(1700, 1).setVisible(false)

        this.createAnimations();

        //Score
        this.scoreText = this.add.text(16, 16, 'score: ' + this.score, { fontSize: '32px', fill: '#ffffff' });
        this.livesText = this.add.text(630, 16, 'lives: ' + this.lives, { fontSize: '32px', fill: '#ffffff' });

        //Gems
        this.gems = this.physics.add.group()

        //Rocket end point
        this.rocketDestination = this.physics.add.sprite(490, 5, 'rocket-part').setVisible(false)
        this.rocketDestination.body.moves = false

        // Entities
        this.platforms = this.createPlatforms()
        this.player = this.createPlayer()

        //Fuel tube
        this.fuelTube = this.add.rectangle(450, 200, 1, 740).setInteractive()
        this.fuelTube2 = this.add.rectangle(530, 200, 1, 740).setInteractive()

        //Rocket
        this.rocketParts = this.createRocketParts()

        this.rocket1 = this.createRocketPartOne(650, 0)

        this.rocket2 = this.createRocketPartTwo(340, 0)

        this.rocket3 = this.createRocketPartThree(120, 0)

        // Keyboard bind
        this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

        // Groups
        this.lasers = this.physics.add.group({
            classType: Laser,
            maxSize: 50,
            runChildUpdate: true,
            allowGravity: false
        })

        this.enemies = this.physics.add.group({
            defaultKey: 'invader',
            immovable: false,
            runChildUpdate: true,
            allowGravity: false,
        })

        this.enemiesLevelTwo = this.physics.add.group({
            defaultKey: 'invader2',
            immovable: false,
            runChildUpdate: true,
            allowGravity: false,
        })

        this.fuel = this.createFuel(-100, -100).setActive(false).setVisible(false)

        // Colliders / Overlaps
        this.physics.add.collider(this.player, restricts)
        this.physics.add.collider(this.player, this.platforms)
        this.physics.add.collider(this.gems, this.platforms)
        this.physics.add.collider(this.rocketParts, this.platforms)
        this.physics.add.collider(this.fuel, this.platforms);
        this.physics.add.collider(this.lasers, this.enemies);
        this.physics.add.collider(this.lasers, this.enemiesLevelTwo);
        this.physics.add.collider(this.platforms, this.enemies);
        this.physics.add.collider([this.rocket1, this.rocket2, this.rocket3], this.fuel);
        this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemy, null, this)
        this.physics.add.overlap(this.lasers, this.enemiesLevelTwo, this.hitEnemy, null, this)


        this.physics.add.overlap(this.gems, this.player, (gem , player) =>
        {
            this.score += Statics.random(1, 6) * this.getMultiplier()
            player.destroy()
        })

        this.physics.add.collider(this.rocketParts, this.rocketParts,  (r1, r2) =>
        {
            const b1 = r1.body
            const b2 = r2.body

            if (b1.y > b2.y)
            {
                b2.y += (b1.top - b2.bottom)
                b2.stop()
            } else
            {
                b1.y += (b2.top - b1.bottom)
                b1.stop()
            }
        });

        this.physics.add.overlap([this.rocket1, this.rocket2, this.rocket3], this.player, function (rocket, player)
        {
            if(!rocket.texture)
            {
                return
            }

            if(rocket.texture.key === 'rocket-one')
            {
                this.collectedRocket1 = true
                this.assembleRocket(rocket, player)
            }

            if(rocket.texture.key === 'rocket-two' && this.collectedRocket1)
            {
                this.collectedRocket2 = true
                this.assembleRocket(rocket, player)
            }

            if(rocket.texture.key === 'rocket-three' && this.collectedRocket2)
            {
                this.collectedRocket3 = true
                this.assembleRocket(rocket, player)
            }

        }, null, this);

        this.physics.add.collider(this.platforms, this.enemies, (platform, enemy) =>
        {
            enemy.anims.play('explode')
            enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                this.resetEnemy(enemy)
            }, this)
        })

        this.physics.add.overlap(this.platforms, this.enemiesLevelTwo, (platform, enemy) =>
        {
            enemy.anims.play('explode2')
            enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
            {
                this.resetEnemy(enemy)
            }, this)
        })

        this.physics.add.overlap(this.enemies, this.enemiesLevelTwo, (enemy1, enemy2) =>
        {
            enemy1.anims.play('explode')
            enemy2.anims.play('explode2')
            enemy1.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
            {
                enemy1.destroy()
            })
            enemy2.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
            {
                enemy2.destroy()
            })
        })

        // Cursors
        this.cursors = this.input.keyboard.createCursorKeys()

        this.engineLeft = this.add.sprite(483.5, 565, 'engine').setVisible(false)
        this.engineRight = this.add.sprite(500.5, 565, 'engine').setVisible(false)

        // Timed adding enemies
        this.time.addEvent({
            delay: 3000,
            callback: () =>
            {
                this.addEnemy(this.enemies, 'invader')
            },
            callbackScope: this,
            loop: true
        })
    }

    spawnGems()
    {
        const delay = Statics.random(5750, 10325)
        const textures = ['gem-red', 'gem-green', 'gem-white', 'gem-blue']

        if(!this.spawningGem && this.gems.countActive(true) < 6)
        {
            this.spawningGem = true

            this.time.delayedCall(delay, () =>
            {
                const gem = this.add.sprite(Statics.random(0, 800), 0, textures[Statics.random(0, 3)])

                this.gems.add(gem)
                this.spawningGem = false
            })
        }
    }

    timerLevelTwoEnemy()
    {
        console.log('inside timer enemy')
        this.timerLevelTwo = this.time.addEvent({
            delay: 3000,
            callback: () =>
            {
                this.addEnemy(this.enemiesLevelTwo, 'invader2')
            },
            callbackScope: this,
            loop: true
        })
    }

    createRocketParts()
    {
        const rocketParts = this.physics.add.group({
            key: 'rocket-part',
            frameQuantity: 5,
            collideWorldBounds: true,
            setXY: { x: 490, y: 450, stepY: -34 }
        })

        rocketParts.children.iterate((child) =>
        {
            child.setVisible(false)
            child.setActive(false)
        })

        return rocketParts
    }

    collectFuel(fuel)
    {
        const newFuel = this.createFuel(fuel.x + 45, fuel.y + 5)
        newFuel.body.setGravity(0, 0)
        fuel.destroy();
    }

    buildRocket(rocket)
    {
        let newRocket

        if(rocket.texture.key === 'rocket-one')
        {
            newRocket = this.createRocketPartOne(rocket.x - 14.4, rocket.y + 1, 'rocket-one')
        }

        if(rocket.texture.key === 'rocket-two')
        {
            let y = rocket.y

            if (this.player.y >= 540.5) {
                y -= 10
            }

            newRocket = this.createRocketPartTwo(rocket.x + 23.7, y, 'rocket-two')
        }

        if(rocket.texture.key === 'rocket-three')
        {
            let y = rocket.y

            if(this.player.y >= 540.5)
            {
                y -= 24
            }

            newRocket = this.createRocketPartThree(rocket.x + 23.8, y + 3, 'rocket-three')
            this.rocketAssembled = true
        }

        newRocket.body.setGravity(0, 0)
        rocket.destroy()
    }

    createFuel(x, y)
    {
        this.fuel = new Fuel(this, x, y, 'fuel')

        this.physics.add.overlap(this.player, this.fuel, (player, fuel) =>
        {
            //If player is in between the 'tube' skip collision
            if(!(player.x > 450 && player.x < 530))
            {
                fuel.body.setVelocityY(-110)
                fuel.body.active = false
                fuel.body.allowGravity = false
                fuel.x = player.x
                fuel.y = player.y
            }
        })

        this.physics.add.collider(this.rocketParts, this.fuel, (rocketParts) =>
        {
            const entries = Array.from(this.rocketParts.children.entries)
            const child = entries[this.fuelGathered]
            const colorRed = [[129, 0, 32], [144, 10, 34], [164, 23, 28], [186, 38, 43], [225, 48, 45]]

            if(rocketParts.active && this.fuelGathered < 5)
            {
                child.setTint(Phaser.Display.Color.GetColor(colorRed[this.fuelGathered][0], colorRed[this.fuelGathered][1], colorRed[this.fuelGathered][2]))
                child.setVisible(true)
                child.setActive(true)
                rocketParts.destroy()
                this.fuelGathered++
            }
        })

        return this.fuel
    }

    createRocketPartOne(x, y)
    {
        this.rocket1 = new Rocket(this, x, y, 'rocket-one')

        return this.rocket1;
    }

    createRocketPartTwo(x, y)
    {
        this.rocket2 = new Rocket(this, x, y, 'rocket-two')
        this.physics.add.collider(this.rocket1, this.rocket2)

        return this.rocket2;
    }

    createRocketPartThree(x, y)
    {
        this.rocket3 = new Rocket(this, x, y, 'rocket-three')
        this.physics.add.collider(this.rocket3, this.rocket2)

        return this.rocket3;
    }

    createRocket()
    {
        this.rocket = new Rocket(this, 490, 518, 'rocket')
    }

    oneTimeCollideRocket()
    {
        const collider = this.physics.add.overlap(this.rocket, this.player, () =>
        {
            this.playerFlying = true
        }, () =>
        {
            this.physics.world.removeCollider(collider)
        }, this)
    }

    followPlayer()
    {
        this.enemiesLevelTwo.children.iterate((child) =>
        {
            Statics.GetBounds(child, Statics.rect10)

            Statics.randomizedDecision() ? child.y += Statics.random(0.5, 0.10) : child.y -= Statics.random(0.5, 0.10)

            this.physics.moveToObject(child, this.player, 32.5)
        })
    }

    levelUp()
    {
        this.level++

        if(this.level >= 2)
        {
            this.timerLevelTwoEnemy()
        }

        this.fuelGathered = 0
        this.followingPlayer = this.level > 1 && this.level % 2 !== 0
        this.rocketDestination.y = 5
        this.readyToFly = false
        this.needsLevelUp = false

        this.enemies.children.iterate((child) =>
        {
            child.setActive(true)
            child.setVisible(true)
        })

        this.enemiesLevelTwo.children.iterate((child) =>
        {
            child.setActive(true)
            child.setVisible(true)
        })

        this.gems.children.iterate((child) =>
        {
            child.setActive(true)
            child.setVisible(true)
        })

        this.rocket.body.setBounce(0)
        this.rocket.body.setVelocityY(0)
        this.rocket.body.setVelocityX(0)
        this.rocket.body.pushable = false
        this.player.setInteractive().setVisible(true)
        this.playerFlying = false
    }

    gameOver()
    {
        this.freezeGame(true)
        this.player.setTint(0xff0000)
        this.add.rectangle(0, 0, 1600, 1400, 220000, 0.5).setInteractive()
        this.add.text(320, 300, 'Restart', {fontSize: '60px', fontFamily: '"Electrolize"'}).setInteractive().on('pointerdown', () =>
        {
            this.freezeGame(false)
            this.scene.restart()
        })
    }

    freezeGame(condition)
    {
        if(condition)
        {
            this.gameStopped = true
            this.player.body.moves = false
            this.player.active = false
            this.enemies.active = false
            this.gems.active = false
            this.enemiesLevelTwo.active = false
        } else
        {
            this.gameStopped = false
            this.player.body.moves = true
            this.player.active = true
            this.enemies.active = true
            this.gems.active = true
            this.enemiesLevelTwo.active = true
        }
    }

    hitPlayer(group)
    {
        group.children.iterate((child) =>
        {
            Statics.GetBounds(child, Statics.rect8)

            if(Statics.RectangleToRectangle(Statics.rect7, Statics.rect8))
            {
                if(this.lives === 0)
                {
                    this.gameOver()
                }

                if(this.lives > 0 && !this.invincible)
                {
                    this.invincible = true
                    this.lives--
                    this.player.setTint(Phaser.Display.Color.GetColor(255, 0,0))
                    this.time.delayedCall(2150, () =>
                    {
                        this.player.clearTint()
                        this.invincible = false
                    })
                }
            }
        })
    }


    prepareRocket()
    {
        this.readyToFly = true
        this.engineLeft.setVisible(true)
        this.engineRight.setVisible(true)
        this.rocket1.destroy()
        this.rocket2.destroy()
        this.rocket3.destroy()
        this.rocketParts.children.iterate((child) =>
        {
            child.setActive(false)
            child.setVisible(false)
        })
    }

    update(time, delta)
    {
        if(this.gameStopped)
        {
            return
        }

        this.updateScoreText()
        this.updateLivesText()
        this.hitPlayer(this.enemies)
        this.hitPlayer(this.enemiesLevelTwo)
        this.spawnGems()

        Statics.GetBounds(this.fuel, Statics.rect1)
        Statics.GetBounds(this.fuelTube, Statics.rect2)
        Statics.GetBounds(this.fuelTube2, Statics.rect3)
        Statics.GetBounds(this.rocket1, Statics.rect4)
        Statics.GetBounds(this.rocket2, Statics.rect5)
        Statics.GetBounds(this.rocket3, Statics.rect6)
        Statics.GetBounds(this.player, Statics.rect7)
        Statics.GetBounds(this.platforms, Statics.rect9)

        if (Statics.RectangleToRectangle(Statics.rect1, Statics.rect2) || Statics.RectangleToRectangle(Statics.rect1, Statics.rect3))
        {
            this.collectFuel(this.fuel, this.fuelTube)
        }

        if (Statics.RectangleToRectangle(Statics.rect4, Statics.rect2) || Statics.RectangleToRectangle(Statics.rect4, Statics.rect3))
        {
            this.buildRocket(this.rocket1)
        }

        if (Statics.RectangleToRectangle(Statics.rect5, Statics.rect2) || Statics.RectangleToRectangle(Statics.rect5, Statics.rect3))
        {
            this.buildRocket(this.rocket2)
        }

        if (Statics.RectangleToRectangle(Statics.rect6, Statics.rect2) || Statics.RectangleToRectangle(Statics.rect6, Statics.rect3))
        {
            this.buildRocket(this.rocket3)
        }

        if(this.followingPlayer)
        {
            this.followPlayer()
        }

        if(this.rocket !== undefined && this.readyToFly && !this.playerFlying)
        {
            this.oneTimeCollideRocket()
        }

        if(this.playerFlying && this.fuelGathered === 5)
        {
            this.flyRocket()
            this.needsLevelUp = true
        }

        if(this.fuelGathered === 5 && !this.playerFlying)
        {
            this.prepareRocket()

            if(!this.rocket)
            {
                this.createRocket()
            }
        }

        if(this.rocket && (this.rocketDestination.y === 518 && this.rocket.y === 518) && this.needsLevelUp)
        {
            this.levelUp()
        }


        if(!this.playerFlying)
        {
            const enemiesCountLvlOne = this.enemies.countActive(true)
            const enemiesCountLvlTwo = this.enemiesLevelTwo.countActive(true)

            this.enemies.children.iterate(function(child)
            {
                this.moveEnemy(child, 1.4)

                if(enemiesCountLvlOne > 5 && child)
                {
                    child.destroy()
                }
            }, this)

            if(this.level >= 2)
            {
                this.enemiesLevelTwo.children.iterate(function(child)
                {
                    this.moveEnemy(child, 1.4)

                    if(enemiesCountLvlTwo > 5 && child)
                    {
                        child.destroy()
                    }
                }, this)
            }
        }

        if(!this.fuel.active && this.fuelGathered < 5)
        {
            if(this.rocketAssembled && !this.readyToFly)
            {
                this.createFuel(Statics.random(10, 450), 0)
            }
        }

        if (Phaser.Input.Keyboard.JustDown(this.spacebar) && time > this.lastFired)
        {
            const laser = this.lasers.get();

            if (laser)
            {
                laser.fire(this.player.x, this.player.y, this.turnedLeft, this.player);
                this.lastFired = time + 50;
            }

        }

        //This could have been done better
        if(!this.playerFlying)
        {
            //Down
            if (this.cursors.left.isDown && this.player.body.touching.down)
            {
                this.turnedLeft = true;
                this.turnedRight = false;
                this.player.setVelocityX(-180);
                this.player.anims.play('left-down', true);
            } else if (this.cursors.right.isDown && this.player.body.touching.down)
            {
                this.turnedRight = true;
                this.turnedLeft = false;
                this.player.setVelocityX(180);
                this.player.anims.play('right-down', true);
            } else if (this.cursors.down.isDown)
            {
                this.player.setVelocityY(190)
            } else
            {
                this.player.setVelocityX(0);
                this.turnedLeft ? this.player.anims.play('left-stop', true) : this.player.anims.play('right-stop', true)
                this.player.anims.stop(null, true);
            }

            //Up and diagonal
            if(this.cursors.up.isDown)
            {
                let speed = 100
                let speedDiag = speed * (1.44)
                this.player.setVelocityY(-220)

                if (this.cursors.left.isDown && this.cursors.up.isDown)
                {
                    this.player.body.setVelocityX(-speedDiag);
                    this.player.body.setVelocityY(-speedDiag);
                    this.player.anims.play('left-fly', true);
                }

                // Up and right
                if (this.cursors.right.isDown && this.cursors.up.isDown)
                {
                    this.player.body.setVelocityX(speedDiag);
                    this.player.body.setVelocityY(-speedDiag);
                    this.player.anims.play('right-fly', true);

                }

                // Down and right
                if (this.cursors.right.isDown && this.cursors.down.isDown)
                {
                    this.player.body.setVelocityX(speedDiag);
                    this.player.body.setVelocityY(speedDiag);
                    this.player.anims.play('right-fly', true);
                }

                // Down and left
                if (this.cursors.left.isDown && this.cursors.down.isDown)
                {
                    this.player.body.setVelocityX(-speedDiag);
                    this.player.body.setVelocityY(speedDiag);
                    this.player.anims.play('left-fly', true);
                }

                this.turnedLeft ? this.player.anims.play('left-fly', true) : this.player.anims.play('right-fly', true)
            } else if(((this.cursors.left.isDown || this.cursors.up.isDown) || (this.cursors.left.isDown && this.cursors.up.isDown)) && this.player.body.touching.none)
            {
                this.player.setVelocityX(-180);
                this.turnedLeft = true;
                this.turnedRight = false;
                this.player.anims.play('left-fly', true);

            } else if(((this.cursors.right.isDown || this.cursors.up.isDown) || (this.cursors.right.isDown && this.cursors.up.isDown)) && this.player.body.touching.none) {
                this.turnedLeft = false;
                this.turnedRight = true;
                this.player.setVelocityX(180);
                this.player.anims.play('right-fly', true);
            }
        } else
        {
            this.player.body.setVelocityX(0)
            this.player.body.setVelocityY(0)
        }

        this.physics.world.wrap(this.player, 32);
        this.physics.world.wrap(this.lasers, 32);
        this.physics.world.wrap(this.enemies, 32);
        this.physics.world.wrap(this.enemiesLevelTwo, 32);
    }

    createAnimations()
    {
        //Enemy
        this.anims.create({
            key: 'creep',
            frames: this.anims.generateFrameNumbers('invader', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        })

        this.anims.create({
            key: 'creep2',
            frames: this.anims.generateFrameNumbers('invader2', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        })

        this.anims.create({
            key: 'explode',
            frames: [ { key: 'boom', frame: 0}],
            frameRate: 75,
            repeat: 0
        })

        this.anims.create({
            key: 'explode2',
            frames: [ { key: 'boom2', frame: 0}],
            frameRate: 75,
            repeat: 0
        })

        //Player
        this.anims.create({
            key: 'left-down',
            frames: this.anims.generateFrameNumbers('shooter-3', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'left-fly',
            frames: [ { key: 'shooter-3', frame: 17 } ],
            frameRate: 20,
        })

        this.anims.create({
            key: 'left-stop',
            frames: [ { key: 'shooter-3', frame: 0 } ],
            frameRate: 20,
        })

        this.anims.create({
            key: 'right-stop',
            frames: [ { key: 'shooter-3', frame: 8 } ],
            frameRate: 20,
        })

        this.anims.create({
            key: 'right-down',
            frames: this.anims.generateFrameNumbers('shooter-3', { start: 8, end: 15 }),
            frameRate: 10,
            repeat: -1
        })

        this.anims.create({
            key: 'right-fly',
            frames: [ { key: 'shooter-3', frame: 16 } ],
            frameRate: 20,
        })
    }

    createPlayer()
    {
        const player = new Player(this, 100, 450, 'shooter-3')
        return this.physics.add.sprite(player.x , player.y, player.texture.key)
    }

    getMultiplier()
    {
        if(this.level === 1 || this.level % 2 === 0)
        {
            return this.multiplier
        }

        if(this.level > 1 && this.level % 2 !== 0)
        {
            return this.multiplier + Statics.random(0.35, 0.95)
        }
    }

    updateScoreText()
    {
        this.scoreText.setText('score: ' + Math.round(this.score))
    }

    updateLivesText()
    {
        this.livesText.setText('lives: ' + this.lives)
    }

    createPlatforms()
    {
        const platforms = this.physics.add.staticGroup()

        platforms.create(400, 590, 'ground').refreshBody()
        platforms.create(650, 170, 'ground-m')
        platforms.create(360, 330, 'ground-s')
        platforms.create(120, 150, 'ground-m')

        return platforms
    }

    addEnemy(group, texture)
    {
        if(group.countActive(true) <= 3)
        {
            const enemy = this.add.sprite(800 / 2 - 50, 600 / 2, texture);
            this.resetEnemy(enemy);
            group.add(enemy);
        }
    }

    hitEnemy(sprite, enemy)
    {
        this.score += 2 * this.getMultiplier()

        sprite.destroy()

        if(enemy.texture.key === 'invader')
        {
            enemy.play('explode')
        }

        if(enemy.texture.key === 'invader2')
        {
            enemy.play('explode2')
        }

        enemy.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () =>
        {
            this.resetEnemy(enemy)
        }, this)
    }

    flyRocket()
    {
        if(this.player.active)
        {
            this.player.disableInteractive().setVisible(false)
        }

        if(this.enemies)
        {
            this.destroyGroup(this.enemies)
        }

        if(this.enemiesLevelTwo)
        {
            this.destroyGroup(this.enemiesLevelTwo)
        }

        if(this.gems)
        {
            this.destroyGroup(this.gems)
        }

        if(this.rocket.y < 5)
        {
            this.rocketDestination.y = 518
        }

        this.engineLeft.setVisible(false)
        this.engineRight.setVisible(false)
        this.physics.moveToObject(this.rocket, this.rocketDestination, 125)
    }

    destroyGroup(group)
    {
        group.children.iterate((child) =>
        {
            if(child)
            {
                child.destroy()
            }
        })
    }

    moveEnemy(enemy, speed)
    {
        if(!enemy)
        {
            return
        }

        enemy.body.pushable = false;

        if(enemy.texture.key === 'invader')
        {
            enemy.x += speed

            Statics.randomizedDecision() ? enemy.y += Statics.random(0.18, 0.55) : enemy.y -= Statics.random(0.50, 0.95)

            if (enemy.x > 800)
            {
                this.resetEnemy(enemy)
            }
        }

        if(enemy.texture.key === 'invader2')
        {
            enemy.x -= speed

            Statics.randomizedDecision() ? enemy.y += Statics.random(0.18, 0.55) : enemy.y -= Statics.random(0.50, 0.95)

            if (enemy.x === 0)
            {
                this.resetEnemy(enemy)
            }
        }
    }

    resetEnemy(enemy)
    {
        if(enemy.texture.key === 'invader2' || enemy.texture.key === 'boom2')
        {
            enemy.play('creep2')
        }

        if(enemy.texture.key === 'invader' || enemy.texture.key === 'boom')
        {
            enemy.play('creep')
        }

        enemy.setInteractive()
        enemy.setTint(Phaser.Display.Color.GetColor(Statics.random(0, 255), Statics.random(0, 255), Statics.random(0, 255)))
        enemy.y = Statics.random(100, 600)
        enemy.x = -10
    }

    assembleRocket(rocket, player)
    {
        rocket.body.setVelocityY(-110);
        rocket.body.setImmovable(true);
        rocket.body.allowGravity = false;
        rocket.x = player.x;
        rocket.y = player.y;
    }
}
