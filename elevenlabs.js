import voice from 'elevenlabs-node'

export const getAudio = async textInput => {

    const apiKey = process.env.elevenlabs; // Your API key from Elevenlabs
    const voiceID = '21m00Tcm4TlvDq8ikWAM';            // The ID of the voice you want to get
    const fileID = Date.now();
    const fileName = "./temp/" + fileID + ".mp3";                      // The name of your audio file

    const resp = voice.textToSpeech(apiKey, voiceID, fileName, textInput);

    if (resp) {
        return fileID
    }

}