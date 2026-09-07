import assert from 'node:assert/strict'
import test from 'node:test'
import { updateFeedbacks } from '../src/feedback.js'
import { updateVariables } from '../src/variables.js'
import { Models } from '../src/setup.js'

function definitions(modelID, moduleCount) {
	let variables
	let feedbacks
	const instance = {
		model: Models[modelID],
		config: { modelID, moduleCount },
		setVariableDefinitions: (value) => (variables = value),
		setFeedbackDefinitions: (value) => (feedbacks = value),
	}
	updateVariables.call(instance)
	updateFeedbacks.call(instance)
	return { variables, feedbacks }
}

function assertBays(modelID, moduleCount, count) {
	const { variables, feedbacks } = definitions(modelID, moduleCount)
	const expected = Array.from({ length: count }, (_, i) => i + 1)
	const detectedVariables = variables.filter(({ variableId }) => /^bay_\d+_detected$/.test(variableId))
	assert.deepEqual(
		detectedVariables.map(({ variableId }) => Number(variableId.split('_')[1])),
		expected
	)
	// Every bay has the same 14 existing variables; no extra bay may leak through.
	assert.equal(variables.filter(({ variableId }) => /^bay_\d+_/.test(variableId)).length, count * 14)
	for (const id of ['bay_detected', 'bay_state', 'bay_error', 'bay_charge']) {
		const option = feedbacks[id].options.find(({ id }) => id === 'bay')
		assert.deepEqual(
			option.choices.map(({ id }) => id),
			expected,
			id
		)
	}
}

for (const count of [undefined, 1, 2, 3, 4, '4']) {
	test(`SBC441 always exposes four bays with saved moduleCount=${count}`, () => {
		assertBays('sbc441', count, 4)
	})
}

for (const modelID of ['sbc220', 'sbc240']) {
	for (const count of [1, 2, 3, 4, '4']) {
		test(`${modelID} retains ${count} daisy-chained units`, () => {
			assertBays(modelID, count, Number(count) * 2)
		})
	}
}

for (const modelID of ['sbrc', 'sbc840m']) {
	test(`${modelID} retains eight bays despite saved moduleCount=4`, () => {
		assertBays(modelID, 4, 8)
	})
}
