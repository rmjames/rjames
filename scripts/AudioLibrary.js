class AudioLibrary {
    constructor() {
        this._tracks = [
            {
                id: 'coffee-shop',
                title: 'Coffee Shop',
                artist: 'Ambience',
                src: '/media/audio/coffee_shop.ogg',
                genre: 'Ambience',
                album: 'Google Sounds',
                duration: null,
                albumArt: '/media/images/cover1.jpg'
            },
            {
                id: 'fire',
                title: 'Fire',
                artist: 'Ambience',
                src: '/media/audio/fire.ogg',
                genre: 'Ambience',
                album: 'Google Sounds',
                duration: null,
                albumArt: '/media/images/cover2.jpg'
            }
        ];
    }

    get tracks() {
        return this._tracks;
    }

    getAll() {
        return this._tracks;
    }

    getById(id) {
        return this._tracks.find(track => track.id === id);
    }

    addTrack(track) {
        // Basic validation could go here
        this._tracks.push(track);
    }
}

// Export a singleton instance
export const audioLibrary = new AudioLibrary();
