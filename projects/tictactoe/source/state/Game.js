
lychee.define('game.state.Game').requires([
	'lychee.effect.Shake',
	'lychee.app.sprite.Background',
	'game.ui.layer.Board',
	'game.ui.entity.Label'
]).includes([
	'lychee.app.State'
]).exports(function(lychee, global, attachments) {

	const _Shake = lychee.import('lychee.effect.Shake');
	const _State = lychee.import('lychee.app.State');
	const _BLOB  = attachments["json"].buffer;
	const _MUSIC = attachments["msc"];
	const _SOUND = attachments["snd"];



	/*
	 * HELPERS
	 */

	const _on_touch = function(entity) {

		if (this.__locked === true) return false;


		let player = this.__player;
		let result = entity.setState('active-' + player);
		if (result === true) {

			if (_is_game_won.call(this, player) === true) {

				this.__locked = true;
				this.__scores[player]++;

				_reset_game.call(this);

			} else if (_is_game_draw.call(this) === true) {

				this.__locked = true;

				_reset_game.call(this);

			} else {

				this.__player = player === 'x' ? 'o' : 'x';

			}

		}

	};

	const _is_game_draw = function() {

		let empty = this.query('ui > board').entities.filter(function(tile) {
			return tile.state === 'default';
		});

		if (empty.length === 0) {
			return true;
		}


		return false;

	};

	const _is_game_won = function(player) {

		let tiles = this.query('ui > board').entities;
		let state = 'active-' + player;


		for (let y = 1; y <= 3; y++) {

			let horizontal = tiles.filter(function(tile) {
				return tile.y === y && tile.state === state;
			});

			if (horizontal.length === 3) {
				return true;
			}

		}


		for (let x = 1; x <= 3; x++) {

			let vertical = tiles.filter(function(tile) {
				return tile.x === x && tiles.state === state;
			});

			if (vertical.length === 3) {
				return true;
			}

		}


		let diagonal_tlbr = tiles.filter(function(tile) {
			return tile.x === tile.y && tile.state === state;
		});

		let diagonal_trbl = tiles.filter(function(tile) {
			return tile.x === (4 - tile.y) && tile.state === state;
		});

		if (diagonal_trbl.length === 3 || diagonal_tlbr.length === 3) {
			return true;
		}


		return false;

	};

	const _reset_game = function() {

		this.__player = 'x';


		let board = this.query('ui > board');
		if (board !== null) {

			board.entities.forEach(function(entity) {

				entity.addEffect(new _Shake({
					type:     _Shake.TYPE.bounceeaseout,
					delay:    (100 + Math.random() * 100) | 0,
					duration: 500,
					shake:    {
						x: (Math.random() * 8) | 0,
						y: (Math.random() * 4) | 0
					}
				}));

			});


			this.jukebox.play(_SOUND);

			this.loop.setTimeout(700, function() {

				board.entities.forEach(function(entity) {
					entity.setState('default');
				});

				this.__locked = false;

			}, this);

		} else {

			this.__locked = false;

		}


		let score = this.query('ui > score');
		if (score !== null) {
			score.setValue(this.__scores.x + ' : ' + this.__scores.o);
		}

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(main) {

		_State.call(this, main);


		this.__player = 'x';
		this.__scores = { x: 0, o: 0 };


		this.deserialize(_BLOB);



		/*
		 * INITIALIZATION
		 */

		let viewport = this.viewport;
		if (viewport !== null) {

			viewport.bind('reshape', function(orientation, rotation) {

				let renderer = this.renderer;
				if (renderer !== null) {

					let entity = null;
					let width  = renderer.width;
					let height = renderer.height;


					entity = this.query('bg > background');
					entity.width     = width;
					entity.height    = height;
					entity.__isDirty = true;

				}

			}, this);

		}

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		serialize: function() {

			let data = _State.prototype.serialize.call(this);
			data['constructor'] = 'game.state.Game';


			return data;

		},

		deserialize: function(blob) {

			_State.prototype.deserialize.call(this, blob);


			let board = this.query('ui > board');
			if (board !== null) {
				board.entities.forEach(function(entity) {
					entity.bind('#touch', _on_touch, this);
				}.bind(this));
			}

		},



		/*
		 * CUSTOM API
		 */

		enter: function(oncomplete) {

			_State.prototype.enter.call(this, oncomplete);


			this.__player   = 'x';
			this.__scores.x = 0;
			this.__scores.o = 0;


			this.jukebox.play(_MUSIC);


			let board = this.query('ui > board');
			if (board !== null) {
				board.entities.forEach(function(entity) {
					entity.setState('default');
				});
			}

			let score = this.query('ui > score');
			if (score !== null) {
				score.setValue('0 : 0');
			}

		},

		leave: function(oncomplete) {

			this.jukebox.stop(_MUSIC);


			_State.prototype.leave.call(this, oncomplete);

		}

	};


	return Composite;

});
