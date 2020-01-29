export class Utils {

    public static Lerp(start, end, amt) {
        return (1 - amt) * start + amt * end
    }

    public static Interpolate(input: number, inputMin: number, inputMax: number, outputMin: number = 0, outputMax: number = 1): number {
        var value = outputMin + (((input - inputMin) * (outputMax - outputMin)) / (inputMax - inputMin));
        return value;
    }

    public static GetParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }

}