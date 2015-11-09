
var App = {
	start: function(stream) {
		App.video.addEventListener('canplay', function() {
			App.video.removeEventListener('canplay');
			setTimeout(function() {
				App.video.play();
				App.canvas.style.display = 'inline';
				App.info.style.display = 'none';
				App.canvas.width = App.video.videoWidth;
				App.canvas.height = App.video.videoHeight;
				App.backCanvas.width = App.video.videoWidth / 4;
				App.backCanvas.height = App.video.videoHeight / 4;
				App.backContext = App.backCanvas.getContext('2d');

				var w = 300 / 4 * 0.8,
					h = 270 / 4 * 0.8;

				App.comp = [{
					x: (App.video.videoWidth / 4 - w) / 2,
					y: (App.video.videoHeight / 4 - h) / 2,
					width: w,
					height: h,
				}];

				App.drawToCanvas();
			}, 500);
		}, true);

		var domURL = window.URL || window.webkitURL;
		App.video.src = domURL ? domURL.createObjectURL(stream) : stream;
	},
	denied: function() {
		App.info.innerHTML = 'Camera access denied!<br>Please reload and try again.';
	},
	error: function(e) {
		if (e) {
			console.error(e);
		}
		App.info.innerHTML = 'Please go to about:flags in Google Chrome and enable the &quot;MediaStream&quot; flag.';
	},
	drawToCanvas: function() {
		requestAnimationFrame(App.drawToCanvas);

		var video = App.video,
			ctx = App.context,
			backCtx = App.backContext,
			m = 4,
			w = 4,
			i,
			comp;

		ctx.drawImage(video, 0, 0, App.canvas.width, App.canvas.height);

		backCtx.drawImage(video, 0, 0, App.backCanvas.width, App.backCanvas.height);

		comp = ccv.detect_objects(App.ccv = App.ccv || {
			canvas: App.backCanvas,
			cascade: cascade,
			interval: 4,
			min_neighbors: 1
		});

		if (comp.length) {
			App.comp = comp;
		}

		for (i = App.comp.length; i--; ) {
			ctx.drawImage(App.glasses, (App.comp[i].x - w / 2) * m, (App.comp[i].y - w / 2) * m, (App.comp[i].width + w) * m, (App.comp[i].height + w) * m);
			// HAT: ctx.drawImage(App.glasses, (App.comp[i].x + w ) * m, (App.comp[i].y - App.comp[i].height  ) * m, (App.comp[i].width + w) * m, (App.comp[i].height + w) * m);

		}
	},
	takePicture: function() {
		// save canvas image as data url (png format by default)
        // var dataURL = App.canvas.toDataURL();
        // document.getElementById('photo').src = dataURL;
		App.gif = new GIF({
		  workers: 2,
		  quality: 10
		});

		// add an image element
		// gif.addFrame(imageElement);
		App.current_frame = 0;

		App.gif.on('finished', function(blob) {
		   var photo = new Image();
		   photo.src = URL.createObjectURL(blob);
		   document.getElementById('photos').appendChild(photo);
		});

		// or a canvas element
		setTimeout(App.recordGif,50)
		// // or copy the pixels from a canvas context
		// gif.addFrame(ctx, {copy: true});
		return false;
	},
	recordGif: function() {
		// alert('sas');
		App.current_frame++;
		App.gif.addFrame(App.canvas, {delay: 50});

		if (App.current_frame == 20) {
			App.gif.render();
		} else {
			setTimeout(App.recordGif,50)
		}

	}
};

App.glasses = new Image();
App.glasses.src = '../images/props/pink-glasses.png';


App.init = function() {
	App.video = document.createElement('video');
	App.backCanvas = document.createElement('canvas');
	App.canvas = document.querySelector('#output');
	App.canvas.style.display = 'none';
	App.context = App.canvas.getContext('2d');
	App.info = document.querySelector('#info');

	navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

	try {
		navigator.getUserMedia_({
			video: true,
			audio: false
		}, App.start, App.denied);
	} catch (e) {
		try {
			navigator.getUserMedia_('video', App.start, App.denied);
		} catch (e) {
			App.error(e);
		}
	}

	App.video.loop = App.video.muted = true;
	App.video.load();
};

App.init();