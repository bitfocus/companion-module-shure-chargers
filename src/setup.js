function CreateModelChoices() {
	let choices = Object.values(Models)
	// Sort alphabetical
	choices.sort(function (a, b) {
		let x = a.label.toLowerCase()
		let y = b.label.toLowerCase()
		if (x < y) {
			return -1
		}
		if (x > y) {
			return 1
		}
		return 0
	})

	return choices
}

export const Models = {
	sbc220: { id: 'sbc220', label: 'SBC220 AD', bays: 2, modules: 4, modular: true },
	sbc240: { id: 'sbc240', label: 'SBC240 ADX', bays: 2, modules: 4, modular: true },
	sbrc: { id: 'sbrc', label: 'SBRC Rack Charger', bays: 8, modules: 4, modular: false },
}

export const BAYState = {
	FULL: 'FULL',
	CALCULATING: 'CALCULATING',
	NORMAL: 'NORMAL',
	WARM: 'WARM',
	WARM_FULL: 'WARM_FULL',
	HOT: 'HOT',
	COLD: 'COLD',
	PRECHARGE: 'PRECHARGE',
	READY_TO_STORE: 'READY_TO_STORE',
	DISCHARGE_CALC: 'DISCHARGE_CALC',
	DISCHARGING: 'DISCHARGING',
	DISCHARGING_WARM: 'DISCHARGING_WARM',
	DISCHARGING_COLD: 'DISCHARGING_COLD',
	ERROR: 'ERROR',
	NO_BATT: 'NO_BATT',
}

export const BayError = {
	'000': 'No Active Error',
	'001': 'Unknown Module',
	'002': 'Unrecognized Battery',
	'003': 'Deep Discharge Recovery Failed',
	'004': 'Charge Failed',
	'005': 'Check Battery',
	'006': 'Check Charger',
	'007': 'Communication Failure',
	255: 'No Data',
}

export const ModuleType = {
	'000': 'No module installed',
	'001': 'AXT902',
	'002': 'AXT901',
	'003': 'SBC-AX (For SB900x)',
	'004': 'SBM920',
	'005': 'SBM910',
	'006': 'SBM910M',
	255: 'Invalid / Unsupported module',
}

export function CreateModuleCountCoices() {
	let choices = []

	for (let i = 1; i <= 4; i++) {
		choices.push({ id: i, label: i.toString() })
	}

	return choices
}

export const Choices = {
	Models: CreateModelChoices(),
	ModuleCount: CreateModuleCountCoices(),
}

export const Regex = {
	Frequency: '/^(4[7-9][0-9]|[5-8][0-9]{2}|9[0-2][0-9]|93[0-7])\\.\\d(00|25|50|75)$/',
	Name: '/^.{1,8}$/',
	DeviceId: '/^[A-Za-z0-9\\s!"#$%&\'()*+,\\-\\.\\/:;<=>?@\\[\\\\\\]^_`~]{1,8}$/',
}

export const Fields = {
	StorageMode: {
		type: 'dropdown',
		label: 'Storage Mode',
		id: 'storage_mode',
		default: 'OFF',
		choices: [
			{ id: 'OFF', label: 'Off' },
			{ id: 'ON', label: 'On' },
			{ id: 'TOGGLE', label: 'Toggle' },
		],
	},
	DeviceId: {
		type: 'textinput',
		label: 'Device Name',
		id: 'device_name',
		default: '',
		width: 8,
		maxLength: 8,
		regex: Regex.DeviceId,
	},
}
