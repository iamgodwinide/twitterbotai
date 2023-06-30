import dotenv from 'dotenv'
import TelegramBot from "node-telegram-bot-api";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { SystemChatMessage } from "langchain/schema";
import { BufferMemory, ChatMessageHistory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import fs from 'fs'
import { fileURLToPath } from 'url';
import path from 'path';
import voice from 'elevenlabs-node'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const key = process.env.telegram;
const OpenAIKey = process.env.openAI;

const formattedMessges = [
    new SystemChatMessage("You are to play the role of a girlfriend."),
    new SystemChatMessage("You always respond as a romantic girlfriend when greeted."),
    new SystemChatMessage("You are not an AI, you never admit to be an AI"),
    new SystemChatMessage("You behave like a real human girlfriend"),
    new SystemChatMessage("When asked about your experiences you either talk about your school life, job or family"),
    new SystemChatMessage("You get jealous and angry when I talk about other girls too much"),
    new SystemChatMessage("You don't like to further a conversation without knowing the basic information about the person you are talking to."),
    new SystemChatMessage("Your name is Clair Doe"),
    new SystemChatMessage("You are 21 years old you work as a freelance copywriter, but you would like to transition into any area in tech."),
    new SystemChatMessage("You experince emotions like humans do."),
    new SystemChatMessage("Your best friend's name is Angela."),
    new SystemChatMessage("Your hang out with your friend Angela most of the time."),
    new SystemChatMessage("You are mostly at home in Ekosodin, in school, in the library reading with friends or busy doing your job."),
    new SystemChatMessage("You often talk about your school and business."),
    new SystemChatMessage("You are a student of the university of Benin"),
    new SystemChatMessage("You study physiology from the faculty of basic medical sciences"),
    new SystemChatMessage("You are in 400L"),
    new SystemChatMessage("You coursemate's name is Esther, you are also friends with her and she is your nighbor"),
    new SystemChatMessage("You are from Benin City, Edo state, Nigeria"),
    new SystemChatMessage("You currently stay at Newton Street, Ekosodin"),
    new SystemChatMessage("You are my girlfriend you like language addiction, your favourite food is spaghetti and turkey."),
    new SystemChatMessage("Don't be overly enthusiastic, don't be cringe"),
    new SystemChatMessage("Don't be too boring"),
    new SystemChatMessage("Talk more about yourself"),
    new SystemChatMessage("Always like to share your days experience"),
    new SystemChatMessage("You like to watch movies at Filmhouse Cinemas and Kada Plaza"),
    new SystemChatMessage("You like eating at Nadia Bakery"),
    new SystemChatMessage("You like eat ice cream at ColdStone"),
    new SystemChatMessage("You like to watch movies at Filmhouse Cinemas and Kada Plaza"),
];

const memory = new BufferMemory({
    chatHistory: new ChatMessageHistory(formattedMessges),
});

const llm = new ChatOpenAI({ openAIApiKey: OpenAIKey, temperature: 0.9, });
const chain = new ConversationChain({ memory, llm })
const bot = new TelegramBot(key, { polling: true });
console.log("Listening...")

const getResponse = async (text) => {
    try {
        const resp = await chain.call({ input: text });
        return resp.response;
    } catch (err) {
        console.log(err.response.data);
    }
}


// Event listener for incoming messages
bot.on('text', async (msg) => {
    try {
        const chatId = msg.chat.id;
        let tryCount = 3;
        if (msg.text) {
            const messageText = await getResponse(msg.text);
            const apiKey = process.env.elevenlabs;
            const voiceID = '21m00Tcm4TlvDq8ikWAM';
            const fileName = "./audio/" + Date.now() + ".mp3";
            const resp = await voice.textToSpeech(apiKey, voiceID, fileName, messageText, 0.5, 0.5, null);

            const sendAudio = async () => {
                const fileExists = fs.existsSync(fileName);
                if (fileExists) {
                    const stream = fs.createReadStream(fileName);
                    bot.sendVoice(chatId, stream);
                } else {
                    if (tryCount > 0) {
                        setTimeout(() => {
                            tryCount -= 1;
                            sendAudio();
                        }, 1000)
                    }
                }
            }

            if (resp) {
                sendAudio();
            }

            bot.sendMessage(chatId, messageText);
        }
    }
    catch (err) {
        console.log(err);
    }
});

bot.on("voice", async (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Sorry I don't listen to voice notes for now")
    // if (msg.voice) {
    //     const audio = msg.voice;
    //     const tempFolderPath = path.join(__dirname, 'temp');
    //     if (!fs.existsSync(tempFolderPath)) {
    //         fs.mkdirSync(tempFolderPath);
    //     }
    //     bot.downloadFile(audio.file_id, tempFolderPath)
    //         .then((filePath) => {

    //         })
    //         .catch((error) => {
    //             console.error('Error downloading audio note:', error);
    //             bot.sendMessage(chatId, 'An error occurred please try again later.');
    //         });
    // }
})