
lychee.define('lychee.ui.Blueprint').requires([
	'lychee.effect.Offset',
	'lychee.effect.Position',
	'lychee.ui.Element'
]).includes([
	'lychee.ui.Layer'
]).exports(function(lychee, global, attachments) {

	const _Element  = lychee.import('lychee.ui.Element');
	const _Layer    = lychee.import('lychee.ui.Layer');
	const _Offset   = lychee.import('lychee.effect.Offset');
	const _Position = lychee.import('lychee.effect.Position');



	/*
	 * HELPERS
	 */

	const _validate_entity = function(entity) {

		if (entity instanceof Object) {

			if (
				typeof entity.update === 'function'
				&& typeof entity.render === 'function'
				&& typeof entity.shape === 'number'
				&& typeof entity.setOrder === 'function'
				&& typeof entity.isAtPosition === 'function'
			) {
				return true;
			}

		}


		return false;

	};

	const _on_relayout = function() {

		let fade     = this.__fade;
		let entities = this.entities;
		let visible  = this.visible;

		if (entities.length > 0 && visible === true) {

			let entity = null;
			let other  = null;
			let type   = this.type;
			let x1     = -1 / 2 * this.width;
			let x2     =  1 / 2 * this.width;
			let y1     = -1 / 2 * this.height;
			let off_x  = x1 + 32;
			let off_y  = y1 + 32;
			let pos_x  = 0;
			let pos_y  = 0;


			this.__scroll.max_x = 0;
			this.__scroll.min_y = 0;
			this.__scroll.delta = 0;


			if (type === Composite.TYPE.grid) {

				for (let e = 0, el = entities.length; e < el; e++) {

					entity = entities[e];
					pos_x  = off_x + entity.width  / 2;
					pos_y  = off_y + entity.height / 2;

					if (pos_x + entity.width / 2 > x2 - 32) {

						off_x  = x1 + 32;
						off_y += entity.height + 32;

						pos_x = off_x + entity.width  / 2;
						pos_y = off_y + entity.height / 2;

						off_x += entity.width + 32;

					} else {

						pos_x = off_x + entity.width  / 2;
						pos_y = off_y + entity.height / 2;

						off_x += entity.width + 32;

					}


					entity.trigger('relayout');
					entity.setOrder(e + 1);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100 * e,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}


					this.__scroll.min_y = Math.min(this.__scroll.min_y, -1 * (y1 + pos_y + entity.height / 2 + 32));
					this.__scroll.delta = Math.max(this.__scroll.delta, entity.height + 32);

				}

			} else if (type === Composite.TYPE.view) {

				if (entities.length === 2) {

					entity        = entities[0];
					entity.width  = 320;
					entity.height = this.height;

					pos_x = x1 + 32 + entity.width / 2;
					pos_y = y1 + entity.height / 2;

					entity.trigger('relayout');
					entity.setOrder(1);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}


					entity        = entities[1];
					entity.width  = Math.max(480, this.width - 64 - 320);
					entity.height = this.height;

					pos_x = x1 + 320 + 64 + entity.width / 2;
					pos_y = y1 + entity.height / 2;

					entity.trigger('relayout');
					entity.setOrder(2);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}


					this.__scroll.max_x = Math.min(this.__scroll.max_x, -1 * (x1 + pos_x + entity.width / 2 + 32));

				} else if (entities.length === 1) {

					entity        = entities[0];
					entity.width  = 320;
					entity.height = this.height;

					pos_x = x1 + 32 + entity.width / 2;
					pos_y = y1 + entity.height / 2;

					entity.trigger('relayout');
					entity.setOrder(1);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}

				}

			} else if (type === Composite.TYPE.full) {

				for (let e = 0, el = entities.length; e < el; e++) {

					entity = entities[e];

					entity.position.x = 0;
					entity.position.y = 0;

				}

			} else if (type === Composite.TYPE.auto) {

				if (entities.length === 2) {

					entity = entities[0];

					pos_x = x1 + 32 + entity.width / 2;
					pos_y = 0;

					entity.trigger('relayout');
					entity.setOrder(1);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}


					entity = entities[1];
					other  = entities[0];

					pos_x = other.position.x + other.width / 2 + 32 + entity.width / 2;
					pos_y = 0;

					entity.trigger('relayout');
					entity.setOrder(2);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}

				} else if (entities.length === 3) {

					// XXX: Stretch widest entity
					let tmp_entity = entities[0];
					let tmp_width  = 0;

					for (let e = 0, el = entities.length; e < el; e++) {

						let entity = entities[e];
						if (entity.width > tmp_entity.width) {
							tmp_entity = entity;
						}

						tmp_width += entity.width;
						tmp_width += 32;

					}

					if (tmp_width - 32 < this.width) {
						tmp_entity.width = tmp_entity.width + (this.width - tmp_width - 32);
					}



					entity = entities[0];

					pos_x = x1 + 32 + entity.width / 2;
					pos_y = 0;

					entity.trigger('relayout');
					entity.setOrder(1);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}


					entity = entities[1];
					other  = entities[0];

					pos_x = pos_x + other.width / 2 + 32 + entity.width / 2;
					pos_y = 0;

					entity.trigger('relayout');
					entity.setOrder(2);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}


					entity = entities[2];
					other  = entities[1];

					pos_x = pos_x + other.width / 2 + 32 + entity.width / 2;
					pos_y = 0;

					entity.trigger('relayout');
					entity.setOrder(3);


					if (fade === true) {

						entity.setPosition({
							x: pos_x,
							y: pos_y - 3 / 2 * this.height
						});

						entity.addEffect(new _Position({
							type:     _Position.TYPE.easeout,
							delay:    100,
							duration: 300,
							position: {
								x: pos_x,
								y: pos_y
							}
						}));

					} else {

						entity.setPosition({
							x: pos_x,
							y: pos_y
						});

					}

				}

			}

		}


		if (fade === true) {
			this.__fade = false;
		}

	};

	const _on_tab = function(name) {

		if (this.__focus.element === null) {
			this.__focus.element = this.entities[0] || null;
		}


		let focus = this.__focus;
		if (focus.element !== null) {

			let entities  = focus.element.entities;
			let triggered = null;


			if (name === 'tab') {

				for (let e = focus.entity !== null ? entities.indexOf(focus.entity) : 0, el = entities.length; e < el; e++) {

					let entity = entities[e];
					if (entity === focus.entity) {

						entity.trigger('blur');

					} else if (entity.visible === true) {

						let result = entity.trigger('focus');
						if (result === true && entity.state === 'active') {
							triggered = entity;
							break;
						}

					}

				}


				if (triggered === null) {

					let index = this.entities.indexOf(focus.element);
					if (index !== -1) {

						focus.element = this.entities[index + 1] || null;
						focus.entity  = null;

					}

				}

			} else if (name === 'shift-tab') {

				for (let e = focus.entity !== null ? entities.indexOf(focus.entity) : entities.length - 1; e >= 0; e--) {

					let entity = entities[e];
					if (entity === focus.entity) {

						entity.trigger('blur');

					} else if (entity.visible === true) {

						let result = entity.trigger('focus');
						if (result === true && entity.state === 'active') {
							triggered = entity;
							break;
						}

					}

				}


				if (triggered === null) {

					let index = this.entities.indexOf(focus.element);
					if (index !== -1) {

						focus.element = this.entities[index - 1] || null;
						focus.entity  = null;

					}

				}

			}



			if (triggered !== null) {
				focus.entity = triggered;
			} else if (focus.element !== null) {
				_on_tab.call(this, name);
			}

		}

	};

	const _on_touch = function(id, position, delta) {

		if (this.visible === false) return null;


		let triggered = null;
		let args      = [ id, {
			x: position.x - this.offset.x,
			y: position.y - this.offset.y
		}, delta ];


		let entity = this.getEntity(null, args[1]);
		if (entity !== null) {

			if (typeof entity.trigger === 'function') {

				args[1].x -= entity.position.x;
				args[1].y -= entity.position.y;

				let result = entity.trigger('touch', args);
				if (result === true) {
					triggered = entity;
				} else if (result !== false) {
					triggered = result;
				}

			}

		} else {

			triggered = this;

		}


		return triggered;

	};

	const _on_swipe = function(id, state, position, delta, swipe) {

		if (this.effects.length === 0) {

			let scroll = this.__scroll;
			let type   = this.type;


			if (type === Composite.TYPE.grid) {

				if (state === 'start') {

					scroll.start = this.offset.y;

				} else if (state === 'move' || state === 'end') {

					if (scroll.start === null) {
						scroll.start = this.offset.x;
					}


					if (Math.abs(swipe.y) >= 128) {

						let offset_y = scroll.start;

						if (swipe.y > 0) {
							offset_y += scroll.delta;
						} else if (swipe.y < 0) {
							offset_y -= scroll.delta;
						}


						if (offset_y < scroll.min_y) {
							offset_y = scroll.min_y;
						} else if (offset_y > 0) {
							offset_y = 0;
						}


						this.addEffect(new _Offset({
							type:     _Offset.TYPE.easeout,
							duration: 300,
							offset:   {
								y: offset_y
							}
						}));


						return false;

					}

				}

			} else if (type === Composite.TYPE.view) {

				if (state === 'start') {

					scroll.start = this.offset.x;

				} else if (state === 'move' || state === 'end') {

					if (scroll.start === null) {
						scroll.start = this.offset.x;
					}


					if (Math.abs(swipe.x) >= 128) {

						let offset_x = scroll.start;

						if (swipe.x > 0) {
							offset_x += scroll.delta;
						} else if (swipe.x < 0) {
							offset_x -= scroll.delta;
						}


						if (offset_x > scroll.max_x) {
							offset_x = scroll.max_x;
						} else if (offset_x < 0) {
							offset_x = 0;
						}


						this.addEffect(new _Offset({
							type:     _Offset.TYPE.easeout,
							duration: 300,
							offset:   {
								x: offset_x
							}
						}));


						return false;

					}

				}

			}

		}


		return true;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.type = Composite.TYPE.grid;


		this.__fade   = false;
		this.__focus  = {
			element: null,
			entity:  null
		};
		this.__scroll = {
			start: 0,
			delta: 0,
			max_x: 0,
			min_y: 0
		};


		this.setType(settings.type);

		delete settings.type;


		settings.relayout = false;


		_Layer.call(this, settings);

		settings = null;



		/*
		 * INITIALIZATION
		 */

		this.unbind('scroll');
		this.unbind('touch');

		this.bind('relayout', _on_relayout, this);
		this.bind('reshape',  _on_relayout, this);
		this.bind('touch',    _on_touch,    this);
		this.bind('swipe',    _on_swipe,    this);

		this.bind('key', function(key, name, delta) {

			let focus = this.__focus;


			if (key === 'tab') {

				_on_tab.call(this, name);


				return true;

			} else if (key === 'page-up') {

				_on_swipe.call(this, null, 'start');
				_on_swipe.call(this, null, 'move', null, null, {
					y: 128
				});


				return true;

			} else if (key === 'page-down') {

				_on_swipe.call(this, null, 'start');
				_on_swipe.call(this, null, 'move', null, null, {
					y: -128
				});


				return true;

			} else if (focus.element !== null) {

				let entity = focus.entity;
				if (entity !== null) {
					entity.trigger('key', [ key, name, delta ]);
				}


				return true;

			}


			return false;

		}, this);

		this.bind('scroll', function(id, direction, position, delta) {

			if (direction === 'up') {

				_on_swipe.call(this, null, 'start');
				_on_swipe.call(this, null, 'move', null, null, {
					y: 128
				});


				return true;

			} else if (direction === 'down') {

				_on_swipe.call(this, null, 'start');
				_on_swipe.call(this, null, 'move', null, null, {
					y: -128
				});


				return true;

			}


			return false;

		}, this);

	};


	Composite.TYPE = {
		grid: 0,
		view: 1,
		full: 2,
		auto: 3
	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Layer.prototype.serialize.call(this);
			data['constructor'] = 'lychee.ui.Blueprint';

			let settings = data['arguments'][0];


			if (this.type !== Composite.TYPE.grid) settings.type = this.type;


			return data;

		},



		/*
		 * CUSTOM API
		 */

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {

				let index = this.entities.indexOf(entity);
				if (index === -1) {

					this.entities.push(entity);
					this.trigger('relayout');

					return true;

				}

			}


			return false;

		},

		setType: function(type) {

			type = lychee.enumof(Composite.TYPE, type) ? type : null;


			if (type !== null) {

				this.type = type;
				this.trigger('relayout');

				return true;

			}


			return false;

		},

		setVisible: function(visible) {

			if (visible === true || visible === false) {

				let fade = false;
				if (this.visible === false && visible === true) {
					fade = true;
				}


				this.visible = visible;


				if (fade === true) {
					this.__fade = true;
					this.trigger('relayout');
				}


				return true;

			}


			return false;

		}

	};


	return Composite;

});

