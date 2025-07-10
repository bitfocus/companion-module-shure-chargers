import {
	InstanceBase,
	InstanceStatus,
	Regex,
	runEntrypoint,
	TCPHelper,
} from '@companion-module/base'
import { updateActions } from './actions.js'
import { updateFeedbacks } from './feedback.js'
import { updateVariables } from './variables.js'
import WirelessApi from './internalAPI.js'
import { Choices, Models } from './setup.js'

/**
 * Companion instance class for the Shure Wireless Microphones.
 *
 * @extends InstanceBase
 * @since 1.0.0
 * @author Joseph Adams <josephdadams@gmail.com>
 * @author Keith Rocheck <keith.rocheck@gmail.com>
 */
class ShureWirelessInstance extends InstanceBase {
	/**
	 * Create an instance of a shure WX module.
	 *
	 * @param {Object} internal - Companion internals
	 * @since 1.0.0
	 */
	constructor(internal) {
		super(internal)

		this.updateActions = updateActions.bind(this)
		this.updateFeedbacks = updateFeedbacks.bind(this)
		this.updateVariables = updateVariables.bind(this)
	}

	/**
	 * Process an updated configuration array.
	 *
	 * @param {Object} config - the new configuration
	 * @access public
	 * @since 1.0.0
	 */
	async configUpdated(config) {
		let resetConnection = false

		this.log('debug', 'configUpdated')
		this.log('debug', `Config: ${JSON.stringify(config)}`)

		if (this.config.host !== config.host) {
			resetConnection = true
		}

		this.config = config

		if (Models[this.config.modelID] !== undefined) {
			this.model = Models[this.config.modelID]
		} else {
			this.log('debug', `Shure Model: ${this.config.modelID} NOT FOUND`)
		}

		this.updateActions()
		this.updateFeedbacks()
		this.updateVariables()

		if (resetConnection === true || this.socket === undefined) {
			this.initTCP()
		}
	}

	/**
	 * Clean up the instance before it is destroyed.
	 *
	 * @access public
	 * @since 1.0.0
	 */
	async destroy() {
		if (this.socket !== undefined) {
			this.socket.destroy()
		}

		this.log('debug', 'destroy', this.id)
	}

	/**
	 *
	 * @param {object} event - action event
	 * @param {string} option - which event option to parse
	 * @param {object} context 	- contains variable parser function
	 * @param {object} [validate] - optional regexp or range to compare against result
	 * @returns result of parsing variables in event.options[option] or null if regex or range fails
	 * @access private
	 * @since 2.1.0
	 */
	async parseActionOption(event, option, context, validate) {
		let value = String(await context.parseVariablesInString(event.options[option])).trim()
		let err = null

		if (validate?.regex && !validate.regex.test(value)) {
			err = [event.controlId, event.actionId, option].join(' → ')
		} else if (validate?.range) {
			value = parseInt(value)
			if (value < validate.min || value > validate.max) {
				err = [event.controlId, event.actionId, option, 'Out of range'].join(' → ')
			}
		}
		if (err && !this.paramErr) {
			this.updateStatus(InstanceStatus.BadConfig, err)
			this.paramErr = true
			value = null
		} else if (this.paramErr) {
			this.updateStatus(InstanceStatus.Ok)
			this.paramErr = false
		}

		return value
	}

