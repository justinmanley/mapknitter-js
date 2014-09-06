MapKnitter.Resources = MapKnitter.Class.extend({

	supported: [ 'Annotation' ],

	/* Change this as necessary for development: e.g. to http://localhost:3000 */
	baseUrl: '',

	initialize: function(options) {
		this._map_id = options.map_id;

		this._mapUrl = this.baseUrl + '/maps/' + this._map_id + '/';
		this._resourcesUrl = this._mapUrl + this._name + 's/';
	},

	retrieve: function(id, callback) {
		this._retrieveResources(id, callback)
			.done.call(this, function() {
				console.log('retrieved resources');
			});
	},

	create: function(annotation) {
		this._createResource(annotation)
			.done.call(this, function() {
				console.log('created new resource');
			});
	},

	update: function() {	
		// PUT to /maps/:map_id/:resources/:id
	},

	delete: function() {

	},

	_retrieveResources: function(id, callback) {
		/* 
		 * With the optional id argument, _retrieveResources gets a single resource, if it exists. 
		 * Without the optional id argument, _retrieveResources gets all resources.
		 */

		var url;

		if (!callback && typeof id === 'function') {
			callback = id;
			id = undefined;
		}

		url = id ? this._resourcesUrl + id : this._resourcesUrl;

		return jQuery.ajax({
			url: url,
			dataType: 'json',
			context: this,
			success: function(data) { callback.call(this, data); },
			error: function(jqXHR, status, thrownError) { console.log(thrownError);	}
		});
	},

	_createResource: function(resource, dest) {
		/* POST to /maps/<%= this._map_id %>/<%= this._name %> */
		var data 	= {},
			token 	= $("meta[name='csrf-token']").attr("content");

		data[this._name] = this.toJSON(resource);

		return jQuery.ajax({
			url: 			this._resourcesUrl,
			data: 			JSON.stringify(data),
			contentType: 	'application/json',
			type: 			'POST',
			beforeSend: 	function(xhr) {
				/* Need to pass the csrf token in order to maintain the user session. */
				xhr.setRequestHeader('X-CSRF-Token', token);
				// xhr.setRequestHeader('Content-Type', 'application/json');
			},
			success: 		function(data) { dest = data; },
			error: 			function(jqXHR, status, thrownError) { console.log(thrownError); }
		});
	}

});

/* Automatically define classes extending MapKnitter.Resources for all supported resources types. */
(function() {
	for (var i = 0; i < MapKnitter.Resources.prototype.supported.length; i++) {
		var resource = MapKnitter.Resources.prototype.supported[i];

		MapKnitter[resource + 's'] = MapKnitter.Resources.extend({
			_name: resource.toLowerCase()
		});	
	}
})();