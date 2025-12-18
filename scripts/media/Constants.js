export const SVG_PATHS = {
    PLAY: "M320-200v-560l440 280-440 280Zm80-280Zm0 134 210-134-210-134v268Z",
    PAUSE: "M528-192v-576h240v576H528Zm-336 0v-576h240v576H192Zm408-72h96v-432h-96v432Zm-336 0h96v-432h-96v432Zm0-432v432-432Zm336 0v432-432Z",
    LIKE: "M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-360-80h360l120-280v-80H480l54-220-174 174v406Zm0-406v406-406Zm-80-34v80H160v360h120v80H80v-520h200Z",
    LIKE_FILLED: "M720-120H280v-520l280-280 50 50q7 7 11.5 19t4.5 23v14l-44 174h258q32 0 56 24t24 56v80q0 7-2 15t-4 15L794-168q-9 20-30 34t-44 14Zm-440-520v80H160v360h120v80H80v-520h200Z"
};

export const EQ_CONFIG = [
    { label: '50Hz', freq: 40, type: 'lowshelf' },
    { label: '230Hz', freq: 230, type: 'peaking' },
    { label: '910Hz', freq: 910, type: 'peaking' },
    { label: '4kHz', freq: 4000, type: 'peaking' },
    { label: '12kHz', freq: 12000, type: 'highshelf' }
];
