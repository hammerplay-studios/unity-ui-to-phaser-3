import App from '../main';
import * as AppInfo from '../../package.json';
import { Tweens, GameObjects } from 'phaser';

export default class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    init(data: any) {
    }

    preload() {

        let loadingScreen = document.getElementById('loading-screen');
        let loaderText = document.getElementById('loader-text');
        let loaderBar = document.getElementById('loader-bar');

        let item = document.getElementById('item');

        loadingScreen.classList.remove('hide');

        this.load.on('progress', function (value) {
            let percent = Math.floor((value * 100)) + "%"
            loaderBar.style.width = percent;
            loaderText.innerText = percent
        });

        this.load.on('fileprogress', function (file) {
            item.innerText = file.src;

        });

        this.load.on('complete', function () {
            loadingScreen.classList.add('hide');
        });

        

        //this.load.audio('crowd_aww', "audio/crowd_aww.mp3");

        this.load.atlas('flares', 'flares.png', 'flares.json');
        this.scene.launch('InGameHUD');
    }


    private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private phaserVersion: PhaserVersionText;

    create() {

        var particles = this.add.particles('flares');

        //  Create an emitter by passing in a config object directly to the Particle Manager
        this.emitter = particles.createEmitter({
            frame: ['red', 'blue', 'green', 'yellow'],
            x: App.MAX_WIDTH_HALF,
            y: App.MAX_HEIGHT_HALF,
            speed: 200,
            lifespan: 3000,
            blendMode: 'ADD'
        });

        var reference = this.add.image (App.MAX_WIDTH_HALF, App.MAX_HEIGHT_HALF, 'bob')
        reference.visible = false;

        this.cameras.main.setBackgroundColor('1a1b1c');
        this.cameras.main.startFollow(reference);

        this.scale.on('resize', (gameSize: any) => {
            this.resize(gameSize);
        })

        this.phaserVersion = new PhaserVersionText(this, 0, 0, `${AppInfo.name} ${AppInfo.version}`);

        this.resize(this.scale.gameSize);

        this.game.events.on('onPauseButton', () => { this.scene.pause() });
        this.game.events.on('onResumeButton', () => { this.scene.resume() });
        this.game.events.on(Events.OnRestart, this.onRestart.bind(this));
    
        this.events.on('wake', this.onAwake.bind(this));

       // this.start ();

    }

    private onAwake(sceneData: any, data: any) {
        this.scene.wake('InGameHUD');
        this.start();
    }

    private onRestart() {
        this.start();
    }

    private onCompletedContinue() {
        this.scene.sleep('Game');
        this.scene.sleep('InGameHUD');

        this.scene.wake('Objective');
    }

    private resize(gameSize?: any) {
        this.cameras.main.width = gameSize.width;
        this.cameras.main.height = gameSize.height;

        this.phaserVersion.x = this.cameras.main.width - 10;
        this.phaserVersion.y = this.cameras.main.height - 10;
    }

    update(deltaTime) {
        
    }

    public start() {
        this.reset();
        this.emitter.start ();
    }


    private reset() {
        this.emitter.killAll ();
        this.emitter.stop ();
        
    }
}



export enum Events {
    OnGameOver = 'onGameOver',
    OnRestart = 'onRestart'
}

export class PhaserVersionText extends Phaser.GameObjects.Text {
    constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
        super(scene, x, y, text, {
            color: '#FFFFFF',
            fontSize: '32px'
        })
        scene.add.existing(this);
        //this.setOrigin(0, 0).setScrollFactor(0);
        this.setOrigin(1, 1).setScrollFactor(0);
    }
}

