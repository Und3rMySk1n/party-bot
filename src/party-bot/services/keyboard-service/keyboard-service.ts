import { Markup } from 'telegraf';
import { Keyboard } from './keyboard';

export class KeyboardService {
    public static getGameStartedKeyboard() {
        return Markup.keyboard(Keyboard.gameStarted).resize();
    }

    public static getGameNotStartedKeyboard() {
        return Markup.keyboard(Keyboard.gameNotStarted).resize();
    }

    public static getSettingsKeyboard() {
        return Markup.keyboard(Keyboard.settingsKeyboard).resize();
    }

    public static removeKeyboard() {
        return Markup.removeKeyboard();
    }
}