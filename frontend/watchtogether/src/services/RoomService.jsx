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



export const joinRoom = async (roomId, body = {}) => {
    try {
        const response = await fetch(`http://localhost:8080/api/rooms/${roomId}/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if(!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.error('Error joining room:', error);
        throw error;
    }
};

export const getParticipants = async (roomId) => {
    try {
        const response = await fetch(`http://localhost:8080/api/rooms/${roomId}/participants`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if(!response.ok) {
            throw new Error('HTTP error ' + response.status);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
    }
};
