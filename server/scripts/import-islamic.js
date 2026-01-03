require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED ISLAMIC STUDIES SYLLABUS CONTENT
// Sourced verbatim from JAMB Islamic Studies Syllabus
const ISLAMIC_STUDIES_SYLLABUS = {
  subject: 'Islamic Studies',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Islamic Studies is to prepare the candidates for the Board’s examination. It is designed to test their achievement of the course objectives, which are to:
1. master the Qur’ān and Sunnah as foundations of Islamic and social life;
2. be familiar with Islamic heritage, culture and civilization;
3. be acquainted with the tradition of Islamic scholarship and intellectual discourse;
4. demonstrate knowledge of Islamic moral, spiritual, economic, political and social values;
5. be exposed to the fundamental principles of Islam; and
6. be prepared to face the challenges of life as good practising Muslims.`
    },
    {
      name: 'Part 1: Revelation of the Glorious Qur’ān',
      content: `TOPICS/CONTENTS/NOTES:
1. Revelation of the Glorious Qur’ān
(i) Visits of the Prophet (SAW) to Cave Hira 
(ii) His reaction to the first revelation and its importance
(iii) Different modes of revelation (Q.42:51): inspiration behind the veil, through an angel, etc.
(iv) Piecemeal revelation (Q.17:106) (Q.25:32)
(v) Names and attributes of the Qur’an

OBJECTIVES:
Candidates should be able to:
(i) analyse the Prophet’s (SAW) visits to Cave Hira and the purpose;
(ii) describe the Prophet’s reaction to the first revelation and its importance;
(iii) differentiate between the modes of revelation;
(iv) explain why the Glorious Qur’ān was revealed piecemeal.
(v) identify the names and attributes of the Qur’an`
    },
    {
      name: 'Part 1: Preservation and Importance of the Qur’ān',
      content: `TOPICS/CONTENTS/NOTES:
1b. Preservation of the Glorious Qur’ān
(i) Recording, compilation and standardization of the Qur’ān 
(ii) Differences between Makkah and Madinan suwar
(iii) The role played by the Companions of the Prophet (SAW) on the collection and compilation of the Qur’ān.
1c. Importance of the Glorious Qur’ān as a source of guidance in spiritual, moral, economic, political and socio-cultural matters.
1d. Divine authenticity of the Glorious Qur’ān
(i) Proof of the Divine authenticity of the Glorious Qur’ān (Q.4:82) (Q.41:42)
(ii) Uniqueness of the Glorious Qur’ān (Q.39:27) (Q.17:88) (Q.75:16-19)
(iii) Divine preservation of the Glorious Qur’ān (Q.15:9)

OBJECTIVES:
Candidates should be able to:
(i) analyse how the Glorious Qur’ān was recorded, compiled and standardized.
(ii) differentiate between Makkan and Madinan suwar
(iii) evaluate the role played by the companions of the Prophet (SAW) on the collection and compilation of the Qur’ān.
(iv) examine the importance of the Glorious Qur’ān.
(v) evaluate the proof of the divine authenticity of the Glorious Qur’ān;
(vi) evaluate the uniqueness of the Glorious Qur’ān;
(vii) examine the ways by which the Glorious Qur’ān was preserved.`
    },
    {
      name: 'Part 1: Tafsīr and Tajwīd',
      content: `TOPICS/CONTENTS/NOTES:
2. Tafsīr
(i) Historical development of Tafsīr
(ii) Importance of Tafsīr
(iii) Types of Tafsir
3. Introduction to Tajwīd (Theory and Practice) 

OBJECTIVES:
Candidates should be able to:
(i) trace the origin and sources of Tafsīr;
(ii) evaluate the importance of Tafsīr
(iii) identify the types of Tafsir
(iv) examine the meaning and importance of Tajwīd`
    },
    {
      name: 'Part 1: Study of Arabic Text (Set A)',
      content: `TOPICS/CONTENTS/NOTES:
4. Study of the Arabic text of the following suwar/ayats with tajwīd:
(a) al-Fātihah (Q.1) 
(b) al –cĀdiyāt (Q.100)
(c) al –Qari’cah (Q.101)
(d) at -Takāthur (Q.102)
(e) al –cAsr ((Q.103)
(f) al -Humazah (Q.104)
(g) al -Mācūn ((Q.107)
(h) al -Kawthar (Q.108)
(i) al – Kāfirūn (Q. 109)
(j) al- Nasr (Q. 110)
(k) al -Masad ((Q.111)
(l) al -Ikhlās (Q.112)
(m) al -Falaq ((Q.113)
(n) an-Nās (Q.114)

OBJECTIVES:
Candidates should be able to:
(i) recite with correct tajwīd the Arabic texts of the suwar;
(ii) translate the verses;
(iii) deduce lessons from them;
(iv) evaluate the teachings of the verses.`
    },
    {
      name: 'Part 1: Study of Arabic Text (Set B)',
      content: `TOPICS/CONTENTS/NOTES:
5. Study of the Arabic text of the following suwar/ayats with tajwīd:
(a) al-Acalā (Q.87)
(b) ad-Duhā (Q.93)
(c) al-Inshirah (Q.94)
(d) at-Tīn (Q.95)
(e) al-cAlaq (Q.96)
(f) al-Qadr (Q.97)
(g) al-Bayyinah (Q.98)
(h) al-Zalzalah (Q.99)
(i) Ayatul-Kursiyy (Q.2:255)
(j) Āmanar-Rasūl (Q.2:285-6)
(k) Laqad jāakum (Q.9:128-129)

OBJECTIVES:
Candidates should be able to:
(i) recite with correct tajwīd the Arabic texts of the suwar;
(ii) deduce lessons from them;
(iii) evaluate their teachings;`
    },
    {
      name: 'Part 1: Hadīth',
      content: `TOPICS/CONTENTS/NOTES:
6. Hadīth
(a) History of Hadīth literature - Collection of Hadīth from the time of the Prophet(SAW) to the period of the six authentic collectors of Hadīth 
(b) Authentication of Hadīth
(i) Isnād (Asma’ur-rijāl)
(ii) Matn
(iii) Classification of Hadīth into Sahīh, Hassan and Dacīf
(c) The relationship between Hadīth and the Glorious Qur’ān
(i) The importance of Hadīth
(ii) The similarities and differences between Hadīth and the Glorious Qur’ān
(d) The six sound collectors of Hadīth – biographies and their works.
(e) Muwatta and its author – The biography of Imam Malik and the study of his book
(f) The study of the Arabic texts of the following ahādīth from an-Nawāwi’s collection: 1,3,5,6,7,9,10,11,12,13,15,16, 18,19,21, 22,25,27,34, and 41

OBJECTIVES:
Candidates should be able to:
(i) evaluate the history of Hadīth from the time of the Prophet (SAW) to the period of six authentic collectors.
(ii) analyse the Isnād;
(iii) analyse the Matn;
(iv) distinguish between Hadīth Sahīh, Hassan and dacīf.
(v) examine the importance of Hadīth;
(vi) distinguish between Hadīth and the Glorious Qur’ān.
(vii) evaluate their biographies and works (Six sound collectors).
(viii) evaluate his biography (Imam Malik);
(ix) analyse his work (Muwatta).
(x) interpret the ahādīth in Arabic;
(xi) apply them in their daily lives.`
    },
    {
      name: 'Part 1: Moral lessons in the Glorious Qur’ān and Hadīth',
      content: `TOPICS/CONTENTS/NOTES:
7. Moral lessons in the Glorious Qur’ān and Hadīth
(a) General moral lessons contained in the admonition of Sage Luqman to his son (Q.31:12-18).
(b) Goodness to parents (Q.17:23-24)
(c) Honesty (Q.2:42)(Q.61:2-3)
(d) Prohibition of bribery and corruption (Q:2:188), alcohol and gambling (Q.2:219) (Q.5:90-91), stealing and fraud (Q.5:41) (83:1-5), smoking, drug abuse and other intoxicants (Q.2:172-173, 195 and 219) (Q.4:43) (Q.5:3) (Q.6:118-121) arrogance (Q.31:18-19) and extravagance (Q.17:26-27) (Q.31:18-19)
(e) Dignity of labour (Q.62:10) (Q.78:11) Hadīth from Bukhari and Ibn Majah: “that one of you takes his rope…….” “never has anyone of you eaten……”.
(f) Behaviour and modesty in dressing (Q.24:27-31) (Q.33:59)
(g) Adultery and fornication (Q.17:32) (Q.24:2), homosexuality (Q.11:77-83) and obscenity (Q:4:14-15) Hadīth – “No one of you should meet a woman privately …… “Bukhari
(h) Leadership (Q.2:124) and justice (Q.4:58 and 135) (Q.5:9) Hadīth – ‘take care everyone of you is a governor ….. concerning his subjects” (al-Bukhari and others)
(i) Trust and obligations (Q:4:58) (Q.5:1) and promises (Q.16:91) Hadīth ‘he has (really) no faith …. Not fulfilled his promise” (Baihaqi)
(j) Piety (Taqwa) (Q:2:177) (Q.3:102) (Q.49:13) Hadīth 18 and 35 of an Nawāwī
(k) Tolerance, perseverance and patience (Q.2:153-157) (Q.3:200) (Q.103:3) Hadīth 16 of an-Nawāwī
(l) Unity and brotherhood (Q.3:103) (Q.8:46) (Q.49:10) Hadīth 35 of an-Nawawi
(m) Enjoining what is good and forbidding what is wrong (Q.3:104 and 110) (Q.16:90) Hādīth 25 and 34 of an Nawāwī

OBJECTIVES:
Candidates should be able to:
(i) use, apply, and demonstrate the teachings of these verses and Hadīth in their daily lives;
(ii) interpret the teachings of the verses and the Hadīth.`
    },
    {
      name: 'Part 2: Faith (Tawhīd)',
      content: `TOPICS/CONTENTS/NOTES:
8. PART II: TAWHĪD AND FIQH
(a) Faith
(i) Tawhīd: Its importance and lessons
(b) Kalimatush-Shahadah 
(i) Its meaning and importance
(ii) The Oneness of Allah as contained in the following verses: (Q.3:18) Q.2:255) (Q.112:1-4)
(iii) The servanthood and messengership of the Prophet Muhammad (SAW) as contained in the following verses (Q.3:144) (Q.18:110) (Q.48:29) and (Q.34:28)
(iv) Universality of his message (Q.7:158) (Q.34:28)
(v) Finality of his Prophethood (Q.33:40)
(c) Shirk
(i) Beliefs which are incompatible with the Islamic principles of Tawhīd:
- Worship of Idols (Q.4:48) (Q.22:31)
- Ancestral worship (Q.4:48 and 116) (Q.21:66-67)
- Trinity (Q.4:171) (Q.5:76) (Q.112:1-4)
- Atheism (Q.45:24) (Q.72:6) (Q.79:17-22)
(d) General practices which are incompatible with Islamic principles of Tawhīd:
- Superstition (Q.25:43) (Q.72:6)
- Fortune-telling (Q.15:16-18) (Q.37:6-10)
- Magic and witchcraft (Q.2:102) (Q.20:69) and 73) (Q.26:46)
- Cult worship (Q.17:23) (Q.4:48)
- Innovation (Bid’ah) (Q.4:116) and Hadīth 5 and 28 of an-Nawāwī

OBJECTIVES:
Candidates should be able to:
(i) analyse the concepts of Tawhīd;
(ii) evaluate the significance of kalimatush-shahadah;
(iii) identify the verses dealing with the Oneness of Allah;
(iv) explain the significance of the servanthood of the Prophet Muhammad (SAW);
(v) evaluate the significance of the universality of Prophet Muhammad’s message;
(vi) examine the significance of the finality of the Prophethood of Muhammad (SAW);
(vii) identify what actions and beliefs constitute shirk;
(viii) explain the implications of beliefs and actions of shirk;
(ix) identify and examine those practices that are incompatible with the Islamic principles of Tawhīd.`
    },
    {
      name: 'Part 2: Articles of Faith',
      content: `TOPICS/CONTENTS/NOTES:
9. Articles of faith 
(a) Belief in Allah
(i) Existence of Allah (Q.2:255) (Q.52:35-36)
(ii) Attributes of Allah (Q.59:22-24)
(iii) The works of Allah (Q.27:59:64)
(b) Belief in Allah’s angels (Q.2:177 and 285) (Q.8:50) (Q.16:2)
(c) His books (Q.2:253) and 285) (Q.3:3)
(d) His Prophets: Ulul-azmi (Q.4:163-164)
(e) The Last Day: Yawm-al-Bacth (Q.23:15-16) (Q.70:4)
(f) Destiny: distinction between Qada and Qadar (Q.2:117) (Q.16:40) (Q.36:82)

OBJECTIVES:
Candidates should be able to:
(i) examine the significance of the articles of faith;
(ii) list the attributes of Allah;
(iii) examine the works of Allah;
(iv) explain the belief in Allah’s books;
(v) identify the verses on Allah’s books;
(vi) explain the belief in the Prophets of Allah and its significance;
(vii) analyse the belief in the Last Day and its significance;
(viii) evaluate the belief in destiny and its significance.`
    },
    {
      name: 'Part 2: Ibadat and their types',
      content: `TOPICS/CONTENTS/NOTES:
10. Ibadat and their types
(a) Good deeds (Q.3:134) (Q.6:160) (Q.2:177) (Q.31:8) (Q.103:1-3) 26th Hadīth of an-Nawāwī
(b) Taharah, its types and importance (alistinja’/ istijmar, alwudu’, at-tayammum and al-ghusl (Q.2:222) (Q.5:7) Hadīth 10 and 23 of an-Nawāwī.
(c) Salah 
(i) Importance: (Q.2:45) (Q.20:132) (Q.29:45) and Hadīth 23rd of an-Nawāwī
(ii) Description and types of salah
(iii) Things that vitiate salah
(d) Zakah
(i) Its types and importance (zakatul-fitr, zakatul mal, al-an-am and al-harth (Q.2:267) (Q.9:103) 3rd Hadīth of an-Nawāwī
(ii) Collection and disbursement (Q.9:60)
(iii) Difference between Zakah and sadaqah
(e) Sawm
(i) Its types and importance (fard, sunnah, qada and kaffarah) (Q.2:183-185) 3rd Hadīth of an-Nawāwī
(ii) People exempted from sawm
(iii) Things that vitiate sawm
(f) Hajj 
(i) Its importance (Q.2:158 and 197) (Q.3:97) (Q.22:27-28)
(ii) Type (Ifrad, Qirān and Tamattuc)
(iii) Essentials of Hajj (Arkan al Hajj)
(iv) Conditions for the performance of Hajj
(v) Differences between Hajj and Umrah
(g) Jihad: Concept, kinds, manner and Lessons (Q.2:190-193) (Q.22:39-40)

OBJECTIVES:
Candidates should be able to:
(i) identity what constitutes acts of ibadah;
(ii) distinguish between the different types of taharah;
(iii) assess the importance of salah to a Muslim’s life;
(iv) analyse different types of salah and identify things that vitiate it;
(v) differentiate between the various types of zakkah, collection, and disbursement;
(vi) distinguish between zakah and sadaqah;
(vii) compare the various types of sawm, exemptions, and vitiators;
(viii) examine the importance, types, essentials, and conditions of Hajj;
(ix) differentiate between Hajj and Umrah;
(x) examine the concepts of jihad, its types, manner, and lessons.`
    },
    {
      name: 'Part 2: Family Matters',
      content: `TOPICS/CONTENTS/NOTES:
11. Family Matters
(a) Marriage
(i) Importance (Q.16:72) (Q.24:32) (Q.30:20-21)
(ii) Prohibited categories (Q.2:221) (Q.4:22-24)
(iii) Conditions for its validity (Q.4:4) (Q.4:24-25)
(iv) Rights and duties of husbands and wives (Q.4:34-35) (Q.20:132) (Q.65:6-7)
(v) Polygamy (Q.4:3 and 129)
(b) Idrar ill-treatment of wife (Q. 65:1-3)
(c) Divorce
(i) Attitude of Islam to divorce (Q.2:228) (Q.4:34-35) Hadīth “of all things lawful … most hateful to Allah..” (Abu Daud 15:3)
(ii) Kinds (Talaq, Khul;, Faskh, Mubara’ah and Licān) (Q.2:229-230) (Q.24:6-9)
(iii) Iddah, kinds, duration and importance (Q.2:228 and 234)
(iv) Prohibited forms of dissolution of marriage. (Ila and Zihar) (Q.2:226-227) (Q.58:2-4)
(v) Custody of children (Hadanah)
(d) Inheritance 
(i) Its importance
(ii) Heirs and their shares (Q.4:7-8, 11-12 and 176)

OBJECTIVES:
Candidates should be able to:
(i) analyse the importance of marriage;
(ii) list the category of women prohibited to a man to marry;
(iii) examine the conditions for validity of marriage;
(iv) explain the rights and duties of the spouse;
(v) evaluate polygamy and its significance;
(vi) examine the ill-treatment of wife in marriage;
(vii) analyse the attitude of Islam to divorce;
(viii) examine the different kinds of divorce;
(ix) differentiate between the various kinds of iddah and its duration;
(x) explain the prohibited forms of ending marriage;
(xi) examine who has the right to custody of children;
(xii) evaluate the significance of inheritance;
(xiii) identify the categories of the Qur’ānic heirs and explain the share of each heir.`
    },
    {
      name: 'Part 2: Sources and Schools of Law',
      content: `TOPICS/CONTENTS/NOTES:
12. Sources and Schools of Law 
(i) The four major sources (the Qur’ān, Sunnah, Ijmac and Qiyās)
(ii) The four Sunni Schools of law and their founders.

OBJECTIVES:
Candidates should be able to:
(i) analyse the four major sources of Islamic law;
(ii) examine the biography of the founders of sunni schools of law;
(iii) examine contributions of the founders of the sunni school of law.`
    },
    {
      name: 'Part 2: Islamic Economic System',
      content: `TOPICS/CONTENTS/NOTES:
13. Islamic Economic System
(i) Islamic attitude to Riba (Q.2:275-280) (Q.3:130) (Q.4:161) Hadīth 6th of an-Nawāwī
(ii) At-tatfif (Q.83:1-6)
(iii) Hoarding (ihtikar) (Q.9:34)
(iv) Islamic sources of revenue: Zakah, Jizyah, Kharaj and Ghanimah
(v) Baitul-mal as an institution of socioeconomic welfare
(vi) Difference between the Islamic economic system and the Western economic system

OBJECTIVES:
Candidates should be able to:
(i) analyse Islamic attitude to Riba;
(ii) relate at-tatfif and its negative consequences;
(iii) examine ihtikar and its implications on society;
(iv) identify the sources of revenue in Islam;
(v) evaluate the disbursement of the revenue;
(vi) explain the uses of baitul-mal in the Ummah;
(vii) differentiate between the Islamic and Western economic systems.`
    },
    {
      name: 'Part 2: Islamic Political System',
      content: `TOPICS/CONTENTS/NOTES:
14. Islamic Political System
(i) Allah as the Sovereign (Q.3:26-27)
(ii) The concept of Shurah (consultation) (Q.3:159( (Q.42:38)
(iii) The concept of Adalah (justice) (Q.5.9) (Q.4:58 and 135) and Mas’uliyah (accountability)(Q.17:36) (Q..102:8)
(iv) The rights of non-Muslims in an Islamic state (Q.2:256) (Q.6:108)
(v) Differences between the Islamic political system and the Western political system.

OBJECTIVES:
Candidates should be able to:
(i) analyse the concept of Allah’s sovereignity;
(ii) examine the concept of shurah in Islam;
(iii) evaluate the concept of justice and accountability;
(iv) examine the rights of non-Muslims in an Islamic state;
(v) differentiate between the Islamic and Western political systems.`
    },
    {
      name: 'Part 3: Pre-Islamic Arabia and Prophet Muhammad (SAW)',
      content: `TOPICS/CONTENTS/NOTES:
15. Pre-Islamic Arabia (Jahiliyyah) 
(i) Jahiliyyah practices: idol worship, infancticide, polyandry, gambling, usury, etc.
(ii) Islamic reforms
16. The Life of Prophet Muhammad (SAW)
(i) His birth and early life
(ii) His call to Prophethood
(iii) His Dacwah in Makkah and Madinah
(iv) The Hjrah 
(v) His administration of the Ummah in Madinah
(vi) The battles of Badr, Uhud and Khandaq: causes and effects 
(vii) The Treaty of al-Hudaibiyyah and the conquest of Makkah
(viii) Hijjatul-wada (the farewell pilgrimage) sermon, and lessons.
(ix) Qualities of Muhammad (SAW) and lessons learnt from them

OBJECTIVES:
Candidates should be able to:
(i) distinguish the different types of practices common to the Arabs of al-Jahiliyyah;
(ii) trace the reforms brought about by Islam to the Jahiliyyah practices.
(iii) account for the birth and early life of the Prophet Muhammad (SAW);
(iv) provide evidence for the call of Muhammad (SAW) of Prophethood;
(v) analyse the Dacwah activities of the Prophet Muhammad (SAW) to Madinah;
(vi) account for the Hijrah of the Prophet Muhammad (SAW) in Makkah and Madinah;
(vii) analyse the administration of the Muslim Ummah in Madinah;
(viii) account for the causes and effects of the battles of Badr, Uhud and Khandaq;
(ix) trace the circumstances leading to the formulation of the Treaty of Hudaibiyya;
(x) account for the Conquest of Makkah;
(xi) examine the farewell pilgrimage of the Prophet and its lessons;
(xii) analyse the qualities of Muhammad (SAW) their relevance to the life of a Muslim.`
    },
    {
      name: 'Part 3: The Caliphs and Islam in Africa',
      content: `TOPICS/CONTENTS/NOTES:
17. The Rightly Guided Caliphs (al-Khulafa’u rashidun) – the lives and contributions of the four Rightly Guided Caliphs 
18. Early contact of Islam with Africa
(i) Hijrah to Abyssinia
(ii) The spread of Islam to Egypt
(iii) The role of traders, teachers, preachers, Murabitun, Sufi orders and Mujaddidun to the spread of Islam in West Africa. 
19. The Impact of Islam in West Africa
(i) The influence of Islam on the sociopolitical life of some West African Empires: Ghana, Mali, Songhai and Borno 
(ii) The impact of Islam on the economic life of some West African states: Timbuktu, Kano and Borno

OBJECTIVES:
Candidates should be able to:
(i) trace the biographies of the four Rightly Guided Caliphs;
(ii) evaluate their contributions to the development of Islam.
(iii) evaluate their circumstances leading to the Hijrah to Abyssinia;
(iv) give reasons for the spread of Islamic in Egypt;
(v) account for the roles of traders, teachers, preachers, Murabitun, Sufi orders and Mujaddidun in the spread of Islam in West Africa.
(vi) analyse the influence of Islam on the sociopolitical system of some West African States;
(vii) evaluate the impact of Islam on the economic life of Timbuktu, Kano and Borno.`
    },
    {
      name: 'Part 3: Contributions of Islam to Education',
      content: `TOPICS/CONTENTS/NOTES:
20. Contributions of Islam to Education
(i) The aims and objectives of Islamic Education
(ii) The Glorious Qur’ān and Hadīth on Education (Q.96:1-5) (Q.39:9)
(i) “The search for knowledge is obligatory on every Muslim” (Ibn Majah)
(ii) “Seek knowledge from the cradle to the grave”
(iii) “The words of wisdom are a lost property of the believer … a better right to it…. “ (Tirmidhi)
(iii) Intellectual activities of Islam in West Africa (development of written history in Arabic and the establishment of Sankore University) 
(iv) Intellectual activities of Ahmad Baba of Timbuktu, Sheikh al-Maghili, Sheikh Usman Danfodio, Sultan Muhammad Bello and Ibn Battuta
(vi) Islamic Education Institutions: House of Wisdom in Baghdad, al-Azhar University in Cairo and Nizamiyyah University in Baghdad.
(vi) The lives and contributions of Ibn Sina, Al-Ghazali, Ibn Rushd, ar-Razi and Ibn Khaldun to education.

OBJECTIVES:
Candidates should be able to:
(i) explain the aims and objectives of Islamic Education;
(ii) assess the position of the Glorious Qur’ān and Hadīth in education;
(iii) examine the importance of seeking knowledge in Islam;
(iv) analyse the intellectual activities of Islam in West Africa.
(v) assess the contributions of Sheikh al-Maghili, Sheikh Uthman Dan Fodio, Sultan Muhammad Bello and Ibn Battuta to education;
(vi) account for the development of intellectual centres in Baghdad and Cairo;
(vii) examine the contributions of Ibn Sina to the development of Medicine;
(viii) assess al-Ghazali’s contribution to Islamic education;
(ix) analyse Ibn Rushd’s contribution to philosophy and fiqh;
(x) assess ar-Razi’s contribution to philosophy;
(xi) analyse Ibn Khaldun’s contribution to modern sociology and method of writing history.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Abdul, M.O.A. (1976) Studies in Islam Series Book 3, Lagos: IPB
2. Abdul, M.O.A. (1982) Studies in Islam Series Book 2, Lagos: IPB
3. Abdul, M.O.A. (1988) The Classical Caliphate, Lagos: IPB
4. Abdulrahman and Canham (n.d) The Ink of the Scholar, OUP
5. Ali, A.Y. (1975) The Holy Qur’ān Text: Translation and Commentary Leicester: The Islamic Foundation
6. Ali, M.M. (n.d) The Religion of Islam, Lahore
7. Doi, A. R. I. (1997) Shariah: The Islamic Law; Kuala Lumpur: Noordeen
8. Hay Lal, M. (1982) The Life of Muhammad (SAW), Academic Press
9. Lemu, A. (1992) Methodology of Primary Islamic Studies, Lagos: IPB
10. Lemu, A. (1993) Islamic Studies for SSS, Book 1, Lagos: IPB
11. Lemu, A. (1993) Islamic Studies for SSS, Books, Minna: IET
12. Muhammad, S. Q. (2010) al-Burhanu fi tajwīdil Qur’ān Cairo: Shirkatul-Qudus
13. Opeloye, M.O. (1996) A Dictionary of Peoples and Places in the Qur’ān, Lagos: Academic Press
14. Philips, A. A. B. (1997) Usool at-Tafseer, Kuala Lumpur: Noordeen
15. Quadri, Y.A. et al (1990) Al-Iziyyah for the English Audience, Ijebu Ode: Shebiotiuom Publication
16. Rahim, A. (1992) Islamic History, Lagos: IPB
17. Sambo, M.B. et al (1984) Islamic Religious Knowledge for WASC Book 1, Lagos: IPB
18. Sambo, M.B. et al (1984) Islamic Religious Knowledge for WASC Book 3, Lagos: IPB
19. Trimingham, J.S. (1993) A History of Islam in West Africa, Oxford, OUP`
    }
  ]
};

async function importIslamicStudies() {
  console.log('🕌 Starting Full JAMB Islamic Studies syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of ISLAMIC_STUDIES_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: ISLAMIC_STUDIES_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Maps and Images'
          }
        })
        .select();
      
      if (error) throw error;
      
      console.log(`✅ Imported: ${topic.name}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Failed: ${topic.name} - ${err.message}`);
      errorCount++;
    }
  }
  
  console.log(`\n📊 Islamic Studies Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${ISLAMIC_STUDIES_SYLLABUS.topics.length}`);
}

importIslamicStudies().catch(console.error);