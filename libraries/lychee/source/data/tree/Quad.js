
lychee.define('lychee.data.tree.Quad').exports(function(lychee, global, attachments) {

	/*
	 * HELPERS
	 */

	const _Quadrant = function(x1, y1, x2, y2) {

		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;

		this.entities  = [];
		this.quadrants = [];

	};

	_Quadrant.prototype = {

		serialize: function() {

			let filtered  = [];
			let entities  = this.entities;
			let quadrants = this.quadrants;

			if (quadrants.length > 0) {

				filtered.push.apply(filtered, quadrants.map(lychee.serialize));

			} else if (entities.length > 0) {

				filtered.push.apply(filtered, entities.map(lychee.serialize));

			}

			return filtered;

		},

		insert: function(position, entity) {

			let quadrants = this.quadrants;
			if (quadrants.length > 0) {

				let x     = position.x;
				let y     = position.y;
				let found = false;

				for (let q = 0, ql = quadrants.length; q < ql; q++) {

					let quadrant = quadrants[q];
					if (
						x >= quadrant.x1
						&& x <= quadrant.x2
						&& y >= quadrant.y1
						&& y <= quadrant.y2
					) {

						let check = quadrant.insert(position, entity);
						if (check === true) {
							found = true;
							break;
						}

					}

				}

				return found;

			} else {

				let entities = this.entities;
				if (entities.indexOf(entity) === -1) {
					entities.push(entity);
				}

				if (entities.length > 8) {

					let check = false;
					let x     = position.x;
					let y     = position.y;

					for (let e = 1, el = entities.length; e < el; e++) {

						let entity = entities[e];

						if (
							x !== entity.position.x
							|| y !== entity.position.y
						) {
							check = true;
							break;
						}

					}


					if (check === true) {
						this.split();
					}

				}

			}


			return true;

		},

		remove: function(position, entity) {

			let index     = this.entities.indexOf(entity);
			let quadrants = this.quadrants;

			if (index !== -1) {

				this.entities.splice(index, 1);

				return true;

			} else if (quadrants.length > 0) {

				let x      = position.x;
				let y      = position.y;
				let amount = 0;
				let found  = false;

				for (let q = 0, ql = quadrants.length; q < ql; q++) {

					let quadrant = quadrants[q];
					if (
						x >= quadrant.x1
						&& x <= quadrant.x2
						&& y >= quadrant.y1
						&& y <= quadrant.y2
					) {


						let check = quadrant.remove(position, entity);
						if (check === true) {
							found = true;
						}

					}

					amount += quadrant.entities.length;
					amount += quadrant.quadrants.length;

				}


				if (amount === 0) {
					this.merge();
				}


				return found;

			}


			return false;

		},

		merge: function() {

			let quadrants = this.quadrants;
			if (quadrants.length > 0) {

				for (let q = 0, ql = quadrants.length; q < ql; q++) {

					let quadrant = this.quadrants[q];
					if (quadrant.entities.length > 0) {
						this.entities.push.apply(this.entities, quadrant.entities);
					}

					this.quadrants.splice(q, 1);
					ql--;
					q--;

				}

			}

		},

		split: function() {

			let quadrants = this.quadrants;
			if (quadrants.length === 0) {

				let cx = this.x1 + Math.abs(this.x2 - this.x1) / 2;
				let cy = this.y1 + Math.abs(this.y2 - this.y1) / 2;

				quadrants[0] = new _Quadrant(cx,      cy,      this.x2, this.y2);
				quadrants[1] = new _Quadrant(this.x1, cy,      cx,      this.y2);
				quadrants[2] = new _Quadrant(this.x1, this.y1, cx,      cy);
				quadrants[3] = new _Quadrant(cx,      this.y1, this.x2, cy);


				let entities = this.entities;
				for (let e = 0, el = entities.length; e < el; e++) {

					let entity = entities[e];

					this.insert(entity.position, entity);

					entities.splice(e, 1);
					el--;
					e--;

				}

			}

		}

	};

	const _validate_entity = function(entity) {

		if (
			entity instanceof Object
			&& entity.position instanceof Object
		) {
			return true;
		}


		return false;

	};

	const _traverse_filter = function(callback, scope) {

		let filtered = [];
		let queue    = [ this.__root ];

		while (queue.length > 0) {

			let quadrant  = queue.shift();
			let entities  = quadrant.entities;
			let quadrants = quadrant.quadrants;

			if (entities.length > 0) {

				for (let e = 0, el = entities.length; e < el; e++) {

					let entity = entities[e];
					if (callback.call(scope, entity) === true) {
						filtered.push(entity);
					}

				}

			}

			if (quadrants.length > 0) {

				for (let q = 0, ql = quadrants.length; q < ql; q++) {
					queue.push(quadrants[q]);
				}

			}

		}

		return filtered;

	};

	const _traverse_find = function(callback, scope) {

		let found = null;
		let queue = [ this.__root ];

		while (queue.length > 0) {

			let quadrant  = queue.shift();
			let entities  = quadrant.entities;
			let quadrants = quadrant.quadrants;

			if (entities.length > 0) {

				for (let e = 0, el = entities.length; e < el; e++) {

					let entity = entities[e];
					if (callback.call(scope, entity) === true) {
						found = entity;
						break;
					}

				}

			}

			if (quadrants.length > 0) {

				for (let q = 0, ql = quadrants.length; q < ql; q++) {
					queue.push(quadrants[q]);
				}

			}

		}

		return found;

	};



	/*
	 * IMPLEMENTATION
	 */

	let Composite = function(data) {

		let settings = Object.assign({}, data);


		this.__root = new _Quadrant(
			-Number.MAX_SAFE_INTEGER,
			-Number.MAX_SAFE_INTEGER,
			+Number.MAX_SAFE_INTEGER,
			+Number.MAX_SAFE_INTEGER
		);


		this.setEntities(settings.entities);

		settings = null;

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		deserialize: function(blob) {

			if (blob.entities instanceof Array) {

				for (let e = 0, el = blob.entities.length; e < el; e++) {

					let entity = lychee.deserialize(blob.entities[e]);
					if (entity !== null) {
						this.addEntity(entity.position, entity);
					}

				}

			}

		},

		serialize: function() {

			let blob = {};


			let root = this.__root;
			if (root.quadrants.length > 0) {

				blob.entities = lychee.serialize(root);

			} else if (root.entities.length > 0) {

				blob.entities = root.entities.map(lychee.serialize);

			}


			return {
				'constructor': 'lychee.data.tree.Quad',
				'arguments':   [],
				'blob':        Object.keys(blob).length > 0 ? blob : null
			};

		},



		/*
		 * CUSTOM API
		 */

		filter: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			let filtered = [];

			if (callback !== null) {
				_traverse_filter.call(this, filtered, callback, scope);
			}

			return filtered;

		},

		find: function(callback, scope) {

			callback = callback instanceof Function ? callback : null;
			scope    = scope !== undefined          ? scope    : this;


			if (callback !== null) {
				return _traverse_find.call(this, callback, scope);
			}


			return null;

		},

		addEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {
				return this.__root.insert(entity.position, entity);
			}


			return false;

		},

		removeEntity: function(entity) {

			entity = _validate_entity(entity) === true ? entity : null;


			if (entity !== null) {
				return this.__root.remove(entity.position, entity);
			}


			return false;

		},

		setEntities: function(entities) {

			entities = entities instanceof Array ? entities : null;


			let all = true;

			if (entities !== null) {

				for (let e = 0, el = entities.length; e < el; e++) {

					let result = this.addEntity(entities[e]);
					if (result === false) {
						all = false;
					}

				}

			}

			return all;

		},

		removeEntities: function() {

			let root = this.__root;

			if (root.entities.length > 0) {
				delete root.entities;
				root.entities = [];
			}

			if (root.quadrants.length > 0) {
				delete root.quadrants;
				root.quadrants = [];
			}

			return true;

		}

	};


	return Composite;

});

