//EXAMPLE 1:

// This is an asynchronous function called "onTrack" that takes two parameters: "event" and "settings".
async function onTrack(event, settings) {
	// Extract the "eventProperties" from the "event" object.
	const eventProperties = event.properties;

	// Check if the "environment" property is missing in the eventProperties.
	if (!eventProperties.environment) {
		// If it's missing, throw an error indicating that it's required.
		throw new InvalidEventPayload('environment property is required');
	}
	
	// Check if the "name" property is missing in the eventProperties.
	if (!eventProperties.name) {
		// If it's missing, throw an error indicating that it's required.
		throw new InvalidEventPayload('Workflow name property is required');
	}

	// Log the value of the "environment" property to the console.
	console.log('environment:', eventProperties.environment);

	// Create a "payload" object that contains information from the eventProperties.
	const payload = {
		name: eventProperties.name,
		to: {
			subscriberId: eventProperties.user.subscriberId,
			email: eventProperties.user.email,
			firstName: eventProperties.user.firstName,
			lastName: eventProperties.user.lastName
		},
		payload: { eventProperties }
	};
	
	// Get the "endpoint" from the "settings" object.
	const endpoint = settings.novuEndpoint;
	
	// Log the value of the "endpoint" to the console.
	console.log('endpoint:', endpoint);

	// Get the API key from the "settings" object.
	const ApiKey = settings.novuApiKey; // Your NOVU API key
	
	// Check if the "environment" property in eventProperties matches the "environment" in settings.
	if (eventProperties.environment === settings.environment) {
		let response;
		try {
			// Send a POST request to the "endpoint" with the "payload" data and API key in the headers.
			response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					Authorization: `ApiKey ${ApiKey}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			});
		} catch (error) {
			// If there's an error during the request, catch it and throw a "RetryError" with the error message.
			// This is for handling connection errors.
			throw new RetryError(error.message);
		}
		
		// Check if the response status code is a server error (5xx) or a rate limit error (429).
		if (response.status >= 500 || response.status === 429) {
			// If it is, throw a "RetryError" with a message indicating the failure.
			throw new RetryError(`Failed with ${response.status}`);
		}
	}
}
