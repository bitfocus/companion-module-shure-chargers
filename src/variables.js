import { Models } from './setup.js'

/**
 * INTERNAL: initialize variables.
 *
 * @access protected
 * @since 1.0.0
 */
export function updateVariables() {
	let variables = []

	if (!this.model.modular) {
		this.log('debug', 'Charger is not modular, setting variables for single module')
		variables.push({ variableId: `module_1_type`, name: `Module 1 Type` })
		variables.push({ variableId: `module_2_type`, name: `Module 2 Type` })
		variables.push({ variableId: `module_3_type`, name: `Module 3 Type` })
		variables.push({ variableId: `module_4_type`, name: `Module 4 Type` })
	}

	const moduleCount = this.model.modular
		? Models[this.config.modelID].bays * this.config.moduleCount
		: Models[this.config.modelID].bays

	for (let i = 1; i <= moduleCount; i++) {
		let prefix = `bay_${i}`
		variables.push({ variableId: `${prefix}_time_to_full`, name: `Time To Full Bay ${i}` })
		variables.push({ variableId: `${prefix}_time_to_full_string`, name: `Time To Full as String Bay ${i}` })
		variables.push({ variableId: `${prefix}_detected`, name: `Battery in bay ${i} detected` })
		variables.push({ variableId: `${prefix}_state`, name: `Bay ${i} State` })
		variables.push({ variableId: `${prefix}_cycle_count`, name: `Battery Cycles bay ${i}` })
		variables.push({ variableId: `${prefix}_charge`, name: `Battery charge in % bay ${i}` })
		variables.push({ variableId: `${prefix}_health`, name: `Battery health bay ${i}` })
		variables.push({ variableId: `${prefix}_temperature_c`, name: `Battery temperature in C bay ${i}` })
		variables.push({ variableId: `${prefix}_temperature_f`, name: `Battery temperature in F bay ${i}` })
		variables.push({ variableId: `${prefix}_capacity_max`, name: `Battery capacity max bay ${i}` })
		variables.push({ variableId: `${prefix}_current_capacity`, name: `Battery current capacity bay ${i}` })
		variables.push({ variableId: `${prefix}_current_capacity_max`, name: `Battery current capacity max bars bay ${i}` })
		variables.push({ variableId: `${prefix}_bars`, name: `Battery bars bay ${i}` })
		variables.push({ variableId: `${prefix}_error`, name: `Battery error bay ${i}` })
	}

	variables.push({ variableId: `device_model`, name: `Charger Model` })
	variables.push({ variableId: `firmware_version`, name: `Firmware Version` })
	variables.push({ variableId: `deviceId`, name: `Charger Id` })
	variables.push({ variableId: `flash`, name: `Charger Flash Mode` })
	variables.push({ variableId: `storage_mode`, name: `Charger Storage Mode` })

	this.setVariableDefinitions(variables)
}
