/* Static copy and catalogues.
   Nothing in this file is a live price, a real vacancy, or a statistic. */

export const STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT – Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos",
  "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto",
  "Taraba", "Yobe", "Zamfara", "Outside Nigeria"
];

export const BUDGET_CATEGORIES = [
  "Food", "Rent", "Transport", "Fuel & generator", "Light (prepaid)",
  "Airtime & data", "School & family", "Health", "Giving", "Savings", "Other"
];

export const EXPENSE_CATEGORIES = [
  "Stock", "Transport", "Nylon & packaging", "Airtime & data", "Rent",
  "Fuel", "Helpers", "Food", "Other"
];

export const UNITS = [
  "cup", "derica", "mudu", "paint", "kg", "piece", "tuber", "finger",
  "litre", "bottle", "tin", "crate", "carton", "loaf", "sachet"
];

export const PRICE_ITEMS = [
  "Rice", "Beans", "Garri", "Yam", "Plantain", "Eggs", "Tomato", "Pepper",
  "Onion", "Palm oil", "Vegetable oil", "Chicken", "Fish", "Spaghetti",
  "Noodles", "Groundnut", "Bread", "Milk", "Sugar", "Salt", "Seasoning",
  "Semovita", "Flour", "Meat", "Crayfish", "Okra", "Spinach", "Coconut"
];

export const TIPS = [
  { id: "beans", tag: "Food", title: "Cook beans once", body: "A bigger pot of beans, portioned for two or three days, uses less kerosene, gas or firewood than cooking a little every afternoon." },
  { id: "market", tag: "Food", title: "Write prices before you go", body: "Note the last price you paid before you reach the market. It is easier to walk away from a high price when the number is already on your phone." },
  { id: "list", tag: "Food", title: "Shop with a list", body: "A short list stops the extra sachet, the extra bottle and the thing you only noticed because it was in front of you." },
  { id: "protein", tag: "Food", title: "Let beans and eggs do more", body: "Eggs and beans are everyday proteins. Use meat as a flavour in the soup, not the whole meal, on the days money is tight." },
  { id: "garri", tag: "Food", title: "Keep a fallback meal", body: "Garri, groundnut and a piece of fruit can cover a meal when you are out. Decide that before you are hungry, so you don't buy the expensive snack." },
  { id: "transport", tag: "Transport", title: "Join trips", body: "If two errands are in the same area, do them on one outing. The second drop often costs more than people expect." },
  { id: "fuel", tag: "Fuel", title: "Fill the generator with a plan", body: "Decide the hours the generator will run before you buy fuel. Charging phones and pumping water in that window saves a second start." },
  { id: "light", tag: "Light", title: "Watch the prepaid meter", body: "Check the units at the same time each evening for a week. You will see which appliance is eating the light bill." },
  { id: "data", tag: "Data", title: "One bundle, one person", body: "Hotspot from one sensible bundle instead of everyone buying a small one that finishes at noon. Turn off video autoplay." },
  { id: "airtime", tag: "Data", title: "Save the useful numbers", body: "Store your bank's real number from the back of your card. A number that arrives inside a message is not the one to call." },
  { id: "family", tag: "Family", title: "Agree the food money", body: "If more than one person spends on food, pick one weekly amount and one person to hold the market list. Two people shopping the same items is how the budget leaks." },
  { id: "giving", tag: "Family", title: "Give what you planned", body: "Family support is real. Put a number for it in the budget so a surprise request doesn't wipe out food money." }
];

