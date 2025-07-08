import { Fields, Regex } from './setup.js'

/**
 * INTERNAL: Set the available actions.
 *
 * @access protected
 * @since 1.0.0
 */
export function updateActions() {
	let actions = {}

	actions['set_storage_mode'] = {
		name: 'Set Storage Mode',
		options: [Fields.StorageMode],
		callback: async (event, context) => {
			let storage_mode = await this.parseActionOption(event, 'storage_mode', context)
			if (storage_mode) {
				this.sendCommand(`SET STORAGE_MODE ${storage_mode}`)
			}
		},
	}
	actions['set_flash'] = {
		name: 'Flash Device',
		options: [],
		callback: async () => {
			this.sendCommand(`SET FLASH ON`)
		},
	}
	actions['set_device_name'] = {
		name: 'Set Device Name',
		options: [Fields.DeviceId],
		callback: async (event, context) => {
			let device_name = await this.parseActionOption(event, 'device_name', context, Regex.DeviceId)
			this.sendCommand(`SET DEVICE_ID {${device_name}}`)
		},
	}

	this.setActionDefinitions(actions)
}
