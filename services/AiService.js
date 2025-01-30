const Axios = require('axios');

const GenerateAiResponse = async (prompt, chatData) => {
    try {
        const response = await Axios.post(process.env.AI_SERVER_ADDR, {
            prompt: prompt,
            chatData: chatData,
        });
        return response.data.choices[0].text;
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw error;
    }
}