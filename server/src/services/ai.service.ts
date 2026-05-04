import Groq from 'groq-sdk';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function callGroqAI(
  userMessage: string,
  conversationHistory: Array<{ role: string; content: string }>,
  systemPrompt: string,
  model: string = process.env.AI_MODEL || 'llama-3.3-70b-versatile'
): Promise<string> {
  console.log(`--- Calling Groq with model: ${model} ---`);
  
  try {
    // Formatear el historial para el formato de chat de Groq/OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      { role: 'user', content: userMessage }
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: model,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
      stream: false,
    });

    const response = chatCompletion.choices[0]?.message?.content || '';
    console.log('Groq responded successfully');
    
    return response;
  } catch (error: any) {
    console.error('Groq API Error:', error.message);
    throw new Error(`Failed to get response from Groq: ${error.message}`);
  }
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  filename: string = 'audio.m4a'
): Promise<string> {
  console.log('--- Transcribing audio with Groq Whisper ---');
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: new File([audioBuffer], filename),
      model: 'whisper-large-v3',
      language: 'es',
    });

    return transcription.text;
  } catch (error: any) {
    console.error('Groq Transcription Error:', error.message);
    throw new Error(`Failed to transcribe audio: ${error.message}`);
  }
}

export async function generateSpeech(text: string): Promise<Buffer> {
  console.log('--- Generating speech with ElevenLabs ---');
  const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'b2htR0pMe28pYwCY9gnP';

  if (!ELEVEN_API_KEY) {
    throw new Error('Missing ELEVENLABS_API_KEY');
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVEN_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    return Buffer.from(response.data);
  } catch (error: any) {
    console.error('ElevenLabs Error:', error.response?.data || error.message);
    throw new Error(`Failed to generate speech: ${error.message}`);
  }
}

export async function rankYouTubeResults(
  intent: string,
  results: Array<{ title: string; description: string; channelTitle: string }>,
  type: 'music' | 'podcast' | 'lesson'
): Promise<number> {
  const prompt = `Actúa como un selector experto de contenido educativo y musical.
  El usuario quiere: "${intent}"
  Tipo de contenido buscado: ${type}
  
  Analiza estos 5 resultados de YouTube y elige el índice (0-4) del que mejor se adapte.
  Criterios:
  - Si es 'lesson', prioriza canales educativos y títulos que indiquen enseñanza.
  - Si es 'podcast', busca videos largos (no shorts) y canales de podcasts reales.
  - Si es 'music', busca el video oficial o audio de alta calidad.
  
  RESULTADOS:
  ${results.map((r, i) => `${i}: Título: ${r.title} | Canal: ${r.channelTitle} | Desc: ${r.description.substring(0, 100)}`).join('\n')}
  
  Responde ÚNICAMENTE con el número del índice (ej: 0). No des explicaciones.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant', // Usamos un modelo rápido para esto
      temperature: 0,
      max_tokens: 10,
    });

    const index = parseInt(completion.choices[0]?.message?.content || '0');
    return isNaN(index) ? 0 : index;
  } catch (error) {
    console.error('Ranking Error:', error);
    return 0;
  }
}
