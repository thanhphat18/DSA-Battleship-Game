export class SoundManager{
    constructor() {
        this.sounds = {
            fire: new Audio('/sounds/fire.mp3'),
            sunk: new Audio('/sounds/sunk.mp3')
        };
    }

    play(key){
        const sound = this.sounds[key];
        if (sound) {
            sound.currentTime = 0;
            sound.play();
        }
    }
}