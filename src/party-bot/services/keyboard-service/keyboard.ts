import { Button } from './button';

export const Keyboard = {
    gameStarted: [
        [Button.Stop, Button.Info, Button.Stats],
    ],
    gameNotStarted: [
        [Button.Start, Button.Settings, Button.Exit],
    ],
    settingsKeyboard: [
        [Button.AddDrink, Button.ClearDrinks],
        [Button.SetTimer, Button.ExitSettings],
    ],
}