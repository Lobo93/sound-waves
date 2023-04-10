// Audio object
const audio = new window.AudioContext()
window.addEventListener('click', () => audio.resume())

// Generate noise
function random(a) {
	var t = a += 0x6D2B79F5;
	t = Math.imul(t ^ t >>> 15, t | 1);
	t ^= t + Math.imul(t ^ t >>> 7, t | 61);
	return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
const whiteNoise = Array(audio.sampleRate).fill(0)
whiteNoise.forEach((e,i) => whiteNoise[i] = random(i) * 2 - 1)

// Sound function
function playSound(frequency = notes.A[4], wave = 'sine', attack = 0.02, sustain = 0, release = 0.5, volume = 1) {
	attack = Math.max(parseFloat(attack), 0.01)
	sustain = parseFloat(sustain)
	release = Math.max(parseFloat(release), 0.01)
	volume = Math.max(parseFloat(volume), 0.001)
	const duration = attack + sustain + release
	const gain = new GainNode(audio, {gain: 0})
	let sound

	// Equalize volume
	switch (wave) {
		case 'noise': volume *= 1.5; break;
		case 'sawtooth': volume *= .5; break;
		case 'square': volume *= .35; break;
		default:
	}

	// Noise
	if (wave === 'noise') {
		sound = new AudioBufferSourceNode(audio)
		const noisePattern = [].concat(...Array(Math.ceil(duration)).fill(whiteNoise))
		noisePattern.length = Math.round(audio.sampleRate * duration)
		sound.buffer = audio.createBuffer(1, audio.sampleRate * duration, audio.sampleRate)
		sound.buffer.copyToChannel(Float32Array.from(noisePattern), 0)
		const filter = new BiquadFilterNode(audio, {type: 'bandpass', frequency: frequency})
		sound.connect(filter)
		filter.connect(gain)
	}

	// Wave
	else {
		sound = new OscillatorNode(audio, {type: wave, frequency: frequency})
		sound.connect(gain)
	}

	// Play sound
	gain.connect(audio.destination)
	sound.start()
	gain.gain.linearRampToValueAtTime(volume, audio.currentTime + attack)
	gain.gain.linearRampToValueAtTime(volume, audio.currentTime + attack + sustain)
	gain.gain.linearRampToValueAtTime(0, audio.currentTime + attack + sustain + release)
	sound.stop(audio.currentTime + duration)
}

// button click
document.querySelectorAll('button').forEach(button => {
	button.addEventListener('mousedown', () => {
		if (button.tagName === 'BUTTON') {
			button.classList.remove('animated')
			button.clientTop;
			button.classList.add('animated')
			playSound(440, button.dataset.wave, 0.02, 0, 0.5, 0.5)
		}
	})
	button.addEventListener('animationend', () => button.classList.remove('animated'))
})

