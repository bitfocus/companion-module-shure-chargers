import {BayError, BAYState, ModuleType} from "./setup.js";

/**
 * Companion instance API class for Shure SBRC.
 * Utilized to track the state of the receiver and channels.
 *
 * @version 1.0.0
 * @since 1.0.0
 * @author Joseph Adams <josephdadams@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 * @author Alexander Kettner<alexander.kettner1999@gmail.com>
 */
export default class WirelessApi {
	/**
	 * Create an instance of a Shure API module.
	 *
	 * @param {instance} instance - the parent instance
	 * @since 1.0.0
	 */
	constructor(instance) {
		this.instance = instance

		this.charger  = {
			model: '',
			firmwareVersion: '',
			deviceId: '',
			flash: "OFF",
			storage_mode: 'OFF'
		}

		this.modules = []

		this.bays = []
	}

	/**
	 * Returns the desired bay state object.
	 *
	 * @param {number} id - the bay to fetch
	 * @returns {Object} the desired bay object
	 * @access public
	 * @since 1.0.0
	 */
	getBay(id) {
		if (this.bays[id] === undefined) {
			this.bays[id] = {
				name: `BAY ${id}`,
				detected: false,
				time_to_full: 65535,
				state: BAYState.NO_BATT,
				charge: 255,
				currentCapacity: 65535,
				currentCapacityMAX: 65535,
				capacityMAX: 65535,
				cycleCount: 65535,
				temperatureC: 255,
				temperatureF: 255,
				health: 255,
				bars: 255,
				error: BayError["255"]
			}
		}

		return this.bays[id]
	}

	/**
	 * Returns the desired module state object.
	 *
	 * @param {number} id - the module to fetch
	 * @returns {Object} the module bay object
	 * @access public
	 * @since 1.0.0
	 */
	getModule(id) {
		if (this.modules[id] === undefined) {
			this.modules[id] = {
				type: ModuleType['000'],
			}
		}

		return this.modules[id]
	}


	/**
	 * Returns the charger state object.
	 *
	 * @returns {Object} the charger  state object
	 * @access public
	 * @since 1.0.0
	 */
	getCharger () {
		return this.charger
	}