	/**
	 * Creates the configuration fields for web config.
	 *
	 * @returns {Array} the config fields
	 * @access public
	 * @since 1.0.0
	 */
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Target Port',
				default: 2202,
				width: 2,
				regex: Regex.PORT,
			},
			{
				type: 'dropdown',
				id: 'modelID',
				label: 'Model Type',
				choices: Choices.Models,
				width: 6,
				default: 'sbrc',
			},
			{
				type: 'dropdown',
				id: 'moduleCount',
				label: 'Number of Modules',
				choices: Choices.ModuleCount,
				default: 1,
				isVisible: (options) => options['modelID'] !== 'sbrc',
			},
		]
	}

	/**
	 * Main initialization function called once the module
	 * is OK to start doing things.
	 *
	 * @param {Object} config - the configuration
	 * @access public
	 * @since 1.0.0
	 */
	async init(config) {
		this.config = config
		this.model = {}
		this.initDone = false

		this.CHOICES_BAYS = []
		this.CHOICES_BAYS_A = []

		if (this.config.modelID !== undefined) {
			this.model = Models[this.config.modelID]
		} else {
			this.config.modelID = 'sbrc'
			this.model = Models['sbrc']
		}

		this.updateStatus(InstanceStatus.Disconnected, 'Connecting')

		this.api = new WirelessApi(this)

		this.setupFields()

		this.updateActions()
		this.updateVariables()
		this.updateFeedbacks()

		this.initTCP()
	}

	/**
	 * INTERNAL: use setup data to initalize the tcp socket object.
	 *
	 * @access protected
	 * @since 1.0.0
	 */
	initTCP() {
		this.receiveBuffer = ''

		if (this.socket !== undefined) {
			this.socket.destroy()
			delete this.socket
		}

		if (this.config.port === undefined) {
			this.config.port = 2202
		}

		if (this.config.host) {
			this.socket = new TCPHelper(this.config.host, this.config.port)

			this.socket.on('status_change', (status, message) => {
				this.updateStatus(status, message)
			})

			this.socket.on('error', (err) => {
				this.log('error', `Network error: ${err.message}`)
			})

			this.socket.on('connect', () => {
				this.log('debug', 'Connected')
				let cmd = '< GET 0 ALL >'
				this.socket.send(cmd)
			})

			// separate buffered stream into lines with responses
			this.socket.on('data', (chunk) => {
				let i = 0,
					line = '',
					offset = 0
				this.receiveBuffer += chunk

				while ((i = this.receiveBuffer.indexOf('>', offset)) !== -1) {
					line = this.receiveBuffer.substr(offset, i - offset)
					offset = i + 1
					this.socket.emit('receiveline', line.toString())
				}

				this.receiveBuffer = this.receiveBuffer.substr(offset)
			})

			this.socket.on('receiveline', (line) => {
				this.processShureCommand(line.replace('< ', '').trim())
			})
		}
	}

	/**
	 * INTERNAL: Routes incoming data to the appropriate function for processing.
	 *
	 * @param {string} command - the command/data type being passed
	 * @access protected
	 * @since 1.0.0
	 */
	processShureCommand(command) {
		if ((typeof command === 'string' || command instanceof String) && command.length > 0) {
			let commandArr = command.split(' ')
			let commandType = commandArr.shift()
			let commandNum = parseInt(commandArr[0])

			let joinData = function (commands, start) {
				let out = ''
				if (commands.length > 0) {
					for (let i = start; i < commands.length; i++) {
						out += commands[i] + ' '
					}
				}
				return out.trim()
			}

			if (commandType === 'REP') {
				//this is a report command
				//this.log('debug', `Received report: ${commandArr}`)
				if (isNaN(commandNum)) {
					//this command isn't about a specific bay
					this.api.updateCharger(commandArr[0], joinData(commandArr, 1))
				} else {
					//this command is about a specific bay
					if (commandArr[1] === 'BATT_MODULE_TYPE') {
						this.api.updateModule(commandNum, commandArr[1], joinData(commandArr, 2))
					} else {
						this.api.updateBay(commandNum, commandArr[1], joinData(commandArr, 2))
					}
				}
			}
		}
	}

	/**
	 * INTERNAL: send a command to the receiver.
	 *
	 * @access protected
	 * @since 1.2.0
	 */
	sendCommand(cmd) {
		if (cmd !== undefined) {
			if (this.socket !== undefined && this.socket.isConnected) {
				this.socket.send(`< ${cmd} >`)
			} else {
				this.log('debug', 'Socket not connected :(')
			}
		}
	}

	/**
	 * Set up the fields used in actions and feedbacks
	 *
	 * @access protected
	 * @since 1.1.0
	 */
	setupFields() {
		this.BAYS_FIELD = {
			type: 'dropdown',
			label: 'Bay',
			id: 'bay',
			default: '1',
			choices: this.CHOICES_BAYS,
		}
		this.BAYS_A_FIELD = {
			type: 'dropdown',
			label: 'Bay',
			id: 'bay',
			default: '1',
			choices: this.CHOICES_BAYS_A,
		}
	}
}

runEntrypoint(ShureWirelessInstance, [])
