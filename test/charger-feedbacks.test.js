import assert from 'node:assert/strict'
import test from 'node:test'
import { updateFeedbacks } from '../src/feedback.js'
import WirelessApi from '../src/internalAPI.js'
import { Models } from '../src/setup.js'

function setup(model) {
	const definitions = {}
	const values = {}
	const evaluations = []
	const instance = {
		model,
		config: { modelID: model.id, moduleCount: 1 },
		setFeedbackDefinitions: (feedbacks) => Object.assign(definitions, feedbacks),
		setVariableValues: (updates) => Object.assign(values, updates),
		checkFeedbacks: (...ids) => {
			for (const id of ids) evaluations.push({ id, value: definitions[id].callback({ options: {} }) })
		},
	}
	instance.api = new WirelessApi(instance)
	updateFeedbacks.call(instance)
	return { api: instance.api, definitions, values, evaluations }
}

for (const model of Object.values(Models)) {
	test(`${model.id}: charger feedbacks start as boolean false`, () => {
		const { definitions } = setup(model)
		assert.equal(definitions.flash.callback({ options: {} }), false)
		assert.equal(definitions.storage_mode.callback({ options: {} }), false)
	})

	test(`${model.id}: FLASH reports update both variable and feedback`, () => {
		const { api, definitions, values, evaluations } = setup(model)
		assert.deepEqual(definitions.flash.options, [])
		api.updateCharger('FLASH', 'ON')
		assert.equal(values.flash, true)
		assert.equal(definitions.flash.callback({ options: {} }), true)
		assert.deepEqual(evaluations, [{ id: 'flash', value: true }])
		api.updateCharger('FLASH', 'OFF')
		assert.equal(values.flash, false)
		assert.equal(definitions.flash.callback({ options: {} }), false)
		assert.deepEqual(evaluations, [
			{ id: 'flash', value: true },
			{ id: 'flash', value: false },
		])
	})

	test(`${model.id}: STORAGE_MODE reports keep variable and feedback in sync`, () => {
		const { api, definitions, values, evaluations } = setup(model)
		api.updateCharger('STORAGE_MODE', 'ON')
		assert.equal(values.storage_mode, true)
		assert.equal(definitions.storage_mode.callback({ options: {} }), true)
		api.updateCharger('STORAGE_MODE', 'OFF')
		assert.equal(values.storage_mode, false)
		assert.equal(definitions.storage_mode.callback({ options: {} }), false)
		assert.deepEqual(evaluations, [
			{ id: 'storage_mode', value: true },
			{ id: 'storage_mode', value: false },
		])
	})
}

test('device flash feedback never reads or creates a battery bay', () => {
	const { api, definitions } = setup(Models.sbrc)
	api.getBay = () => assert.fail('device-level feedback must not access a bay')
	api.updateCharger('FLASH', 'ON')
	assert.equal(definitions.flash.callback({ options: {} }), true)
})

test('battery detected feedback still reads the selected bay', () => {
	const { api, definitions } = setup(Models.sbrc)
	api.getBay(2).detected = true
	assert.equal(definitions.bay_detected.callback({ options: { bay: 1 } }), false)
	assert.equal(definitions.bay_detected.callback({ options: { bay: 2 } }), true)
})
