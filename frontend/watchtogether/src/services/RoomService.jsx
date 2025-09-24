export const createRoom = async () => {
    try {
        const response = await fetch('http://localhost:8080/api/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });
        if(!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        const data = await response.json();
        return data; // Assuming the response contains the room details
    } catch (error) {
        console.error('Error creating room:', error);
        throw error;
    }
};
