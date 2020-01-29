import { Canvas, UIImage } from "./canvas";
import { Events } from "./game";


export default class InGameHUD extends Canvas {
    constructor() {
        super({
            key: 'InGameHUD'
        });
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

        this.load.multiatlas ('game-ui', 'ui/ui-assets.json', 'ui');
        this.load.json('ingameCanvas', 'ui/in-game-hud.json');
    }

    create() {
        super.setCanvas('ingameCanvas');

        this.initLeftPanel();
        this.initPausePanel();


        this.pausePanel.hidePanel();

        // Events
        //this.game.events.on(Events.OnGameOver, this.onGameOver.bind(this));
        this.events.on('wake', this.onAwake.bind(this));
    }

    private onAwake() {
        this.pausePanel.hidePanel();
    }

    private topLeftPanel: any;

    private initLeftPanel() {
        this.topLeftPanel = this.children.getByName('TopLeftPanel') as UIImage;
        this.topLeftPanel.pauseButton = this.topLeftPanel.getChildImageByName('PauseButton');
        this.pauseButton = this.topLeftPanel.pauseButton;

        this.topLeftPanel.pauseButton.on('pointerdown', () => {
            this.game.events.emit('onPauseButton');
            this.pausePanel.showPanel();
        });

        this.topLeftPanel.hidePanel = () => {
            this.topLeftPanel.pauseButton.visible = false;
            this.topLeftPanel.visible = false;
        };

        this.topLeftPanel.showPanel = () => {
            this.topLeftPanel.pauseButton.visible = true;
            this.topLeftPanel.visible = true;
        };
    }


    private pausePanel: any;
    private pauseButton: UIImage;

    private initPausePanel() {
        this.pausePanel = this.children.getByName('PausePanel');
        this.pausePanel.resumeButton = this.pausePanel.getChildImageByName('ResumeButton');
        this.pausePanel.replayButton = this.pausePanel.getChildImageByName('ReplayButton');
        this.pausePanel.soundButton = this.pausePanel.getChildImageByName('SoundButton') as UIImage;
        
        this.pausePanel.hidePanel = (() => {
            this.pausePanel.resumeButton.visible = false;
            this.pausePanel.replayButton.visible = false;
            this.pausePanel.soundButton.visible = false;
        });

        this.pausePanel.showPanel = (() => {
            this.pausePanel.resumeButton.visible = true;
            this.pausePanel.replayButton.visible = true;
            this.pausePanel.soundButton.visible = true;
        });

        this.pausePanel.resumeButton.on('pointerdown', () => {
            this.game.events.emit('onResumeButton');
            this.pausePanel.hidePanel();
            this.topLeftPanel.showPanel();
        });

        this.pausePanel.replayButton.on('pointerdown', () => {
            this.game.events.emit('onResumeButton');
            this.game.events.emit(Events.OnRestart);
            this.onAwake();
        });

        this.pausePanel.soundButton.on('pointerdown', () => {
            this.game.sound.mute = !this.game.sound.mute;
            this.pausePanel.soundButton.setTexture('game-ui', this.game.sound.mute ? 'sound-off-button.png' : 'sound-on-button.png');
        });

    }
}