	/**
	 * Update a bay property.
	 *
	 * @param {number} id - the bay id
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateBay(id, key, value) {
		let bay = this.getBay(id)
		let prefix = 'bay_' + id + '_'

		if (value === 'UNKN' || value === 'UNKNOWN') {
			value = 'Unknown'
		}

		if (key === 'BATT_TIME_TO_FULL') {
			bay.time_to_full = Number.parseInt(value);
			let time_to_full_string = bay.time_to_full.toString();
			switch (bay.time_to_full) {
				case 65535:
					time_to_full_string = 'Unknown';
					break;
				case 65534: 
					time_to_full_string = 'Error';
					break;
				case 65533:	
					time_to_full_string = 'Calculating...';
					break;
				case 65529:
					time_to_full_string = 'Target reached!';
					break;
			}
			this.instance.setVariableValues({ [`${prefix}time_to_full`]: bay.time_to_full })
			this.instance.setVariableValues({ [`${prefix}time_to_full_string`]: time_to_full_string })
			this.instance.checkFeedbacks(`bay_time_to_full`)
		}else if (key === 'BATT_DETECTED') {
			bay.detected = value === 'YES'
			this.instance.setVariableValues({ [`${prefix}detected`]: bay.detected })
			this.instance.checkFeedbacks(`bay_detected`)
		}else if (key === 'BATT_STATE') {
			bay.state = BAYState[value]
			this.instance.setVariableValues({ [`${prefix}state`]: bay.state })
			this.instance.checkFeedbacks(`bay_state`)
		}else if (key === 'BATT_CYCLE') {
			bay.cycleCount = Number.parseInt(value);
			this.instance.setVariableValues({ [`${prefix}cycle_count`]: bay.cycleCount })
			this.instance.checkFeedbacks(`bay_cycle_count`)
		}else if (key === 'BATT_CHARGE') {
			bay.charge = Number.parseInt(value);
			this.instance.setVariableValues({[`${prefix}charge`]: bay.charge})
			this.instance.checkFeedbacks(`bay_charge`)
		}else if (key === 'BATT_HEALTH') {
			bay.health = Number.parseInt(value);
			this.instance.setVariableValues({[`${prefix}health`]: bay.health})
			this.instance.checkFeedbacks(`bay_health`)
		}else if (key === 'BATT_BARS') {
			bay.bars = Number.parseInt(value);
			this.instance.setVariableValues({[`${prefix}bars`]: bay.bars})
			this.instance.checkFeedbacks(`bay_bars`)
		}else if (key === 'BATT_TEMP_C') {
			bay.temperatureC = Number.parseInt(value);
			this.instance.setVariableValues({ [`${prefix}temperature_c`]: bay.temperatureC })
			this.instance.checkFeedbacks(`bay_temperature_c`)
		}else if (key === 'BATT_TEMP_F') {
			bay.temperatureF = Number.parseInt(value);
			this.instance.setVariableValues({ [`${prefix}temperature_f`]: bay.temperatureF })
			this.instance.checkFeedbacks(`bay_temperature_f`)
		}else if (key === 'BATT_CAPACITY_MAX') {
			bay.capacityMAX = Number.parseInt(value);
			this.instance.setVariableValues({ [`${prefix}capacity_max`]: bay.capacityMAX })
			this.instance.checkFeedbacks(`bay_capacity_max`)
		}else if (key === 'BATT_CURRENT_CAPACITY') {
			bay.currentCapacity = Number.parseInt(value);
			this.instance.setVariableValues({ [`${prefix}current_capacity`]: bay.currentCapacity })
			this.instance.checkFeedbacks(`bay_current_capacity`)
		}else if (key === 'BATT_CURRENT_CAPACITY_MAX') {
			bay.currentCapacityMAX = Number.parseInt(value);
			this.instance.setVariableValues({ [`${prefix}current_capacity_max`]: bay.currentCapacityMAX })
			this.instance.checkFeedbacks(`bay_current_capacity_max`)
		}else if (key === 'BATT_ERROR') {
			bay.error = BayError[value] || value
			this.instance.setVariableValues({ [`${prefix}error`]: bay.error })
			this.instance.checkFeedbacks(`bay_error`)
		}

	}

	/**
	 * Update a charger property.
	 *
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateCharger(key, value) {
		if (value === 'UNKN' || value === 'UNKNOWN') {
			value = 'Unknown'
		}

		if (key === 'MODEL') {
			this.charger.model = value.replace('{', '').replace('}', '').trim()
			this.instance.setVariableValues({device_model: this.charger.model})
		} else if (key === 'FW_VER') {
			this.charger.firmwareVersion = value.replace('{', '').replace('}', '').trim()
			this.instance.setVariableValues({firmware_version: this.charger.firmwareVersion})
		} else if (key === 'DEVICE_ID') {
			this.charger.deviceId = value.replace('{', '').replace('}', '').trim()
			this.instance.setVariableValues({deviceId: this.charger.deviceId})
		} else if (key === 'FLASH') {
			this.charger.flash = value === 'ON'
			this.instance.setVariableValues({flash: this.charger.flash})
		} else if (key === 'STORAGE_MODE') {
			this.charger.storage_mode = value === 'ON'

			this.instance.setVariableValues({storage_mode: this.charger.storage_mode})
			this.instance.checkFeedbacks('storage_mode')
		}
	}

	/**
	 * Update a module property.
	 *
	 * @param {number} id - the module id
	 * @param {String} key - the command id
	 * @param {String} value - the new value
	 * @access public
	 * @since 1.0.0
	 */
	updateModule(id, key, value) {
		let module = this.getModule(id)
		let prefix = 'module_' + id + '_'
		if (value === 'UNKN' || value === 'UNKNOWN') {
			value = 'Unknown'
		}

		if (key === 'BATT_MODULE_TYPE') {
			module.type = ModuleType[value]
			this.instance.setVariableValues({ [`${prefix}type`]: module.type})
			this.instance.updateActions()
			this.instance.updateFeedbacks()
		}
	}
}
