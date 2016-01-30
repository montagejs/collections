/*
    Copyright (c) 2016, Montage Studio Inc. All Rights Reserved.
    3-Clause BSD License
    https://github.com/montagejs/montage/blob/master/LICENSE.md
*/


var ObjectChangeDescriptor = module.exports.ObjectChangeDescriptor = function ObjectChangeDescriptor() {
	return this;
}

Object.defineProperties(ObjectChangeDescriptor.prototype,{
    initWithName: {
        value:function(name) {
            this.name = name;
        	return this;
        },
        configurable: true,
        writable: true
    },
    name: {
		value:null,
		writable: true
	},
    isActive: {
		value:false,
		writable: true
	},
	_willChangeListeners: {
		value:null,
		writable: true
	},
	willChangeListeners: {
		get: function() {
			return this._willChangeListeners || (this._willChangeListeners = new this.willChangeListenersRecordConstructor().initWithName(this.name));
		}
	},
	_changeListeners: {
		value:null,
		writable: true
	},
    changeListeners: {
		get: function() {
			return this._changeListeners || (this._changeListeners = new this.changeListenersRecordConstructor().initWithName(this.name));
		}
	},
    changeListenersRecordConstructor: {
        value:ChangeListenersRecord,
        writable: true
    },
    willChangeListenersRecordConstructor: {
        value:ChangeListenersRecord,
        writable: true
    }

});

var ListenerGhost = module.exports.ListenerGhost = Object.create(null);

 module.exports.ChangeListenersRecord = ChangeListenersRecord;
function ChangeListenersRecord() {}

Object.defineProperties(ChangeListenersRecord.prototype,{
    initWithName: {
        value:function(name) {
            this.specificHandlerMethodName = "handle";
            this.specificHandlerMethodName += name;
            this.specificHandlerMethodName += "Change";
        	return this;
        },
        configurable: true,
        writable: true
    },
    _current: {
		value: null,
		writable: true
	},
	current: {
		get: function() {
			return this._current || (this._current = []);
		},
        set: function(value) {
            this._current = value;
        }
	},
    _pendingRemove: {
		value: null,
		writable: true
	},
	_pendingRemove: {
		get: function() {
			return this._pendingRemove || (this._pendingRemove = []);
		},
	},
    ListenerGhost: {
        value:ListenerGhost,
        writable: true
    },
    ghostCount: {
        value:0,
        writable: true
    },
    maxListenerGhostRatio: {
        value:0.3,
        writable: true
    },
    listenerGhostFilter: {
        value: function listenerGhostFilter(value) {
          return value !== this.ListenerGhost;
      }
    },
    removeCurrentGostListenersIfNeeded: {
        value: function() {
            if(this.ghostCount/this._current.length>this.maxListenerGhostRatio) {
                this.ghostCount = 0;
                this._current = this._current.filter(this.listenerGhostFilter,this);
            }
            return this._current;
        }
    },
    _active: {
		value: null,
		writable: true
	},
    active: {
		get: function() {
			return this._active || (this._active = []);
		}
	},
    dispatchBeforeChange: {
        value: false,
        writable: true
    },
    genericHandlerMethodName: {
		value: "handlePropertyChange"
	}
});

module.exports.WillChangeListenersRecord = WillChangeListenersRecord;
function WillChangeListenersRecord() {}
WillChangeListenersRecord.prototype = new ChangeListenersRecord();
WillChangeListenersRecord.prototype.constructor = WillChangeListenersRecord;
WillChangeListenersRecord.prototype.genericHandlerMethodName = "handlePropertyWillChange";
WillChangeListenersRecord.prototype.initWithName = function(name) {
    this.specificHandlerMethodName = "handle" ;
    this.specificHandlerMethodName += name;
    this.specificHandlerMethodName += "WillChange";
	return this;
};
