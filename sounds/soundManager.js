export class SoundManager{
    constructor() {
        this.sounds = {
            fire: new Audio('/sounds/soundStore/fire.mp3'),
            sunk: new Audio('/sounds/soundStore/sunk.mp3')
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