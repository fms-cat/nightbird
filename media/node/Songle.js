Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'Songle';
	it.width = 320;
	it.height = 45;

	it.url = '';
	it.error = null;

	it.bpm = 0.0;
	it.beatInt = 0.0;
	it.beatFract = 0.0;
	it.beatStart = 0.0;

	it.segment = 0.0;

	it.loadWidget( 'piapro.jp/t/MuJl/20081215172419' );

	var outputBeat = new Nightbird.Connector( it, true, 'number' );
	outputBeat.setName( 'beat' );
	outputBeat.onTransfer = function(){
		return Number( it.beatInt + it.beatFract );
	};
	it.outputs.push( outputBeat );

	var outputSegment = new Nightbird.Connector( it, true, 'number' );
	outputSegment.setName( 'segment' );
	outputSegment.onTransfer = function(){
		return Number( it.segment );
	};
	it.outputs.push( outputSegment );

	it.move();

};

Node.prototype = Object.create( Nightbird.Node.prototype );
Node.prototype.constructor = Node;

Node.prototype.loadWidget = function( _url ){

	var it = this;

	it.url = _url;

	if( it.widget ){ it.removeWidget(); }

	it.widget = null;
	it.widgetElement = SongleWidgetAPI.createSongleWidgetElement( {
    api : 'songle-widget-api-example',
    url : it.url,
		songleWidgetSizeW : 300,
		songleWidgetSizeH : 0,
    songAutoPlay : false,
    songAutoLoop : false,
		onCreate : function( _widget ){
			it.height = it.widgetElement.offsetHeight + 50;
		},
    onError : function( _widget ){
      it.error = 'error : ' + _widget.status;
    },
    onReady : function( _widget ){
      it.widget = _widget;
      it.widget.eventPollingInterval = 48;

			it.widget.on( 'beatEnter', function( _event ){
				it.beatInt = _event.beat.index;
				it.beatStart = ( +new Date() );
			} );

			it.widget.on( 'repeatSegmentEnter', function( _event ){
        it.segment += 1 << _event.segment.index;
      } );

      it.widget.on( 'repeatSegmentLeave', function( _event ){
        it.segment -= 1 << _event.segment.index;
      } );
    }
  } );

	it.div = document.createElement( 'div' );
	it.div.style.position = 'absolute';
	it.div.appendChild( it.widgetElement );
	document.body.appendChild( it.div );
	it.move();

};

Node.prototype.removeWidget = function(){

	var it = this;

	it.widget.off( 'repeatSegmentEnter' );
	it.widget.off( 'repeatSegmentLeave' );
	document.body.removeChild( it.div );
	it.widget.remove();

};

Node.prototype.operateDown = function( _x, _y ){

	var it = this;

	if( Math.abs( 160-_x ) < 140 && Math.abs( 20-_y ) < 6 ){
		if( it.lastClick && it.nightbird.time-it.lastClick < .3 ){
			it.nightbird.textbox = new Nightbird.Textbox( it.nightbird, it.url, function( _value ){
				document.body.removeChild( it.div );
				it.loadWidget( String( _value ) );
			} );
		}else{
			it.lastClick = it.nightbird.time;
			it.operate = true;
		}
		return true;
	}else{
		return false;
	}

};

Node.prototype.operateUp = function(){

	var it = this;

	it.operate = false;

};

Node.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.url = it.url;
	return obj;

};

Node.prototype.move = function( _x, _y ){

	var it = this;

	Nightbird.Node.prototype.move.call( it, _x, _y );
	it.div.style.left = it.posX + 10 + 'px';
	it.div.style.top = it.posY + 40 + 'px';

};

Node.prototype.remove = function(){

	var it = this;

	it.removeWidget();
	Nightbird.Node.prototype.remove.call( it );

};

Node.prototype.beatMan = function(){

  var it = this;

	it.bpm = it.widget.bpm ? it.widget.bpm : 0.0;
	it.beatFract = ( ( +new Date() ) - it.beatStart ) * 0.001 / 60.0 * it.bpm;

};

Node.prototype.draw = function(){

	var it = this;

	if( it.active && it.widget ){
		it.beatMan();
	}

	it.nightbird.modularContext.fillStyle = '#333';
	it.nightbird.modularContext.fillRect( it.posX, it.posY, it.width, it.height );
	it.nightbird.modularContext.fillStyle = it.operate ? '#777' : '#555';
	it.nightbird.modularContext.fillRect( it.posX+20, it.posY+14, 280, 12 );
	it.nightbird.modularContext.fillStyle = '#ddd';
	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	it.nightbird.modularContext.fillText( it.url, it.posX+160, it.posY+20 );

	it.nightbird.modularContext.textAlign = 'center';
	it.nightbird.modularContext.textBaseline = 'middle';
	if( it.error ){
		it.nightbird.modularContext.fillStyle = '#f06';
		it.nightbird.modularContext.fillText( it.error, it.posX+160, it.posY+35 );
	}else{
		it.nightbird.modularContext.fillStyle = '#0f6';
		it.nightbird.modularContext.fillText( 'OK', it.posX+160, it.posY+35 );

	}

	Nightbird.Node.prototype.draw.call( it );

};
