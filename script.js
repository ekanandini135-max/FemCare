// ================= PERIOD TRACKER =================

function savePeriod() {

const date=document.getElementById("date").value;
const cycle=document.getElementById("cycle").value;

fetch("/save-period",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({date,cycle})

})

.then(res=>res.json())

.then(data=>{

document.getElementById("periodResult").textContent=data.message

})

.catch(()=>{

document.getElementById("periodResult").textContent="Server error"

})

}


// ==================== PERIOD CARE ====================
function periodProductGuide() {
    const product = document.getElementById('periodProduct').value;
    const result = document.getElementById('productResult');

    const info = {
        pads: "Sanitary Pads: Change every 4-6 hours. Available in disposable and reusable options.",
        tampons: "Tampons: Comfortable for active lifestyles. Change every 4-8 hours to avoid TSS.",
        cups: "Menstrual Cups: Reusable, cost-effective, hold up to 12 hours. Ideal for heavy flow.",
        panties: "Period Panties: Reusable and leak-proof. Good for light-to-moderate flow or backup."
    };

    result.textContent = info[product] || "Select a product to get guidance.";
}

function periodPainGuide() {
    const pain = document.getElementById('periodPain').value;
    const result = document.getElementById('painResult');

    const tips = {
        heat: "Heat Therapy: Use heating pad, hot water bottle, or warm bath to relax muscles.",
        meds: "Medication: OTC pain relievers like ibuprofen or naproxen sodium help cramps.",
        diet: "Diet/Natural: Gentle exercise, hydration, herbal teas, magnesium-rich foods.",
        massage: "Massage/Acupressure: Gentle abdominal massage with essential oils can reduce pain."
    };

    result.textContent = tips[pain] || "Select an option for severe pain relief tips.";
}

// ==================== HYGIENE ====================
function hygieneGuide() {
    const option = document.getElementById('hygieneOption').value;
    const result = document.getElementById('hygieneResult');

    const hygieneTips = {
        hands: "Hand Hygiene: Wash 20 seconds with soap, use sanitizer when unavailable.",
        body: "Body: Shower daily, pay attention to underarms, groin, feet. Use mild soap.",
        oral: "Oral: Brush twice daily, floss daily, clean tongue, visit dentist every 6 months.",
        hair: "Hair/Face: Wash hair 2-3 times/week, face twice daily with proper cleanser.",
        nails: "Nails/Feet: Trim nails, clean under them, wash feet thoroughly.",
        clothes: "Clothes: Change daily, wash regularly, dry promptly.",
        other: "Other: Cover cough/sneeze, disinfect devices, avoid sharing personal items.",
        intimate: "Intimate: Wash external genitals daily, change sanitary products regularly."
    };

    result.textContent = hygieneTips[option] || "Select an area to get hygiene tips.";
}

// Optional Period Guide for 'during', 'missed', 'pain'
function periodGuide() {
    const state = document.getElementById('periodState').value;
    const result = document.getElementById('periodGuideResult');

    const guide = {
        during: "During Periods: Use comfortable products, stay hydrated, light exercise helps.",
        missed: "Missed Period: Check stress levels, diet, and consult a doctor if 3+ periods missed.",
        pain: "Severe Pain: Use heat therapy, medication, or gentle massage for relief."
    };

    result.textContent = guide[state] || "Select a period condition to get guidance.";
}

// ==================== PREGNANCY PLAN ====================
function pregnancyGuide() {
    const week = document.getElementById('week').value;
    const topic = document.getElementById('pregnancyCare').value;
    const result = document.getElementById('pregnancyResult');

    if (!week || !topic) {
        result.textContent = "Please enter week and select topic.";
        return;
    }

    const plans = {
        food: "Nutrition: Eat a balanced diet rich in iron, protein, and folic acid.",
        doctor: "Doctor Visits: Schedule regular checkups, monitor blood pressure and weight.",
        exercise: "Exercise & Yoga: Light stretching, prenatal yoga, and walking are safe.",
        sleep: "Sleep & Water: 7-8 hours of sleep, stay hydrated throughout the day.",
        tests: "Blood Tests: Regular tests like CBC, glucose, and thyroid function.",
        after: "After Delivery Care: Rest, proper nutrition, and follow postnatal doctor guidance."
    };

    result.textContent = `Week ${week}: ${plans[topic] || "Select a topic for guidance."}`;
}



// ==================== FOOD AI ====================

function askFood() {

    const symptom = document.getElementById("food").value
    const result = document.getElementById("foodResult")

    if(!symptom){
        result.textContent="Enter symptom first"
        return
    }

    fetch("/food-ai",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({symptom})

    })

    .then(res=>res.json())

    .then(data=>{
        result.textContent=data.answer
    })

    .catch(()=>{
        result.textContent="Server error"
    })

}




// ==================== CHATBOT ====================

function chatbot(){

    const question=document.getElementById("chat").value
    const result=document.getElementById("chatResult")

    if(!question){
        result.textContent="Ask something"
        return
    }

    fetch("/chat-ai",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({question})

    })

    .then(res=>res.json())

    .then(data=>{
        result.textContent=data.answer
    })

    .catch(()=>{
        result.textContent="Server error"
    })

}

function startVoice() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Voice recognition not supported.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onresult = function(event) {
        document.getElementById('chat').value = event.results[0][0].transcript;
    };
    recognition.start();
}

// ==================== MEDICINE REMINDER ====================
let reminders = [];

function setReminder() {
    const med = document.getElementById('med').value;
    const time = document.getElementById('time').value;
    const list = document.getElementById('reminderList');

    if (!med || !time) {
        alert("Enter medicine name and time.");
        return;
    }

    reminders.push({ med, time });
    updateReminderList();

    scheduleNotification(med, time);

    document.getElementById('med').value = "";
    document.getElementById('time').value = "";
}

function updateReminderList() {
    const list = document.getElementById('reminderList');
    list.innerHTML = "";
    reminders.forEach((reminder, index) => {
        const li = document.createElement('li');
        li.textContent = `${reminder.med} at ${reminder.time}`;
        list.appendChild(li);
    });
}

// Notification logic
function scheduleNotification(med, time) {
    const [hours, minutes] = time.split(":").map(Number);
    const now = new Date();
    const notifTime = new Date();
    notifTime.setHours(hours, minutes, 0, 0);

    if (notifTime < now) {
        notifTime.setDate(notifTime.getDate() + 1);
    }

    const timeout = notifTime.getTime() - now.getTime();

    setTimeout(() => {
        if (Notification.permission === "granted") {
            new Notification("Medicine Reminder", { body: `Time to take your medicine: ${med}` });
        } else {
            alert(`Time to take your medicine: ${med}`);
        }
    }, timeout);
}

// Request permission on load
if (Notification.permission !== "granted") {
    Notification.requestPermission();
}

// ==================== PCOS / PCOD CARE ====================
function pcosGuide() {
    const type = document.getElementById('pcosType').value;
    const result = document.getElementById('pcosResult');

    const tips = {
        diet: "PCOS Diet: Low-GI foods, high fiber, balanced protein intake.",
        exercise: "Exercise: Regular cardio and strength training help balance hormones.",
        medicine: "Medication: Consult doctor for insulin-sensitizing or hormone treatments.",
        lifestyle: "Lifestyle: Reduce stress, sleep well, and maintain healthy weight."
    };

    result.textContent = tips[type] || "Select an option to get guidance.";
}