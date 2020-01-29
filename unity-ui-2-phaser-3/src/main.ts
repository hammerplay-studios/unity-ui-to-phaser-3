import 'phaser';
import { Utils } from './app/utils';
import Game from './app/game';
import InGameHUD from './app/ingame-hud-scene';

type scaleMode = 'FIT' | 'SMOOTH'

export default class App {
    public static MAX_WIDTH: number = 1920;
    public static MAX_HEIGHT: number = 1080;

    public static DEFAULT_WIDTH: number = 500;
    public static DEFAULT_HEIGHT: number = 800;

    public static MAX_WIDTH_HALF: number = App.MAX_WIDTH / 2;
    public static MAX_HEIGHT_HALF: number = App.MAX_HEIGHT / 2;

    public static APP_WIDTH: number = 1920;
    public static APP_HEIGHT: number = 1080;

    public static SCALE_MODE: scaleMode = 'SMOOTH';

    public app: App;

    public static _instance: App;
    public static _game: Phaser.Game;

    constructor() {
        this.processParams();
        App._instance = this;
        //App._game = new Phaser.Game(config);
    }

    public static GetParam(key: string) {
        if (key in App._instance.params) {
            return App._instance.params[key];
        }

        return null;
    }

    private params = {};

    private processParams() {
        this.params = {};
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (let i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            this.params[pair[0]] = decodeURIComponent(pair[1]);
        }
    }

    public static ViewportToAppView(viewportPoint: Point): Point {
        return new Point(

            Utils.Interpolate(viewportPoint.x, 0, 1, 0, App.APP_WIDTH),
            Utils.Interpolate(viewportPoint.y, 0, 1, 0, App.APP_HEIGHT),
        );
    }

}

const config = {
    type: Phaser.AUTO,
    transparent: true,

    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.NONE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: App.DEFAULT_WIDTH,
        height: App.DEFAULT_HEIGHT

    },
    scene: [Game, InGameHUD]
};

const app = new App();

window.addEventListener('load', () => {
    //return;
    const game = new Phaser.Game(config)

    const resize = () => {
        //return;
        const w = window.innerWidth
        const h = window.innerHeight

        let width = App.DEFAULT_WIDTH
        let height = App.DEFAULT_HEIGHT
        let maxWidth = App.MAX_WIDTH
        let maxHeight = App.MAX_HEIGHT
        let scaleMode = App.SCALE_MODE;

        let scale = Math.min(w / width, h / height)
        let newWidth = Math.min(w / scale, maxWidth)
        let newHeight = Math.min(h / scale, maxHeight)

        let defaultRatio = App.DEFAULT_WIDTH / App.DEFAULT_HEIGHT
        let maxRatioWidth = App.MAX_WIDTH / App.DEFAULT_HEIGHT
        let maxRatioHeight = App.DEFAULT_WIDTH / App.MAX_HEIGHT

        // smooth scaling
        let smooth = 1
        if (scaleMode === 'SMOOTH') {
            const maxSmoothScale = 1.15
            const normalize = (value: number, min: number, max: number) => {
                return (value - min) / (max - min)
            }
            if (width / height < w / h) {
                smooth =
                    -normalize(newWidth / newHeight, defaultRatio, maxRatioWidth) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
            } else {
                smooth =
                    -normalize(newWidth / newHeight, defaultRatio, maxRatioHeight) / (1 / (maxSmoothScale - 1)) + maxSmoothScale
            }
        }

        // resize the game
        game.scale.resize(newWidth * smooth, newHeight * smooth);

        // scale the width and height of the css
        game.canvas.style.width = newWidth * scale + 'px'
        game.canvas.style.height = newHeight * scale + 'px'

        // center the game with css margin
        game.canvas.style.marginTop = `${(h - newHeight * scale) / 2}px`
        game.canvas.style.marginLeft = `${(w - newWidth * scale) / 2}px`
    }

    window.addEventListener('resize', event => {
        resize()
    })

    resize();
})

export class Point {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }
}

