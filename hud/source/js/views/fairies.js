export default ( data ) => {
    const html = [];

    while ( html.length < data.fairies.max ) {
        html.push(`
            <div class="hud__fairies__container js-hud-fairies-container">
                <span></span>
            </div>
        `);
    }

    return html.join( "" );
};
