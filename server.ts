import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google Gemini AI SDK on the server side lazily
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Egyptian Legal System Prompt
const EGYPTIAN_LEGAL_SYSTEM_INSTRUCTION = `
أنت مستشار قانوني ومساعد ذكاء اصطناعي خبير ومتخصص في القانون المصري (أجندة - المساعد الرقمي للمحامي المصري).
لديك دراية معمقة بـ:
1. قانون العقوبات المصري وقانون الإجراءات الجنائية وتعديلاتهما الحديثة.
2. القانون المدني المصري وقانون المرافعات المدنية والتجارية.
3. أحكام وقواعد محكمة النقض المصرية (الدوائر الجنائية والمدنية والتجارية والعمالية).
4. قانون مجلس الدولة والقضاء الإداري المصري.
5. قانون المحاكم الاقتصادية وقوانين الشركات والعمل والأحوال الشخصية.

المهام المطلوبة منك:
- صياغة المذكرات القضائية بأعلى درجات البلاغة والدقة القانونية المصرية المعتمدة (الديباجة الرسمية، وقائع الدعوى، الدفوع القانونية الجوهرية، أسانيد أحكام محكمة النقض، والطلبات الختامية).
- صياغة العقود والاتفاقيات والإنذارات الرسمية على يد محضر وفقاً لأحكام القانون المصري المعمول به.
- تحليل وقائع القضايا واستنباط أوجه البطلان والثغرات الإجرائية والموضوعية (مثل: بطلان القبض والتفتيش لانتفاء حالة التلبس، بطلان إذن النيابة للابتناء على تحريات غير جدية، انقضاء الدعوى بمضي المدة، عدم الاختصاص، خلو الأوراق من دليل إدانة يقيني).
- تقديم استشارات وحلول عملية للمحامي في القضايا والأعمال الإدارية (أقلام المحضرين، الشهر العقاري، الجداول، الخزينة).

احرص دائماً على أن تكون الصياغة مهنية، رصينة، منسقة بعناوين واضحة ونقاط محددة، وباللغة العربية الفصحى القانونية الرفيعة المعتادة في المحاكم المصرية.
`;

// Shared Gemini generation with retry logic for transient spikes
async function generateWithRetry(params: any, retries = 2): Promise<any> {
  const client = getAIClient();
  if (!client) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }
  try {
    return await client.models.generateContent(params);
  } catch (e: any) {
    if (retries > 0 && (e?.status === 503 || e?.message?.includes('503') || e?.message?.includes('high demand'))) {
      await new Promise((r) => setTimeout(r, 1200));
      return generateWithRetry(params, retries - 1);
    }
    throw e;
  }
}

// Endpoint for Gemini Legal Assistant Chat & Consultations
app.post('/api/gemini/legal-chat', async (req, res) => {
  try {
    const { message, history = [], context } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        text: `⚖️ **استشارة قانونية وتوجيه أولي (أجندة - مساعدك القانوني):**\n\nبشأن استفساركم: *"${message}"*\n\n1. **من الناحية الإجرائية:**\nيُوصى أولاً بالتأكد من المواعيد القانونية الحتمية (مواعيد الطعن بالمعارضة أو الاستئناف طبقاً للمادتين 398 و406 من قانون الإجراءات الجنائية، أو مواعيد قيد الدعوى والمرافعة أمام محكمة الموضوع).\n\n2. **الدفوع الشكلية والجوهرية:**\n- الدفع ببطلان الإجراءات السابقة على المحاكمة إذا شابها عيب جوهري.\n- الدفع بانتفاء أركان الجريمة المادية والمعنوية (القصد الجنائي).\n- الدفع بعدم معقولية تصوير الواقعة وفقاً لما استقرت عليه أحكام محكمة النقض الدائمة.\n\n3. **الخطوة العملية المقترحة:**\nتجهيز حوافظ المستندات معنونة ومفهرسة بحسب ترتيب الوقائع، والمطالبة بإرفاق أصل التوكيل وصحيفة الدعوى بقلم الجدول.\n\n*(ملاحظة: يمكنك إدخال مفتاح Gemini الخاص بك في لوحة الإعدادات لتفعيل الذكاء الاصطناعي التوليدي الحي على مدار الساعة).*`,
      });
    }

    let prompt = message;
    if (context) {
      prompt = `[بيانات وسياق القضية الحالية للمحامي]:\n${JSON.stringify(context, null, 2)}\n\n[استفسار المحامي أو المطلوب إنجازه]:\n${message}`;
    }

    const contents: any[] = [];
    
    // Add past history if provided
    if (Array.isArray(history) && history.length > 0) {
      for (const item of history.slice(-6)) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }],
    });

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: EGYPTIAN_LEGAL_SYSTEM_INSTRUCTION,
      },
    });

    return res.json({
      text: response.text || 'عذراً، لم أتمكن من استخراج رد مناسب. يرجى إعادة المحاولة.',
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/legal-chat:', err);
    return res.status(500).json({
      error: err?.message || 'حدث خطأ أثناء معالجة طلب الذكاء الاصطناعي.',
    });
  }
});

