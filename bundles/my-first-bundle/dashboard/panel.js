// You can access the NodeCG api anytime from the `window.nodecg` object
// Or just `nodecg` for short. Like this!:
nodecg.log.info("Here's an example of using NodeCG's logging API!");

// Bind the input field with the 'displayText' replicant
const textInput = document.getElementById('textInput');
const displayTextRep = nodecg.Replicant('displayText', { defaultValue: '' });

// Keep the input in sync with the replicant value
displayTextRep.on('change', (newVal) => {
	if (textInput && newVal !== textInput.value) {
		textInput.value = newVal || '';
	}
});

// Update the replicant when the user types
if (textInput) {
	textInput.addEventListener('input', () => {
		displayTextRep.value = textInput.value;
	});
}
