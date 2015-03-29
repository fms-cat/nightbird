Node = function( _nightbird ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = 'Camera';
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
  window.URL = window.URL || window.webkitURL;

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.context = it.canvas.getContext( '2d' );

	it.video = document.createElement( 'video' );
	it.video.autoplay = 'true';

	it.error = '';
  it.localMediaStream = null;

  if( navigator.getUserMedia ){
    navigator.getUserMedia( { // navigator.getUserMedia 第一引数、プロパティ
      video : true, audio : false
    }, function( _stream ){ // navigator.getUserMedia 第二引数、成功時ストリーム
      it.localMediaStream = _stream;
      it.video.src = window.URL.createObjectURL( it.localMediaStream );
    }, function( _error ){ // navigator.getUserMedia 第三引数、失敗時エラー
      it.error = 'getUserMedia error: '+String( _error.code );
    } );
  }else{
    it.error = 'This browser does not support webcam';
  }

	var outputCanvas = new Nightbird.Connector( it, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return it.canvas;
	};
	it.outputs.push( outputCanvas );
	it.move();

};

Node.prototype = Object.create( Nightbird.Node.prototype );
Node.prototype.constructor = Node;

Node.prototype.draw = function(){

	var it = this;

	if( it.active ){

		var x = 0;
		var y = 0;
		var w = it.video.videoWidth;
		var h = it.video.videoHeight;
		if( w/it.canvas.width < h/it.canvas.height ){
			y = (h-(w*it.canvas.height/it.canvas.width))/2;
			h = w*it.canvas.height/it.canvas.width;
		}else{
			x = (w-(h*it.canvas.width/it.canvas.height))/2;
			w = h*it.canvas.width/it.canvas.height;
		}
		it.context.drawImage( it.video, x, y, w, h, 0, 0, it.canvas.width, it.canvas.height );

	}

	it.nightbird.modularContext.drawImage( it.canvas, it.posX, 10+it.posY, it.width, it.height-10 );

	Nightbird.Node.prototype.draw.call( it );

};