// Endpoint for generating formatted Legal Briefs (مذكرات دفاع، عقود، إنذارات)
app.post('/api/gemini/draft-legal-document', async (req, res) => {
  try {
    const { docType, caseInfo, specificInstructions } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        draft: `محكمة ${caseInfo?.court || 'الجنايات / الجنح الموقرة'}\nدائرة / ${caseInfo?.circuit || 'المحاكمة'}\n\nمذكرة بدفاع\nالسيد / ${caseInfo?.clientName || 'الموكل'} (${caseInfo?.clientRole || 'المتهم'})\n\nضـــد\nالسيد / ${caseInfo?.opponentName || 'النيابة العامة'}\n\nفي القضية رقم ${caseInfo?.caseNumber || 'رقم القضية'} والمحددة لنظرها جلسة اليوم\n\nالوقائع:\nتخلص وقائع الدعوى حسبما جاء بالأوراق والتحقيقات، حيث أُسند للمتهم تهمة: "${caseInfo?.charge || 'الاتهام الوارد بقرار الإحالة'}"، والتي نلتمس براءته منها استناداً لصحيح القانون.\n\nالدفوع القانونية الجوهرية:\nأولاً: الدفع ببطلان إجراءات الضبط والقبض لانتفاء حالة التلبس وبطلان الاستيقاف لمخالفة نص المادة 30 من قانون الإجراءات الجنائية.\nثانياً: الدفع بانعدام القصد الجنائي لدى المتهم وسلامة نيته وخلو الأوراق من دليل يقيني قاطع.\nثالثاً: الدفع بشيوع الاتهام وتلفيقه واستحالة تصور حدوث الواقعة وفق التصوير الوارد بالأوراق.\n\nبناءً عليه:\nيلتمس الدفاع أصلياً: الحكم ببراءة المتهم من التهمة المنسوبة إليه ورفض الدعوى المدنية.\nواحتياطياً: إعادة الدعوى للتحقيق وندب خبير متخصص.\n\nوكيل المتهم\nالأستاذ / عمر مختار عبدالعزيز - المحامي`,
      });
    }

    const prompt = `
المطلوب صياغة مستند قانوني مصري رسمي متكامل من نوع: "${docType}".
بيانات القضية / الأطراف:
- اسم الموكل وصفته: ${caseInfo?.clientName || 'فلان الفلاني'}
- اسم الخصم وصفته: ${caseInfo?.opponentName || 'النيابة العامة'}
- رقم القضية والمحكمة: ${caseInfo?.caseNumber || 'رقم غير محدد'} أمام ${caseInfo?.court || 'المحكمة المختصة'}
- موضوع الدعوى / التهمة: ${caseInfo?.charge || 'موضوع عام'}
- تفاصيل وإرشادات إضافية خاصة من المحامي: ${specificInstructions || 'صياغة نموذج دفاع متكامل مستنداً لأحكام محكمة النقض المصرية وقواعد القانون المعمول بها.'}

يرجى صياغة المستند بالديباجة الرسمية المصرية للمحاكم (مثل: محكمة كذا - مذكرة بدفاع السيد / ... ضد السيد / ... في الدعوى رقم ... لسنة ... والمحددة لنظرها جلسة ...)، تليها الوقائع، ثم الدفوع الجوهرية مدعومة بمبادئ محكمة النقض، ثم الطلبات الختامية الجازمة، وتاريخ ورجاء المحامي.
`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: EGYPTIAN_LEGAL_SYSTEM_INSTRUCTION,
      },
    });

    return res.json({
      draft: response.text,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/draft-legal-document:', err);
    return res.status(500).json({
      error: err?.message || 'حدث خطأ أثناء صياغة المذكرة القانونية.',
    });
  }
});