export const BREAKFASTS = [
  { id: "pap-groundnut", name: "Pap and groundnut", tags: ["pap", "groundnut"], note: "Warm pap with groundnut is a filling morning meal.", ingredients: [
    { item: "Pap (ogi)", qty: 2, unit: "cups", per: 4, group: "grains" },
    { item: "Groundnut", qty: 2, unit: "cups", per: 4, group: "protein" },
    { item: "Sugar", qty: 0.5, unit: "cup", per: 4, group: "other" }
  ]},
  { id: "bread-egg", name: "Bread and egg", tags: ["bread", "eggs"], note: "One egg can stretch across two slices.", ingredients: [
    { item: "Bread", qty: 1, unit: "loaf", per: 4, group: "grains" },
    { item: "Eggs", qty: 4, unit: "piece", per: 4, group: "protein" }
  ]},
  { id: "yam-oil", name: "Boiled yam and palm oil", tags: ["yam"], note: "Boil enough for the morning. Palm oil, pepper and onion on the side.", ingredients: [
    { item: "Yam", qty: 2, unit: "tuber", per: 4, group: "grains" },
    { item: "Palm oil", qty: 0.25, unit: "litre", per: 4, group: "oil" },
    { item: "Pepper", qty: 4, unit: "piece", per: 4, group: "vegetables" }
  ]},
  { id: "akara-pap", name: "Pap and akara", tags: ["pap", "beans"], note: "Use part of the beans you already bought for the week.", ingredients: [
    { item: "Beans", qty: 2, unit: "cups", per: 4, group: "protein" },
    { item: "Pap (ogi)", qty: 2, unit: "cups", per: 4, group: "grains" },
    { item: "Vegetable oil", qty: 0.25, unit: "litre", per: 4, group: "oil" },
    { item: "Pepper", qty: 4, unit: "piece", per: 4, group: "vegetables" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" }
  ]},
  { id: "soaked-garri", name: "Soaked garri and groundnut", tags: ["garri", "groundnut"], note: "A no-cook fallback when fuel is the problem.", ingredients: [
    { item: "Garri", qty: 4, unit: "cups", per: 4, group: "grains" },
    { item: "Groundnut", qty: 2, unit: "cups", per: 4, group: "protein" },
    { item: "Sugar", qty: 0.5, unit: "cup", per: 4, group: "other" }
  ]}
];

export const DINNERS = [
  { id: "beans-plantain", name: "Beans and plantain", tags: ["beans", "plantain"], stretch: 5, note: "Cook a full pot and keep some for the next day.", ingredients: [
    { item: "Beans", qty: 3, unit: "cups", per: 4, group: "protein" },
    { item: "Plantain", qty: 6, unit: "finger", per: 4, group: "grains" },
    { item: "Palm oil", qty: 0.2, unit: "litre", per: 4, group: "oil" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" },
    { item: "Pepper", qty: 4, unit: "piece", per: 4, group: "vegetables" },
    { item: "Seasoning", qty: 1, unit: "sachet", per: 4, group: "other" }
  ]},
  { id: "jollof-egg", name: "Jollof rice and egg", tags: ["rice", "eggs"], stretch: 4, note: "Tomato and pepper can be a small tin if fresh ones are costly.", ingredients: [
    { item: "Rice", qty: 3, unit: "cups", per: 4, group: "grains" },
    { item: "Eggs", qty: 4, unit: "piece", per: 4, group: "protein" },
    { item: "Tomato", qty: 4, unit: "piece", per: 4, group: "vegetables" },
    { item: "Pepper", qty: 3, unit: "piece", per: 4, group: "vegetables" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" },
    { item: "Vegetable oil", qty: 0.15, unit: "litre", per: 4, group: "oil" },
    { item: "Seasoning", qty: 1, unit: "sachet", per: 4, group: "other" }
  ]},
  { id: "yam-egg", name: "Yam and egg sauce", tags: ["yam", "eggs"], stretch: 4, note: "Egg sauce on yam feeds a family without buying meat.", ingredients: [
    { item: "Yam", qty: 2, unit: "tuber", per: 4, group: "grains" },
    { item: "Eggs", qty: 4, unit: "piece", per: 4, group: "protein" },
    { item: "Tomato", qty: 3, unit: "piece", per: 4, group: "vegetables" },
    { item: "Pepper", qty: 3, unit: "piece", per: 4, group: "vegetables" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" },
    { item: "Vegetable oil", qty: 0.1, unit: "litre", per: 4, group: "oil" }
  ]},
  { id: "eba-okra", name: "Eba and okra soup", tags: ["garri", "okra"], stretch: 4, note: "A little crayfish or fish goes a long way in the soup. Skip it if it is not in the budget.", ingredients: [
    { item: "Garri", qty: 4, unit: "cups", per: 4, group: "grains" },
    { item: "Okra", qty: 8, unit: "piece", per: 4, group: "vegetables" },
    { item: "Palm oil", qty: 0.2, unit: "litre", per: 4, group: "oil" },
    { item: "Pepper", qty: 4, unit: "piece", per: 4, group: "vegetables" },
    { item: "Crayfish", qty: 0.5, unit: "cup", per: 4, group: "protein" },
    { item: "Seasoning", qty: 1, unit: "sachet", per: 4, group: "other" }
  ]},
  { id: "rice-stew", name: "White rice and stew", tags: ["rice"], stretch: 3, note: "Stew kept in a clean covered bowl can serve the next day if you heat it through.", ingredients: [
    { item: "Rice", qty: 3, unit: "cups", per: 4, group: "grains" },
    { item: "Tomato", qty: 5, unit: "piece", per: 4, group: "vegetables" },
    { item: "Pepper", qty: 4, unit: "piece", per: 4, group: "vegetables" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" },
    { item: "Vegetable oil", qty: 0.15, unit: "litre", per: 4, group: "oil" }
  ]},
  { id: "yam-porridge", name: "Yam porridge", tags: ["yam"], stretch: 4, note: "One pot. Spinach or any leafy green you already have makes it fuller.", ingredients: [
    { item: "Yam", qty: 2, unit: "tuber", per: 4, group: "grains" },
    { item: "Palm oil", qty: 0.2, unit: "litre", per: 4, group: "oil" },
    { item: "Spinach", qty: 4, unit: "piece", per: 4, group: "vegetables" },
    { item: "Pepper", qty: 3, unit: "piece", per: 4, group: "vegetables" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" }
  ]},
  { id: "spaghetti-egg", name: "Spaghetti and egg", tags: ["noodles", "eggs"], stretch: 4, note: "A quick pot when time and fuel are both short.", ingredients: [
    { item: "Spaghetti", qty: 2, unit: "piece", per: 4, group: "grains" },
    { item: "Eggs", qty: 4, unit: "piece", per: 4, group: "protein" },
    { item: "Tomato", qty: 3, unit: "piece", per: 4, group: "vegetables" },
    { item: "Pepper", qty: 2, unit: "piece", per: 4, group: "vegetables" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" },
    { item: "Vegetable oil", qty: 0.1, unit: "litre", per: 4, group: "oil" }
  ]},
  { id: "beans-porridge", name: "Beans porridge", tags: ["beans"], stretch: 5, note: "The most filling pot on this list. Palm oil, pepper and onion are enough.", ingredients: [
    { item: "Beans", qty: 4, unit: "cups", per: 4, group: "protein" },
    { item: "Palm oil", qty: 0.2, unit: "litre", per: 4, group: "oil" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" },
    { item: "Pepper", qty: 4, unit: "piece", per: 4, group: "vegetables" },
    { item: "Seasoning", qty: 1, unit: "sachet", per: 4, group: "other" }
  ]},
  { id: "noodles-egg", name: "Noodles and egg", tags: ["noodles", "eggs"], stretch: 3, note: "Useful on a busy night. Add any vegetable you already have.", ingredients: [
    { item: "Noodles", qty: 4, unit: "piece", per: 4, group: "grains" },
    { item: "Eggs", qty: 4, unit: "piece", per: 4, group: "protein" },
    { item: "Spinach", qty: 2, unit: "piece", per: 4, group: "vegetables" }
  ]},
  { id: "coconut-rice", name: "Coconut rice", tags: ["rice"], stretch: 3, note: "Coconut carries the flavour so you can skip meat.", ingredients: [
    { item: "Rice", qty: 3, unit: "cups", per: 4, group: "grains" },
    { item: "Coconut", qty: 1, unit: "piece", per: 4, group: "other" },
    { item: "Pepper", qty: 3, unit: "piece", per: 4, group: "vegetables" },
    { item: "Onion", qty: 1, unit: "piece", per: 4, group: "vegetables" },
    { item: "Vegetable oil", qty: 0.1, unit: "litre", per: 4, group: "oil" }
  ]}
];

export const SCAM_TYPES = [
  {
    id: "bank",
    title: "Fake bank alerts",
    summary: "A call, SMS or WhatsApp claims to be your bank. They say your account will be blocked, a wrong transfer came in, or you must read out a code.",
    signs: [
      "They ask for your PIN, OTP, CVV, password or the full number on your card.",
      "The message includes a phone number and tells you to call it.",
      "They rush you. Real banks do not solve fraud by asking you to read a code to a stranger."
    ],
    do: "Close the chat. Open your bank's own app, or call the number printed on your card. Do not use the number inside the message."
  },
  {
    id: "prize",
    title: "Prize and promo wins",
    summary: "You are told you won a car, a grant, a church raffle or a telecom promo you do not remember entering. They need a fee before you can collect.",
    signs: [
      "You must pay a fee, tax or 'activation' to receive the prize.",
      "The news arrives from a personal WhatsApp number.",
      "They will not let you verify it on the organisation's real website."
    ],
    do: "A real prize does not start with you sending money. Ignore it, or check only through a website you typed yourself."
  },
  {
    id: "job",
    title: "Pay-to-get-the-job",
    summary: "A job, scholarship or visa post asks you to pay for a form, training kit, registration or 'processing' before anyone has interviewed you properly.",
    signs: [
      "Payment is the first step.",
      "The interview is only on WhatsApp.",
      "The organisation's name is famous, but the email or website is slightly wrong."
    ],
    do: "Apply through the organisation's own site or a front desk you can visit. A fee to 'secure' a job is a warning, not a process."
  },
  {
    id: "invest",
    title: "Guaranteed returns",
    summary: "Someone promises a fixed profit — daily, weekly, or 'double your money' — and shows screenshots of payouts.",
    signs: [
      "The return is guaranteed.",
      "You are pushed to invite friends.",
      "Withdrawals only work after you deposit more."
    ],
    do: "No honest investment can promise a sure profit. If you cannot afford to lose the money, do not send it."
  },
  {
    id: "vendor",
    title: "Goods you never see",
    summary: "A vendor, landlord or agent wants full payment, a deposit or an 'inspection fee' before you have seen the item or the house.",
    signs: [
      "The price is far below what you know.",
      "They refuse a public meeting or a payment on delivery.",
      "The house photos look like they were copied from somewhere else."
    ],
    do: "See the item or the house first. Pay an amount you can afford to lose only when you trust the person, and even then, be slow."
  },
  {
    id: "impersonation",
    title: "Fake officials",
    summary: "Someone claims to be from the EFCC, the police, a court or a military office. They say you are in trouble and can settle it by transfer.",
    signs: [
      "They threaten arrest on the phone.",
      "They ask you to keep the call secret.",
      "They want the money sent to a personal account."
    ],
    do: "Real agencies do not collect fines into a personal account over WhatsApp. End the call. If you are worried, contact the agency through its official website, or speak to a lawyer you choose."
  },
  {
    id: "romance",
    title: "Love, then a transfer",
    summary: "A new online friend moves very fast, then needs help with a ticket, a hospital bill, a customs fee or a parcel that is 'stuck'.",
    signs: [
      "You have never met.",
      "Every plan ends in you sending money.",
      "The story changes when you ask to video-call."
    ],
    do: "Do not send money to someone you have not met. A video call that they always postpone is a sign to stop."
  },
  {
    id: "loan",
    title: "Loan fees and harassment",
    summary: "An app or a WhatsApp lender approves a loan only after you pay a fee, or they already have your contacts and start threatening them.",
    signs: [
      "You pay money to receive a loan.",
      "The app asks for your contacts and photos for no clear reason.",
      "Threats start as soon as you ask a question."
    ],
    do: "A lender who needs your money first is not giving you a loan. Do not install a loan app from a link in a message. If an app is abusing your contacts, tell your bank and consider reporting it to the Nigeria Police National Cybercrime Centre."
  }
];

export const QUIZ = [
  {
    q: "A WhatsApp message says your bank account will be blocked in 30 minutes unless you read out the code that just arrived by SMS. What do you do?",
    options: [
      "Read the code so the account stays open.",
      "Call the number written inside that same message.",
      "Do not share the code. Check your bank only through its app or the number on your card."
    ],
    answer: 2,
    why: "A one-time code is a key to your account. Your bank will not ask you to read it to anyone. The phone number inside the message is part of the trick."
  },
  {
    q: "A post says you have won ₦500,000 in a promo. They ask for ₦5,000 as 'tax' before payment. What does that mean?",
    options: [
      "It is normal. Prizes are taxed in advance.",
      "Paying a fee to collect a prize is a warning sign.",
      "Pay it if the logo looks like a bank."
    ],
    answer: 1,
    why: "You should not pay money to receive money. A copied logo does not make a message official."
  },
  {
    q: "A job offer arrives on WhatsApp. They want ₦3,000 for a 'registration form' before the interview. What is the careful response?",
    options: [
      "Pay, then ask for a receipt.",
      "Do not pay. Look up the organisation yourself and apply the way they actually hire.",
      "Pay half now and half after the interview."
    ],
    answer: 1,
    why: "Asking for money before a real hiring process is a common trick. Find the organisation's own website or office."
  },
  {
    q: "Someone you just met online needs ₦40,000 for a hospital bill and promises to pay you back next week. You have never met them. What is sensible?",
    options: [
      "Send it. They sound kind.",
      "Do not send money to someone you have not met.",
      "Send it if they send a photo of an ID card."
    ],
    answer: 1,
    why: "Photos and stories are easy to copy. If you have never met the person, treat a request for money as a warning."
  },
  {
    q: "A link looks like your bank, but the address is a long string of words plus a strange ending. What should you do?",
    options: [
      "Open it, but don't type your password.",
      "Don't open it. Type the bank's address yourself.",
      "Open it if the page has a padlock."
    ],
    answer: 1,
    why: "A padlock only means the connection is encrypted. It does not mean the site is your bank. Type the address you already know."
  },
  {
    q: "Before you transfer money to a new account, which check matters most?",
    options: [
      "They said it is urgent.",
      "You confirmed the person on a phone number you already had, and you can afford to lose the money if it is a trick.",
      "They sent a voice note."
    ],
    answer: 1,
    why: "Urgency and a voice note are easy to fake. Confirm on a number you saved before, and never send money you cannot afford to lose."
  }
];

export const CHECKLIST = [
  { id: "who", text: "I know who this person is, beyond this chat." },
  { id: "channel", text: "I confirmed it on a phone number or app I already trusted — not a number they just sent." },
  { id: "rush", text: "Nobody is rushing me with 'now now' or a threat." },
  { id: "fee", text: "I am not paying a fee in order to receive money, a job, a prize or a loan." },
  { id: "secret", text: "Nobody has asked for my PIN, OTP, password, BVN or card number." },
  { id: "lose", text: "If this transfer is a trick, I can survive losing this amount." }
];

export const REPORT_CHANNELS = [
  {
    name: "Your bank, first",
    detail: "If money has left your account, tell your bank immediately using the number on the back of your card or the number inside the bank's official app. Ask them to trace or recall the transfer. A recall is not guaranteed.",
    href: "",
    label: ""
  },
  {
    name: "EFCC",
    detail: "The Economic and Financial Crimes Commission accepts petitions from the public, including reports of cyber crime. Use the official website, not a link someone sent you.",
    href: "https://www.efcc.gov.ng/SubmitPetition",
    label: "EFCC petition page"
  },
  {
    name: "Nigeria Police — National Cybercrime Centre",
    detail: "The Nigeria Police Force National Cybercrime Centre has an e-reporting portal for cybercrime. You can also walk into a police station.",
    href: "https://nccc.npf.gov.ng/",
    label: "NPF cybercrime portal"
  },
  {
    name: "Central Bank of Nigeria",
    detail: "For a complaint about a bank or other CBN-regulated institution, the CBN says to complain to the institution first and give them time to respond. If they do not resolve it, you can escalate to the CBN Consumer Protection Department. Do not include your PIN or password.",
    href: "https://www.cbn.gov.ng/supervision/cpdcomgt.html",
    label: "CBN complaints guide"
  },
  {
    name: "Emergency help",
    detail: "If you are in immediate danger, call 112. It is Nigeria's national emergency number and works across networks.",
    href: "tel:112",
    label: "Call 112"
  }
];

export const FIRST_AID = [
  {
    id: "bleeding",
    title: "Heavy bleeding",
    steps: [
      "Press firmly on the wound with a clean cloth. Keep pressing.",
      "If blood soaks through, add another cloth. Do not lift the first one to keep checking.",
      "Help the person lie down and keep the injured part raised if that does not cause more pain.",
      "Do not pull out anything that is stuck in the wound."
    ],
    help: "Get emergency help if the bleeding will not slow, the wound is deep, or the person is getting weak, pale or confused. Call 112."
  },
  {
    id: "burns",
    title: "Burns",
    steps: [
      "Cool the burn under gentle running water for about 20 minutes.",
      "Remove rings, watches or tight clothes near the burn before the area starts to swell, if they come off easily.",
      "Cover with a clean non-fluffy cloth or cling film.",
      "Do not put toothpaste, egg, oil, ice or butter on a burn."
    ],
    help: "Get medical help for burns on the face, hands, joints or genitals, for burns that are larger than the person's palm, for electrical or chemical burns, and for any burn on a baby or an older person."
  },
  {
    id: "choke",
    title: "Choking",
    steps: [
      "If the person can cough or talk, let them cough. Stay with them.",
      "If they cannot cough, speak or breathe, shout for help and call 112.",
      "For an adult who cannot breathe: lean them forward and give up to 5 firm blows between the shoulder blades with the heel of your hand. If that fails and you have been trained, give abdominal thrusts.",
      "For a baby, do not use abdominal thrusts. Use back blows and chest thrusts only if you have learned them, and get emergency help at once."
    ],
    help: "If you have not been trained in abdominal thrusts, focus on calling 112 and back blows. A wrong thrust can injure someone."
  },
  {
    id: "faint",
    title: "Fainting",
    steps: [
      "Lay the person on their back and raise their legs if you can.",
      "Loosen tight clothes around the neck.",
      "Check that they are breathing. If they are not breathing, call 112 and start chest compressions if you know how.",
      "When they wake, let them rest. Give water only if they are fully awake."
    ],
    help: "Call 112 if they do not wake quickly, if they are injured, pregnant, have chest pain, or if this is not the first faint."
  },
  {
    id: "sick",
    title: "Someone is very unwell",
    steps: [
      "Keep them comfortable and do not force food.",
      "Offer sips of oral rehydration if they are vomiting or passing watery stool, and if they can drink.",
      "Notice danger signs: trouble breathing, a seizure, a stiff neck, confusion, not waking, a rash that does not fade when pressed, or a baby who will not feed.",
      "Do not give leftover antibiotics or someone else's medicine."
    ],
    help: "Danger signs need a hospital, not a patent medicine shop. Call 112 if the person is collapsing or struggling to breathe."
  }
];

export const HEALTH_MEALS = [
  {
    title: "The everyday plate",
    body: "A useful plate has three things: a filling food (rice, yam, garri, plantain or pap), a protein (beans, egg, fish, groundnut or a little meat), and something green or colourful (okra, spinach, tomato, a piece of fruit).",
    ideas: ["Rice, beans and a tomato stew", "Eba, a small piece of fish and a vegetable soup", "Boiled yam, egg sauce and a slice of orange if you have one"]
  },
  {
    title: "Protein that does not need a big market day",
    body: "Beans, eggs and groundnut keep well and feed a family. You do not need meat in every pot.",
    ideas: ["Beans porridge with palm oil and pepper", "Egg sauce on any swallow or on bread", "Groundnut with pap or soaked garri"]
  },
  {
    title: "Water before soft drinks",
    body: "Thirst is often the reason people buy a bottle. Carry water from home. Soft drinks and pure water sachets add up across a week, and water from home is the cheaper drink.",
    ideas: ["A bottle filled at home", "Pap or a light soup when the weather is hot and appetite is low"]
  },
  {
    title: "Children's meals on a tight week",
    body: "Children need regular meals more than they need a different soup every day. Repeat a meal you can afford. Add a fruit or a tomato when you can.",
    ideas: ["Pap in the morning, rice and beans at noon, yam in the evening", "One pot of beans shared across two meals"]
  },
  {
    title: "When someone is unwell",
    body: "This is not a treatment. Soft foods and drinks are often easier: pap, rice, soup, and oral rehydration if they are losing fluid. See the disclaimer. A sick child who will not drink needs a clinic, not a new recipe.",
    ideas: ["Plain rice and a light stew", "Pap", "Sips of oral rehydration solution"]
  }
];

export const SKILL_TIPS = [
  { title: "Read the whole post", body: "Before you apply, find who is hiring, where the work is, and whether they are asking for money. If the only next step is a transfer, stop." },
  { title: "Keep one true CV", body: "Use dates and roles you can explain. A CV that overclaims will collapse in the interview. NaijaPocket's CV builder stays on this phone so you can update it when a real role appears." },
  { title: "One page is enough at the start", body: "For most early jobs, a clear page beats a long one. Name, phone, city, a short summary, education, two experiences, and skills." },
  { title: "Show the work, not only the title", body: "Instead of 'sales girl', write what you did: 'Served customers, recorded daily sales, and restocked the shelf.' That is what an employer can picture." },
  { title: "NYSC and school, plainly", body: "If you have served, put the year and the state. If you have not finished, say so. Leaving a gap with no note creates questions." },
  { title: "Practise out loud", body: "Say your introduction once before the interview. Two minutes is enough: who you are, what you have done, and why you want this particular role." },
  { title: "Ask a real question", body: "At the end, ask about the hours, the pay date, or who you would report to. People who only say 'any question? no' look like they have not thought about the job." },
  { title: "Side hustles are still work", body: "Baking, braiding, delivery, tutoring and phone repairs count. Write them as experience if you did them properly, with what the customer paid you to do." }
];

export const INTERVIEW = [
  { q: "Tell us about yourself.", a: "Give your name, your most relevant experience, and one result. Keep it under two minutes. Do not start from primary school." },
  { q: "Why do you want this role?", a: "Mention something specific about the work, not only the salary. 'I have sold in a busy shop and I want to do that for a bigger store' is clearer than 'I need a job'." },
  { q: "What are you good at?", a: "Pick two things you can prove with a story. 'I keep records' is stronger if you add 'I wrote the day's sales in a book every evening'." },
  { q: "Describe a problem you solved.", a: "Use a true story: what went wrong, what you did, what changed. A small true story is better than a dramatic invented one." },
  { q: "What pay do you expect?", a: "If you know the range, say a number you can live on and explain it briefly. If you do not, ask what band they have in mind. Never pay them to discuss salary." },
  { q: "When can you start?", a: "Be honest about notice, NYSC, or school. A clear date builds more trust than 'immediately' if immediately is not true." }
];

export const PROMO_STYLES = [
  { id: "whatsapp", tier: "free", name: "WhatsApp status", blurb: "A short message you can paste into Status or a customer chat." },
  { id: "caption", tier: "free", name: "Social caption", blurb: "A caption for Facebook or Instagram, still in your own words once you edit it." },
  { id: "product", tier: "free", name: "Product description", blurb: "A plain description for a catalogue or a flyer." },
  { id: "followup", tier: "free", name: "Polite follow-up", blurb: "A gentle nudge for someone who asked about a product and went quiet." },
  { id: "restock", tier: "plus", name: "New stock announcement", blurb: "A second style for when goods land. Pocket Plus." },
  { id: "thankyou", tier: "plus", name: "Thank-you after payment", blurb: "A short receipt-style thank you. Pocket Plus." }
];

export const OPP_TYPES = [
  { id: "job", label: "Job" },
  { id: "side-hustle", label: "Side hustle" },
  { id: "remote", label: "Remote work" },
  { id: "scholarship", label: "Scholarship" },
  { id: "training", label: "Training" }
];

export const APP_STATUSES = [
  { id: "saved", label: "Saved" },
  { id: "applied", label: "Applied" },
  { id: "interview", label: "Interview" },
  { id: "offer", label: "Offer" },
  { id: "no", label: "Not this time" },
  { id: "withdrawn", label: "Withdrawn" }
];

export const REMINDER_KINDS = [
  { id: "medicine", label: "Medicine I already take" },
  { id: "water", label: "Water" },
  { id: "appointment", label: "Appointment" },
  { id: "rest", label: "Rest" },
  { id: "other", label: "Other" }
];
