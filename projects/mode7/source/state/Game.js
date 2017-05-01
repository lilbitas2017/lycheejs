
lychee.define('game.state.Game').requires([
	'lychee.app.sprite.Emblem',
	'game.app.entity.Background',
	'game.level.Track'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _Background = lychee.import('game.app.entity.Background');
	const _Emblem     = lychee.import('lychee.app.sprite.Emblem');
	const _State      = lychee.import('lychee.app.State');
	const _Track      = lychee.import('game.level.Track');



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.camera = main.camera || null;

		this.__autopilot  = false;
		this.__direction  = 1;
		this.__offset     = 0;
		this.__origin     = { bgx: 0, bgy: 0, fgx: 0, fgy: 0 };

		this.__background = null;
		this.__logo       = null;
		this.__track      = null;


		this.deserialize();

	};


	Composite.prototype = {

		/*
		 * STATE API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function() {

			let renderer = this.renderer;
			if (renderer !== null) {

				this.__background = new _Background({
					width:  renderer.width,
					height: renderer.height,
					origin: this.__origin
				});

				this.__logo = new _Emblem({
					position: {
						x: renderer.width - 128,
						y: renderer.height - 32
					}
				});

			}


			let viewport = this.viewport;
			if (viewport !== null) {

				viewport.unbind('reshape', null, this);
				viewport.bind('reshape', function(orientation, rotation, width, height) {

					let entity   = null;
					let renderer = this.renderer;
					if (renderer !== null) {

						this.__origin.bgx = 1 / 2 * renderer.width;
						this.__origin.bgy = 1 / 2 * renderer.height + 64;
						this.__origin.fgx = 1 / 2 * renderer.width;
						this.__origin.fgy = 1 / 2 * renderer.height + 128;


						entity        = this.__background;
						entity.width  = renderer.width;
						entity.height = this.__origin.fgy;
						entity.origin = this.__origin;

						entity        = this.__logo;
						entity.position.x = renderer.width  - 128;
						entity.position.y = renderer.height -  32;

					}

				}, this);

			}

		},

		enter: function(oncomplete, data) {

			_State.prototype.enter.call(this, oncomplete);


			this.__track = new _Track(data.track);


			if (this.__track.length === 0) {
				this.leave();
				return;
			}


			let wait   = 3; // in seconds
			let renderer = this.renderer;
			if (renderer !== null) {

				let camera = this.camera;
				// let width  = renderer.width;
				let height = renderer.height;


				camera.position.y = camera.offset + wait * 10 * height;


				let start = null;

				let handle = this.loop.setInterval(1000 / 60, function(clock, delta, step) {

					if (start === null) start = clock;


					let t = (clock - start) / (wait * 1000);
					let y = camera.offset + (1 - (Math.pow(t - 1, 3) + 1)) * wait * 10 * height;
					if (y < camera.offset) {

						camera.position.y = camera.offset;
						this.__autopilot  = true;
						this.__offset     = camera.offset;

						this.loop.removeInterval(handle);

					} else {

						camera.position.y = y;

					}

				}, this);

			}

		},

		leave: function(oncomplete) {

			this.__autopilot = false;
			this.__track     = null;


			_State.prototype.leave.call(this, oncomplete);

		},

		update: function(clock, delta) {

			let camera = this.camera;
			let position = camera.position;

			let background = this.__background;
			let origin     = this.__origin;
			let track      = this.__track;

			let autopilot  = this.__autopilot === true;
			if (autopilot) {

				let length = track.length;
				if (position.z + 200 > length * 200) {
					position.z = 0;
				} else {
					position.z += 200;
				}

			}


			let segment = track.getSegment(position.z);
			if (autopilot) {
				position.y = segment.from.y + this.__offset;
			}


			let bgw = background.width;
			let bgh = background.height;

			let orx = (bgw / 2 - (segment.rotation / 180) * 1024) | 0;
			let ory = (bgh + (segment.from.y - bgh * 2) / 160000 * bgh) | 0;

			origin.fgx = orx;
			origin.fgy = ory;

			origin.bgx = orx + (clock / 1000) * 8;
			origin.bgy = bgh + Math.sin((clock / 10000) * Math.PI) * 16;


			background.setOrigin(origin);

		},

		render: function(clock, delta) {

			let renderer = this.renderer;
			if (renderer !== null) {

				renderer.clear();

				let bgx = renderer.width / 2;
				let bgy = this.__background.height / 2;
				renderer.renderEntity(this.__background, bgx, bgy);

				renderer.renderEntity(this.__track,      0, 0);

				this.__logo.render(renderer, 0, 0);

				renderer.flush();

			}

		}

	};


	return Composite;

});