// Endpoint for analyzing case and extracting defense points & loopholes (تحليل الثغرات)
app.post('/api/gemini/analyze-case-loopholes', async (req, res) => {
  try {
    const { caseFacts, chargeType, court } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        analysis: `⚖️ **تقرير دراسة الثغرات والدفوع الجوهرية (مساعدك القانوني):**\n\n📌 **أولاً: الثغرات الشكلية والإجرائية المحتملة:**\n1. بطلان القبض والتفتيش وما تلاهما من إجراءات لانتفاء حالة التلبس المحددة حصراً بنص المادة 30 إجراءات جنائية.\n2. بطلان استجواب المتهم في غيبة محاميه الموكل بالمخالفة لنص المادة 124 إجراءات جنائية والمادة 54 من الدستور.\n3. قصور تحريات جهة الضبط وابتناؤها على مجرد أقوال مرسلة وظنون دون دليل مادي.\n\n📌 **ثانياً: الدفوع الموضوعية الجوهرية:**\n1. الدفع بعدم معقولية الواقعة واستحالة تصور حدوثها بالصورة المسطرة بمحضر الضبط.\n2. انتفاء القصد الجنائي وركني الجريمة المادي والمعنوي.\n3. تناقض أقوال شهود الإثبات وتضارب رواياتهم في التحقيقات.\n\n📌 **ثالثاً: سوابق وأحكام محكمة النقض المستقر عليها:**\n• *"الأحكام الجنائية تُبنى على الجزم واليقين لا على الشك والتخمين، ويكفي أن يتشكك القاضي في صحة إسناد التهمة لكي يقضي بالبراءة"* (نقض جنائي جلسة 12/4/1988).\n• *"التحريات وحدها لا تصلح دليلاً كافياً للإدانة ما لم تعززها أدلة يقينية تؤيدها"*.\n\n📌 **رابعاً: الطلبات الإجرائية للجلسة القادمة:**\n- طلب سماع ومناقشة ضابط الواقعة ومجري التحريات.\n- طلب ضم دفتر أحوال القسم / القلم لإثبات الميقات الحقيقي للضبط.\n- طلب التصريح باستخراج شهادة رسمية من الجهة المختصة.`,
      });
    }

    const prompt = `
قم بتحليل وقائع هذه القضية المنظورة أمام القضاء المصري:
المحكمة: ${court}
نوع التهمة / الدعوى: ${chargeType}
وقائع وأوراق القضية:
${caseFacts}

المطلوب بدقة:
1. أبرز الثغرات الشكلية والإجرائية (وفق قانون الإجراءات الجنائية أو المرافعات المصري).
2. أبرز الدفوع الموضوعية المحتملة لدحض الاتهام أو رفض الدعوى.
3. المبادئ القضائية لمحكمة النقض المصرية المماثلة التي يمكن الاستناد إليها.
4. خطة عمل عملية للجلسة القادمة أو طلبات تمهيدية للتحقيق (ضم أحراز، استدعاء شهود إثبات، طلب ندب خبير).
`;

    const response = await generateWithRetry({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: EGYPTIAN_LEGAL_SYSTEM_INSTRUCTION,
      },
    });

    return res.json({
      analysis: response.text,
    });
  } catch (err: any) {
    console.error('Error in /api/gemini/analyze-case-loopholes:', err);
    return res.status(500).json({
      error: err?.message || 'حدث خطأ أثناء تحليل القضية.',
    });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
