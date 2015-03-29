Nightbird.VideoNode = function( _nightbird, _file ){

	var it = this;

	Nightbird.Node.call( it, _nightbird );
	it.name = _file.name;
	it.width = 100;
	it.height = 10+100*it.nightbird.height/it.nightbird.width;

	it.canvas = document.createElement( 'canvas' );
	it.canvas.width = it.nightbird.width;
	it.canvas.height = it.nightbird.height;

	it.context = it.canvas.getContext( '2d' );

	it.video = document.createElement( 'video' );
	it.video.autoplay = 'true';
	it.video.loop = 'true';
	it.video.muted = 'true';

	it.loadVideo( _file );

	var outputCanvas = new Nightbird.Connector( it, true, 'canvas' );
	outputCanvas.setName( 'output' );
	outputCanvas.onTransfer = function(){
		return it.canvas;
	};
	it.outputs.push( outputCanvas );
	it.move();

};

Nightbird.VideoNode.prototype = Object.create( Nightbird.Node.prototype );
Nightbird.VideoNode.prototype.constructor = Nightbird.VideoNode;

Nightbird.VideoNode.prototype.loadVideo = function( _file ){

	var it = this;

	var reader = new FileReader();
	reader.onload = function(){
		it.video.src = reader.result;
	};

	reader.readAsDataURL( _file );

};

Nightbird.VideoNode.prototype.save = function( _hashed ){

	var it = this;

	var obj = Nightbird.Node.prototype.save.call( it, _hashed );
	obj.kind = 'VideoNode';
	return obj;

};

Nightbird.VideoNode.prototype.draw = function(){

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
