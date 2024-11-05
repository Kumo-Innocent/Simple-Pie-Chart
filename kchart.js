const kchart = {
    sleep: ms => new Promise( r => setTimeout( r, ms ) ),
    to_rad: angle => ( angle * Math.PI ) / 180,
    to_deg: angle => ( angle * 180 ) / Math.PI,
    percent_deg: percent => ( percent * 360 ) / 100,
    angle_points: function( x, y ) {
        return ( Math.acos( ( ( Math.cos( x.x ) * Math.cos( y.x ) ) + ( Math.sin( x.y ) * Math.sin( y.y ) ) ) / ( Math.sqrt( Math.pow( Math.cos( x.x ), 2 ) + Math.pow( Math.sin( x.y ), 2 ) ) * Math.sqrt( Math.pow( Math.cos( y.x ), 2 ) + Math.pow( Math.sin( y.y ), 2 ) ) ) ) * 180 ) / Math.PI;
    },
    check_arc_collision: function( start, end, angle, distance, radius ) {
        if( angle < 0 ) angle += 360;
        if( distance > radius ) return false;
        if( start < end ) return start <= angle && angle <= end;
        else if( angle >= start || angle <= end ) return true;
        return false;
    },
    create_pie_chart: function( canvas, start, radius, input, _x=null, _y=null ) {
        let target = document.querySelector( canvas );
        if( ! target ) return false;
        const ctx = target.getContext( '2d' );
        let w = target.offsetWidth, h = target.offsetHeight, last = start;
        let start_x = _x === null ? w / 2 : _x, start_y = _y === null ? h / 2 : _y;
        let percent;
        input.forEach( item => {
            percent = item[ 0 ];
            let color = item[ 1 ];
            let angle = kchart.percent_deg( percent );
            ctx.beginPath();
            ctx.moveTo( start_x, start_y );
            ctx.arc( start_x, start_y, radius, kchart.to_rad( last ), kchart.to_rad( last + angle ) );
            ctx.fillStyle = color;
            ctx.fill();
            last += angle;
        } );
        return this;
    },
    animate_pie_chart: async function( canvas, time, start, radius, input, debug_time=false ) {
        let target = document.querySelector( canvas );
        if( input.length === 0 || ! target ) return false;
        let w = target.offsetWidth, h = target.offsetHeight;
        let start_x = w / 2, start_y = h / 2;
        let sections = [];
        target.addEventListener( 'click', event => {
            event.preventDefault();
            let x = event.offsetX, y = event.offsetY;
            let distance = Math.sqrt( Math.pow( ( x - start_x ), 2 ) + Math.pow( ( y - start_y ), 2 ) );
            let angle = kchart.to_deg( Math.atan2( y - start_y, x - start_x ) );
            sections.forEach( async ( item ) => {
                if( kchart.check_arc_collision( item.start, item.end, angle, distance, radius ) ) console.log( `Color : ${ item.color }` );
            } );
        } );
        let current = 0, percent = 0, previous, delta, start_date = Date.now(), keep = start;
        const animate = async ( now ) => {
            let current_item = input[ current ];
            if( current >= input.length && debug_time ) {
                console.log( `Elapsed time : ${ Date.now() - start_date } ms` );
                return;
            } else if( current >= input.length && ! debug_time ) return;
            else if( percent >= current_item[ 0 ] && debug_time ) {
                console.log( `Elapsed time : ${ Date.now() - start_date } ms` );
            } else if( percent >= current_item[ 0 ] && ! debug_time ) return;
            else if( percent < current_item[ 0 ] ) window.requestAnimationFrame( animate );
            delta = ( now - previous ) / 1000;
            previous = now;
            if( isNaN( delta ) ) return;
            let temp_percent = percent + ( time * delta );
            if( temp_percent >= current_item[ 0 ] ){
                temp_percent = current_item[ 0 ];
                percent = current_item[ 0 ];
                current++;
            }
            kchart.create_pie_chart( canvas, keep, radius, [ [ temp_percent, current_item[ 1 ] ] ] );
            percent = temp_percent;
            if( temp_percent >= current_item[ 0 ] ) {
                sections.push( { start: keep, end: kchart.percent_deg( percent ) + keep, color: current_item[ 1 ] } );
                keep += kchart.percent_deg( percent );
                percent = 0;
            }
        };
        return animate();
    }
};
