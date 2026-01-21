
import { GoogleGenAI } from "@google/genai";
import { Message, UserProgress, GroundingSource } from "../types";

const getSystemInstruction = (progress: UserProgress) => `
Сен — "MathAI Mentor", Қазақстан мектептерінде 5-11 сынып оқушыларына математика пәнінен сабақ беретін кәсіби мұғалімсің. 
Сен әрқашан ТЕК ҚАЗАҚ ТІЛІНДЕ жауап бересің.

ҚАТАҢ ТАЛАПТАР:
1. НАҚТЫЛЫҚ: Есепті шығарғанда "..." немесе "(...)" деп қалдырып кетпе. Барлық аралық есептеулерді толық жаз.
2. ФОРМУЛАЛАР (LaTeX): Барлық математикалық өрнектерді LaTeX форматында жаз.
   - Бөлшектерді: $$\\frac{1}{2}$$ немесе $\\frac{a}{b}$
   - Дәрежелерді: $x^2$
   - Түбірлерді: $\\sqrt{x}$
   - Тригонометрияны: $\\sin(30^\\circ)$
   Мәтін ішіндегі формулаларды бір '$' белгісімен, ал жеке жолдағы күрделі формулаларды екі '$$' белгісімен қорша.
   Мысалы: "Жауабы: $x = 5$." немесе
   $$ x = \\frac{-b \\pm \\sqrt{D}}{2a} $$
3. КОДҚА ТЫЙЫМ: Ешқандай бағдарламалау кодын көрсетпе. 
4. Визуалды көмек: Геометриялық фигураларды, сызбаларды, кестелерді жиі қолдан. Сызбаларды ASCII art арқылы көрсет.
5. Қадамдық нұсқау: Әрқашан "1-қадам:", "2-қадам:" деп нөмірленген тізімді қолдан.

КЕЛЕСІ ҚАДАМ:
- Есепті толық шешіп берген соң, оқушыға бекіту үшін ұқсас тапсырма бер.

Оқушы деңгейі: ${progress.level}-деңгей. 
`;

export const sendMessageToGemini = async (
  messages: Message[],
  currentSubject: string,
  progress: UserProgress,
  fileAttachment?: { data: string; mimeType: string }
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const history = messages.slice(0, -1).map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  const lastUserMessage = messages[messages.length - 1];
  const userParts: any[] = [{ text: lastUserMessage.content }];

  if (fileAttachment) {
    userParts.push({
      inlineData: {
        mimeType: fileAttachment.mimeType,
        data: fileAttachment.data.split(',')[1] || fileAttachment.data
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: userParts }
      ],
      config: {
        systemInstruction: getSystemInstruction(progress),
        temperature: 0.65,
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || '';
    const sources: GroundingSource[] = (response.candidates?.[0]?.groundingMetadata?.groundingChunks || [])
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Дереккөз',
        uri: chunk.web.uri
      }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return { text: "Ойбу, есеп қиын боп кетті ме? 🔄 Байланыс үзілді. Қайта жазып көрші, достым!", sources: [] };
  }
};
