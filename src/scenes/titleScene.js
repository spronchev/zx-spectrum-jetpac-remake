export default class TitleScene extends Phaser.Scene
{
    constructor()
    {
        super('title-scene')
        this.logo = undefined
        this.button = undefined
        this.text = undefined
    }

    preload()
    {
        this.load.image('logo', 'assets/jetpac.jpg')
        this.load.image('button', 'assets/button.png')
    }

    create()
    {
        this.logo = this.add.image(400, 310, 'logo')
        this.button = this.add.sprite(310, 450, 'button').setInteractive()
        this.text = this.add.text(250, 420, 'Play',  {fontSize: '60px', fontFamily: '"Electrolize"'})
        this.button.on('pointerdown', () => this.scene.start('game-scene'))
    }

}
