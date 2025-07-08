import { combineRgb } from '@companion-module/base'
import {BayError, BAYState} from './setup.js'

/**
 * INTERNAL: initialize feedbacks.
 *
 * @access protected
 * @since 1.0.0
 */
export function updateFeedbacks() {
	// feedbacks
	let feedbacks = {}


	feedbacks['storage_mode'] = {
		type: 'boolean',
		name: 'Storage Mode',
		description: 'If the Charger is in Storage Mode',
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 165, 0),
		},
		options: [],
		callback: ({}) => {
			return this.api.getCharger().storage_mode;
		},
	}

	feedbacks['flash'] = {
		type: 'boolean',
		name: 'Flash Active',
		description: '',
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 255, 0),
		},
		options: [],
		callback: ({ options }) => {
			return !!this.api.getBay(options.bay).flash;

		},
	}

	feedbacks['bay_detected'] = {
		type: 'boolean',
		name: 'Battery Detected',
		description: 'If a battery is detected in the selected bay',
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 255, 0),
		},
		options: [CreateBayChoices(this.model, this.config)],
		callback: ({ options }) => {
			return !!this.api.getBay(options.bay).detected;

		},
	}

	feedbacks['bay_state'] = {
		type: 'boolean',
		name: 'Bay State',
		description: '',
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 255, 0),
		},
		options: [CreateBayChoices(this.model, this.config), CreateBayStateChoices()],
		callback: ({ options }) => {
			return this.api.getBay(options.bay).state === options.state;

		},
	}

	feedbacks['bay_error'] = {
		type: 'boolean',
		name: 'Bay Error',
		description: '',
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(255, 0, 0),
		},
		options: [CreateBayChoices(this.model, this.config), CreateBayErrorChoices()],
		callback: ({ options }) => {
			return this.api.getBay(options.bay).error === BayError[options.error];

		},
	}

	feedbacks['bay_charge'] = {
		type: 'boolean',
		name: 'Battery Charge Equals',
		description: '',
		defaultStyle: {
			color: combineRgb(0, 0, 0),
			bgcolor: combineRgb(0, 255, 0),
		},
		options: [CreateBayChoices(this.model, this.config), CreateBayChargeInput(), CreateBayChargeInputGreater()],
		callback: ({ options }) => {
			if (this.api.getBay(options.bay).charge >= Number.parseInt(options.charge) && options.chargeGreater) {
				return true
			}
			return this.api.getBay(options.bay).charge === Number.parseInt(options.charge) && !options.chargeGreater;

		},
	}



	this.setFeedbackDefinitions(feedbacks)
}
function CreateBayChargeInputGreater() {
	return {
		type: 'checkbox',
		label: 'Greater Than',
		id: 'chargeGreater',
		default: true,
	}
}

function CreateBayChargeInput() {

	return {
		type: 'textinput',
		label: 'Charge',
		id: 'charge',
		default: '100',
		regex: /^([0-9]|[1-9][0-9]|100)$/,
	}
}

function CreateBayStateChoices() {

	let choices = []
	Object.keys(BAYState).forEach(state => {
		choices.push({ id: state.toString(), label: state.toString() })
	})


	return  {
		type: 'dropdown',
		label: 'State',
		id: 'state',
		default: BAYState.FULL,
		choices: choices,
	}
}

function CreateBayErrorChoices() {

	let choices = []
	Object.keys(BayError).forEach(state => {
		choices.push({ id: state.toString(), label: BayError[state] })
	})


	return {
		type: 'dropdown',
		label: 'Error',
		id: 'error',
		default: "255",
		choices: choices,
	}
}

function CreateBayChoices(model, config) {

	let choices = []
	const moduleCount = model.modular ? model.bays* config.moduleCount : model.bays
	for (let i = 1; i <= moduleCount; i++) {
		choices.push({ id: i, label: `Bay ${i}` })
	}

	return {
		type: 'dropdown',
		label: 'Bay',
		id: 'bay',
		default: 1,
		choices: choices,
	}
}