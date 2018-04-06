class Message {

	constructor(){}

	get type() {
		throw new Error('not implemented');
	}

	get data() {
		throw new Error('not implemented');
	}

	static get Type() { 
		return Object.freeze({
			All:				"all-message-types",
			Connection:			"connection",
			Request:			"request",
			Update:				"update",
			Play:				"play",
			Pause:				"pause",
			Rewind:				"rewind",
			Forward:			"forward",
			RateUp:				"rate-up",
			RateDown:			"rate-down",
			Lucky:				"i'm feeling lucky",
			Test:				"test message",
			TestToContent:		"test-to-content message"
		});
	}
}