const utils = {
    formatTime ( time ) {
        const minutes = parseInt( time / (1000 * 60), 10 );
        let seconds = parseInt( time / 1000, 10) % 60;

        if ( seconds < 10 ) {
            seconds = `0${seconds}`;
        }

        return `${minutes}:${seconds}`;
    }
};



export default utils;
