import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/lib/mongodb";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import { getExpectedTAT, checkPincodeServiceability } from "@/lib/delhivery";

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
    console.error('[Chatbot] GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request) {
    try {
        // Check if API key is set
        if (!process.env.GEMINI_API_KEY) {
            console.error('[Chatbot] Missing GEMINI_API_KEY - cannot initialize AI');
            return NextResponse.json({ 
                error: "AI service is not configured. Please contact support." 
            }, { status: 503 });
        }

        const { message, conversationHistory, language = 'english' } = await request.json();

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        // Language-specific instructions
        const languageInstructions = {
            english: "Respond in English naturally.",
            hindi: "पूरी तरह से हिंदी में जवाब दें। अंग्रेजी शब्दों का इस्तेमाल बिल्कुल न करें। सभी technical terms को भी हिंदी में लिखें (जैसे: shipping = डिलीवरी, order = ऑर्डर, product = उत्पाद, payment = भुगतान, etc.)",
            malayalam: "പൂർണ്ണമായും മലയാളത്തിൽ മറുപടി നൽകുക. ഇംഗ്ലീഷ് വാക്കുകൾ ഉപയോഗിക്കരുത്. എല്ലാ technical terms ഉം മലയാളത്തിൽ എഴുതുക (ഉദാഹരണം: shipping = ഡെലിവറി, order = ഓർഡർ, product = സാധനം, payment = പണമടയ്ക്കൽ, etc.)"
        };

        const languageInstruction = languageInstructions[language] || languageInstructions.english;

        try {
            // Fetch products and store info for context
            await dbConnect();
            const products = await Product.find({ inStock: true })
                .select('_id name description price mrp category inStock fastDelivery')
                .limit(50)
                .lean();

            // Fetch active coupons
            const coupons = await Coupon.find({
                isActive: true,
                expiresAt: { $gte: new Date() }
            })
                .select('code discountValue discountType description minOrderValue forNewUser forMember')
                .lean();

            // Build context for AI
            const systemContext = `You're chatting for Quickfynd store. Act like a real person who works here and genuinely wants to help. Don't sound like an AI assistant - talk like you're texting a friend who asked for shopping advice.

**LANGUAGE: ${languageInstruction}**

**CRITICAL - Sound Human:**
- Talk naturally like you're having a real conversation, not giving automated responses
- Don't use corporate speak, bullet points, or overly structured answers
- Vary your responses - sometimes short, sometimes longer, but always natural
- Use casual phrases based on the language
- Show personality - be excited, sympathetic, casual, funny when appropriate
- Don't always be perfectly helpful - sometimes ask back, joke around, or chat casually
- Mix up your greeting style - don't start every message the same way
- Use emojis naturally (but not in every sentence)
- Sometimes use lowercase, sometimes not - be human about it
- Don't end every message with a question - let conversation flow naturally
- Remember the conversation context - if they answered a question, acknowledge it naturally

**STORE INFORMATION:**
Store Name: QuickFynd
Description: Your one-stop online shop for everything you need - electronics, fashion, home essentials, beauty products, and more!

**SHIPPING & DELIVERY POLICY:**
- FREE shipping on orders above ₹499
- Standard delivery: 3-7 business days (most areas)
- Metro cities (Mumbai, Delhi, Bangalore, Chennai, Hyderabad, Kolkata): 2-4 days
- Kerala, Tamil Nadu, Karnataka, Maharashtra: 3-5 days typically
- Other states: 4-7 days usually
- Remote/rural areas: 7-10 days
- Fast delivery available on select products (⚡ marked): 2-3 days
- We deliver 7 days a week including weekends (might take 1 extra day on weekends)
- Shipping partner: Delhivery (reliable tracking available)
- Delivery address can be changed within 1 hour of placing order
- Multiple shipping addresses can be saved in account
- Real-time tracking available from order dashboard

**RETURN & REFUND POLICY:**
- 7 days return/exchange period from delivery date
- Easy return process: Go to "My Orders" → Select item → Click "Return"
- Free return pickup arranged
- Items must be unopened in original packaging
- Refunds processed within 5-7 business days after inspection
- Refund to original payment method or store wallet
- Some items like perishables, intimate wear, opened electronics may have restrictions
- Damaged/defective items: Full refund + free return shipping
- Wrong item delivered: Immediate replacement + full refund option

**PAYMENT OPTIONS:**
- Credit/Debit Cards (Visa, Mastercard, RuPay, Amex)
- UPI (Google Pay, PhonePe, Paytm, BHIM)
- Net Banking (all major banks)
- Digital Wallets (Paytm, PhonePe, Amazon Pay)
- Cash on Delivery (COD) - available for most orders
- COD limit: Up to ₹50,000 per order
- EMI options available on orders above ₹3,000
- Payment security: SSL encrypted, PCI-DSS compliant
- No extra charges on online payments
- COD: Small handling fee may apply (mentioned at checkout)

**ACCOUNT & ORDERING:**
- Can browse without account
- Account needed for: Checkout, tracking orders, wishlist
- Quick signup with email or Google
- Guest checkout available
- Password reset via email link
- Wishlist: Save unlimited items with heart icon
- Cart items saved for 30 days
- Multiple delivery addresses can be stored
- Order history and invoices available in dashboard
- Track all orders in real-time

**CANCELLATION POLICY:**
- Orders can be cancelled before shipping (usually within 2-4 hours)
- After shipping: Cannot cancel, but can return after delivery
- Cancellation: Go to "My Orders" → "Cancel Order"
- Refund for cancelled orders: 3-5 business days

**PRIVACY & SECURITY:**
- Data protected with industry-standard SSL encryption
- Payment info never stored on our servers
- Personal data not shared with third parties
- Account deletion available in Settings (data deleted in 30 days)
- Email notifications can be managed in preferences

**PRODUCT CATEGORIES:**
Available: Electronics, Fashion (Men/Women/Kids), Home & Kitchen, Beauty & Personal Care, Sports & Fitness, Books & Stationery, Toys & Games, Groceries, Health & Wellness

**CUSTOMER SUPPORT:**
- Chat support (this chatbot - available 24/7)
- Email support: via contact form
- Help Center: /help page with detailed FAQs
- Ticket system: /support page for specific issues
- Response time: Within 24 hours (usually much faster)

**CURRENT INVENTORY (${products.length} products in stock):**
${products.slice(0, 30).map(p => `${p.name} - ₹${p.price}${p.mrp > p.price ? ` (was ₹${p.mrp})` : ''} - ${p.category}${p.fastDelivery ? ' ⚡ Fast Delivery' : ''}`).join('\n')}

**ACTIVE DISCOUNTS & COUPONS:**
${coupons.length > 0 ? coupons.slice(0, 10).map(c => 
    `${c.code}: ${c.discountType === 'percentage' ? c.discountValue + '%' : '₹' + c.discountValue} off${c.minOrderValue ? ' (min order ₹' + c.minOrderValue + ')' : ''}${c.forNewUser ? ' [New Customers Only]' : ''}${c.forMember ? ' [Members Only]' : ''} - ${c.description || 'Limited time offer'}`
).join('\n') : 'No active discount codes right now, but check back soon! We frequently run sales and promotions.'}

**COMMON CUSTOMER QUESTIONS:**

Q: How do I track my order?
A: Go to "My Orders" in your account dashboard or use the tracking link in your order confirmation email. Real-time updates available.

Q: Can I change my delivery address?
A: Yes, but only within 1 hour of placing the order. After that, contact support and we'll try our best.

Q: What if my item is damaged/defective?
A: Contact us immediately! We'll arrange free return pickup and either send a replacement or process full refund within 24-48 hours.

Q: Do you charge shipping?
A: Free shipping on orders ₹499 and above. Below that, nominal shipping charges apply (shown at checkout).

Q: How do I apply a coupon?
A: During checkout, click "Apply Coupon", enter the code, and discount will be applied automatically if valid.

Q: Can I order without creating an account?
A: Yes! Guest checkout is available. But creating an account helps you track orders and save addresses for future purchases.

Q: Is COD available?
A: Yes, Cash on Delivery is available for most orders (up to ₹50,000). Small handling fee may apply.

Q: What if I want to exchange an item?
A: Initiate a return, and once we receive the item, you can place a new order for the item you want. We're working on direct exchange feature!

Q: How long do refunds take?
A: 5-7 business days after we receive and inspect the returned item. Refund goes to your original payment method.

Q: Can I cancel my order?
A: Yes, if it hasn't shipped yet (usually 2-4 hours window). Go to "My Orders" and click "Cancel".

IMPORTANT: Use ALL this information to answer customer questions accurately. If they ask about policies, delivery, returns, payments, etc. - give them specific, accurate details from above. Be helpful and informative while staying conversational and natural in ${language}.`;

            // Build conversation history for context
            const conversationContext = conversationHistory && conversationHistory.length > 0
                ? conversationHistory.map(msg => `${msg.role === 'user' ? 'Customer' : 'You'}: ${msg.content}`).join('\n')
                : '';

            const fullPrompt = conversationContext 
                ? `${systemContext}\n\n**Current Conversation:**\n${conversationContext}\n\n[Respond to the customer's last message naturally, remembering everything said before]`
                : `${systemContext}\n\nCustomer: ${message}\n\n[Respond naturally]`;

            console.log('[Chatbot] Sending request to Gemini AI...');

            // Generate AI response
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(fullPrompt);
            const response = await result.response;
            const aiMessage = response.text();

            console.log('[Chatbot] Response generated successfully');

            return NextResponse.json({
                message: aiMessage,
                timestamp: new Date().toISOString()
            });

        } catch (apiError) {
            console.error('[Chatbot] Gemini API Error:', apiError.message);
            
            // Check if it's a quota/rate limit error
            if (apiError.message?.includes('429') || apiError.message?.includes('quota') || apiError.status === 429) {
                console.log('[Chatbot] API quota exceeded, using fallback mode');
                
                // Fallback: Return helpful response without AI
                const fallbackResponses = {
                    english: {
                        'product': "hey! yeah we've got loads of stuff - electronics, fashion, home essentials, beauty products, and more. what are you looking for specifically?",
                        'price': "prices vary depending on what you're looking for. got a specific product in mind? I can help you find it and check the price",
                        'shipping': "shipping's free on orders over ₹499! delivery usually takes 3-7 days depending on where you are. metro cities get it in 2-4 days. where should we deliver?",
                        'order': "you can track your order from 'My Orders' in your dashboard. wanna know something specific about your order?",
                        'return': "easy returns! you've got 7 days from delivery to return or exchange. just go to 'My Orders', select the item, click 'Return' and we'll arrange free pickup. refunds take 5-7 days after we get the item back",
                        'payment': "we accept everything - COD, cards, UPI, net banking, wallets. whatever's easiest for you! all payments are secure and encrypted 💳",
                        'coupon': "check the offers section for active discount codes! apply them at checkout for instant discounts. what are you planning to buy?",
                        'account': "having trouble logging in? or need help with your account settings? you can also do guest checkout if you prefer. what's the issue?",
                        'cancel': "you can cancel orders before they ship (usually 2-4 hours window). go to 'My Orders' and click 'Cancel'. refund takes 3-5 days",
                        'policy': "we have 7-day returns, free shipping over ₹499, secure payments, and 24/7 support. what specific policy do you want to know about?",
                        'greeting': "hey! what's up? 😊",
                        'thanks': "no worries! anything else I can help with?",
                        'default': "hey! I'm here to help. what do you need?"
                    },
                    hindi: {
                        'product': "हां जी! हमारे पास इलेक्ट्रॉनिक्स, फैशन, घर का सामान, ब्यूटी प्रोडक्ट्स सब कुछ है। क्या ढूंढ रहे हो?",
                        'price': "कीमत प्रोडक्ट पर निर्भर करती है। कौन सा प्रोडक्ट देखना है? मैं बता सकता हूं",
                        'shipping': "₹499 से ऊपर के ऑर्डर पर डिलीवरी फ्री है! डिलीवरी में 3-7 दिन लगते हैं, मेट्रो शहरों में 2-4 दिन। कहां डिलीवरी चाहिए?",
                        'order': "अपना ऑर्डर 'माई ऑर्डर्स' में जाकर ट्रैक कर सकते हो। कुछ खास जानना है?",
                        'return': "रिटर्न बहुत आसान है! डिलीवरी के 7 दिन के अंदर वापस या बदल सकते हो। 'माई ऑर्डर्स' में जाओ, आइटम चुनो, 'रिटर्न' पे क्लिक करो, हम फ्री पिकअप करेंगे। पैसे 5-7 दिन में वापस मिलेंगे",
                        'payment': "सब तरह का पेमेंट लेते हैं - कैश ऑन डिलीवरी, कार्ड, यूपीआई, नेट बैंकिंग, वॉलेट। जो आसान लगे! पूरी तरह सुरक्षित है 💳",
                        'coupon': "ऑफर सेक्शन में डिस्काउंट कोड देखो! चेकआउट पर लगाने से तुरंत छूट मिल जाएगी। क्या खरीदने का सोच रहे हो?",
                        'account': "लॉगिन में दिक्कत है? या अकाउंट सेटिंग्स में मदद चाहिए? बिना अकाउंट के भी गेस्ट चेकआउट कर सकते हो। क्या प्रॉब्लम है?",
                        'cancel': "शिपिंग से पहले ऑर्डर कैंसल हो जाएगा (2-4 घंटे का टाइम है)। 'माई ऑर्डर्स' में जाकर 'कैंसल' पे क्लिक करो। पैसे 3-5 दिन में वापस आएंगे",
                        'policy': "हमारी 7 दिन रिटर्न पॉलिसी है, ₹499 के ऊपर फ्री शिपिंग, सुरक्षित पेमेंट, 24/7 सपोर्ट। किस पॉलिसी के बारे में जानना है?",
                        'greeting': "नमस्ते! कैसे हो? 😊",
                        'thanks': "कोई बात नहीं! और कुछ चाहिए?",
                        'default': "हां बोलो! कैसे मदद कर सकता हूं?"
                    },
                    malayalam: {
                        'product': "ഉണ്ട്! ഞങ്ങൾക്ക് ഇലക്ട്രോണിക്സ്, ഫാഷൻ, വീട്ടുപകരണങ്ങൾ, സൗന്ദര്യവർദ്ധക ഉൽപ്പന്നങ്ങൾ എല്ലാം ഉണ്ട്. എന്താണ് തിരയുന്നത്?",
                        'price': "വില ഉൽപ്പന്നം അനുസരിച്ചിരിക്കും. ഏത് ഉൽപ്പന്നമാണ് നോക്കേണ്ടത്? ഞാൻ സഹായിക്കാം",
                        'shipping': "₹499 മുകളിലുള്ള ഓർഡറുകൾക്ക് സൗജന്യ ഡെലിവറി! സാധാരണ 3-7 ദിവസം എടുക്കും, മെട്രോ നഗരങ്ങളിൽ 2-4 ദിവസം. എവിടെയാണ് ഡെലിവറി വേണ്ടത്?",
                        'order': "'മൈ ഓർഡേഴ്സ്' എന്നതിൽ നിന്ന് നിങ്ങളുടെ ഓർഡർ ട്രാക്ക് ചെയ്യാം. എന്തെങ്കിലും പ്രത്യേകമായി അറിയണോ?",
                        'return': "എളുപ്പത്തിൽ തിരികെ നൽകാം! ഡെലിവറി കഴിഞ്ഞ് 7 ദിവസത്തിനുള്ളിൽ തിരികെ നൽകാനോ മാറ്റാനോ കഴിയും. 'മൈ ഓർഡേഴ്സ്' പോയി ഐറ്റം തിരഞ്ഞെടുക്കുക, 'റിട്ടേൺ' ക്ലിക്ക് ചെയ്യുക, ഞങ്ങൾ സൗജന്യ പിക്കപ്പ് ക്രമീകരിക്കും. തിരികെ കിട്ടാൻ 5-7 ദിവസം എടുക്കും",
                        'payment': "എല്ലാ പേയ്മെന്റ് രീതികളും സ്വീകരിക്കുന്നു - കാഷ് ഓൺ ഡെലിവറി, കാർഡ്, യുപിഐ, നെറ്റ് ബാങ്കിംഗ്, വാലറ്റ്. ഏതും എളുപ്പമുള്ളത്! പൂർണ്ണമായും സുരക്ഷിതമാണ് 💳",
                        'coupon': "ഓഫർ വിഭാഗത്തിൽ ഡിസ്കൗണ്ട് കോഡുകൾ നോക്കൂ! ചെക്ക്ഔട്ടിൽ ഉപയോഗിച്ച് തൽക്ഷണം കിഴിവ് നേടൂ. എന്താണ് വാങ്ങാൻ പ്ലാൻ ചെയ്യുന്നത്?",
                        'account': "ലോഗിൻ ചെയ്യാൻ പ്രശ്നമുണ്ടോ? അല്ലെങ്കിൽ അക്കൗണ്ട് ക്രമീകരണങ്ങളിൽ സഹായം വേണോ? അക്കൗണ്ട് ഇല്ലാതെ ഗസ്റ്റ് ചെക്ക്ഔട്ട് ചെയ്യാനും കഴിയും. എന്താണ് പ്രശ്നം?",
                        'cancel': "ഷിപ്പിംഗിനു മുമ്പ് ഓർഡർ റദ്ദാക്കാം (സാധാരണ 2-4 മണിക്കൂർ സമയം). 'മൈ ഓർഡേഴ്സ്' പോയി 'കാൻസൽ' ക്ലിക്ക് ചെയ്യുക. പണം 3-5 ദിവസത്തിനുള്ളിൽ തിരികെ കിട്ടും",
                        'policy': "7 ദിവസത്തെ റിട്ടേൺ പോളിസി, ₹499 മുകളിൽ സൗജന്യ ഷിപ്പിംഗ്, സുരക്ഷിതമായ പേയ്മെന്റ്, 24/7 പിന്തുണ. ഏത് പോളിസിയെക്കുറിച്ച് അറിയണം?",
                        'greeting': "ഹായ്! എങ്ങനെയുണ്ട്? 😊",
                        'thanks': "സ്വാഗതം! മറ്റെന്തെങ്കിലും വേണോ?",
                        'default': "ഹായ്! ഞാൻ സഹായിക്കാം. എന്താണ് വേണ്ടത്?"
                    }
                };

                const langResponses = fallbackResponses[language] || fallbackResponses.english;

                // Match user question to fallback response
                const msgLower = message.toLowerCase();
                let response = langResponses.default;
                
                if (msgLower.match(/\b(hi|hello|hey|hii|helo|yo)\b/)) response = langResponses.greeting;
                else if (msgLower.match(/\b(thank|thanks|thx|ty|appreciate)\b/)) response = langResponses.thanks;
                else if (msgLower.includes('product') || msgLower.includes('item') || msgLower.includes('find') || msgLower.includes('buy') || msgLower.includes('search')) response = langResponses.product;
                else if (msgLower.includes('price') || msgLower.includes('cost') || msgLower.includes('cheap') || msgLower.includes('expensive') || msgLower.includes('rupee')) response = langResponses.price;
                else if (msgLower.includes('ship') || msgLower.includes('delivery') || msgLower.includes('deliver') || msgLower.includes('address')) response = langResponses.shipping;
                else if (msgLower.includes('cancel') || msgLower.includes('cancellation')) response = langResponses.cancel;
                else if (msgLower.includes('order') || msgLower.includes('track') || msgLower.includes('status')) response = langResponses.order;
                else if (msgLower.includes('return') || msgLower.includes('replace') || msgLower.includes('refund') || msgLower.includes('exchange')) response = langResponses.return;
                else if (msgLower.includes('payment') || msgLower.includes('pay') || msgLower.includes('card') || msgLower.includes('wallet') || msgLower.includes('cod')) response = langResponses.payment;
                else if (msgLower.includes('coupon') || msgLower.includes('code') || msgLower.includes('discount') || msgLower.includes('offer') || msgLower.includes('deal')) response = langResponses.coupon;
                else if (msgLower.includes('policy') || msgLower.includes('policies') || msgLower.includes('terms') || msgLower.includes('conditions')) response = langResponses.policy;
                else if (msgLower.includes('account') || msgLower.includes('login') || msgLower.includes('profile') || msgLower.includes('password') || msgLower.includes('sign')) response = langResponses.account;

                return NextResponse.json({
                    message: response,
                    timestamp: new Date().toISOString(),
                    isFallback: true
                });
            }

            // Re-throw other errors
            throw apiError;
        }

    } catch (error) {
        console.error('[Chatbot] Error details:', {
            message: error.message,
            code: error.code,
            status: error.status,
            stack: error.stack?.split('\n')[0]
        });

        // Handle specific Gemini errors
        if (error.message?.includes('API key not valid')) {
            return NextResponse.json({ 
                error: "Invalid API key configuration. Please contact support." 
            }, { status: 500 });
        }

        if (error.message?.includes('Invalid request')) {
            return NextResponse.json({ 
                error: "Request format error. Please try again with a simpler message." 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            error: error.message || "Failed to process your message. Please try again." 
        }, { status: 500 });
    }
}
