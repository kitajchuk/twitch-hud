export default ( data ) => {
    const html = [];

    while ( html.length < data.hearts.value ) {
        html.push( `<div class="hud__hearts__container js-hud-hearts-container"><span></span></div>` );
    }

    return html.join( "" );
};
