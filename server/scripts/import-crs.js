require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED CHRISTIAN RELIGIOUS STUDIES SYLLABUS CONTENT
// Sourced verbatim from JAMB CRS Syllabus
const CRS_SYLLABUS = {
  subject: 'Christian Religious Studies',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Christian Religious Studies is to prepare the candidates for the Board’s examination. It is designed to test their achievement of the course objectives, which are to:
1. acquire the knowledge and understanding of the tenets of the Christian faith as contained in the Bible;
2. interpret biblical teachings and themes;
3. apply biblical teachings and tenets to life in society;
4. evaluate the level of application of biblical teachings and tenets to life in society.

The syllabus is divided into four sections, namely:
SECTION A: Themes from Creation to the Division of the Kingdom
SECTION B: Themes from the Division of the Kingdom to the Return from Exile and the Prophets
SECTION C: Themes from the four Gospels and Acts of the Apostles
SECTION D: Themes from selected Epistles`
    },
    {
      name: 'Section A: The Sovereignty of God',
      content: `TOPICS/CONTENTS/NOTES:
1. The Sovereignty of God
God as Creator and Controller of the Universe (Gen. 1 and 2) cf. Amos 9:5-6; Is. 45:5-12; Ps. 19:1-6, Jer 18: 1-16, Rom 8: 28)

OBJECTIVES:
Candidates should be able to:
i. define the term ‘sovereignty’;
ii. analyse God’s process of creation;
iii. interpret the sequence of creation;
iv. identify man’s role in advancing God’s purpose in creation.`
    },
    {
      name: 'Section A: The Covenant',
      content: `TOPICS/CONTENTS/NOTES:
2. The Covenant
(a) The flood and God’s covenant with Noah (Gen. 6:1-22; 7:1-24; 9:1-17)
(b) God’s covenant with Abraham (Gen. 11:31-32; 12:1-9; 17:1-21; 21:1-13; 25:19-26)
(c) God’s covenant with Israel (Ex. 19; 20; 24:1-11) cf. Deut. 28:1-19 

[Image of map of the Exodus route]

(d) The New Covenant (Jer. 31:31-34; Ezek 36:25-28)

OBJECTIVES:
Candidates should be able to:
i. explain the concept of covenant;
ii. examine the importance and implication of the covenants;
iii. distinguish between God’s covenants with Noah, Abraham and Israel;
iv. Distinguish between the old and the new covenants.`
    },
    {
      name: 'Section A: Leadership Qualities',
      content: `TOPICS/CONTENTS/NOTES:
3. Leadership Qualities
Examples of
(a) Joseph (Gen. 37:1-28; 41:1-57; 45:1-15)
(b) Moses (Ex. 1; 2; 3; 4:1-17; 5; 12; Num. 13:1-20; 14:1-19)
(c) Joshua (Num. 13:21-33; 27:15-23; Josh. 1:1-15; 6; 7; 24:1-31)
(d) Judges (Deborah - Judges. 4:1-24; Gideon: Judges 6:11-40; Samson: Judges 13:1-7, 21-25; 16:4-31)

OBJECTIVES:
Candidates should be able to:
i. examine the circumstances that gave rise to the leadership of Joseph, Moses, Joshua and the Judges;
ii. identify the major talents of these leaders;
iii. assess God’s role in the works of these leaders;
iv. analyse the achievements of these leaders.`
    },
    {
      name: 'Section A: Divine Providence, Guidance and Protection',
      content: `TOPICS/CONTENTS/NOTES:
4. Divine Providence, Guidance and Protection
(a) Guidance and Protection (Gen. 24:1-61; 28:10-22; 46:1-7: Ex. 13:17-22; 14:1-4; 10-31)
(b) Provision (Gen. 21:14-18; 22:1-14; Ex. 16:1-21; 17:1-7; Num. 20:1-13; 1 Kings 17:1-16)

OBJECTIVES:
Candidates should be able to:
i. identify the different ways by which God guided and protected the people of Israel;
ii. specify how God provided for His people;
iii. identify the different occasions when God provided for Israel.`
    },
    {
      name: 'Section A: Parental Responsibility',
      content: `TOPICS/CONTENTS/NOTES:
5. Parental Responsibility
Examples of
(a) Eli and Samuel (1 Sam. 2:11-36; 3:2-18; 4:10-22: 8:15)
(b) David (11 Sam. 13; 15:1-29; 18; 19:1-8)
(c) Asa (1 Kings 15:9-15; 22:41-44; cf. Deut. 6:4-9; Prov. 4:1-10; 13:1; 24; 22:6; 23:13-14; 31:10-31)

OBJECTIVES:
Candidates should be able to:
i. determine the extent to which Eli, Samuel and David were responsible for the short-comings of their children:
ii. describe how Asa pleased God.`
    },
    {
      name: 'Section A: Obedience and Disobedience',
      content: `TOPICS/CONTENTS/NOTES:
6. Obedience and Disobedience
(i) Obedience and Rewards: Examples of
(a) Abraham (Gen. 22:1-19)
(b) Three Hebrew youth (Dan 3:1-30)
(c) David (1 Sam. 30:1-20)
(ii) Disobedience and Consequences: Examples of
(a) Adam (Gen. 2:15-25; 3)
(b) Collection of Manna (Ex. 16:22-30)
(c) The Golden Calf (Ex. 32)
(d) Moses (Num. 20:7-12; Deut. 34:1-6)
(e) Saul (1 Sam. 10:1-16; 15:1-25; 16:14-23; 31:1-13)

OBJECTIVES:
Candidates should be able to:
i. determine why Abraham, the three Hebrew youths and David obeyed God;
ii. identify the rewards for obedience.
iii. compare the disobedience of Adam, the people of Israel, Moses and Saul;
iv. indicate the reasons for their disobedience;
v. identify the consequences of disobedience.`
    },
    {
      name: 'Section A: A man after God’s own heart',
      content: `TOPICS/CONTENTS/NOTES:
7. A man after God’s own heart
(a) The early life of David (1 Sam. 16:1-13; 17; 18:17-30; 22:1-5; 24:1-23; II Sam. 2:1-7; 3:1-39)
(b) David’s submission to the will of God (I Sam. 26:1-25, II Sam 12:15-25)
(c) David’s repentance and forgiveness (II Sam. 11; 12:1-15, cf. Ps. 51:130)

OBJECTIVES:
Candidates should be able to:
i. identify David’s anointing experience;
ii. specify how David submitted to the will of God;
iii. examine the situations that led to David’s sin and repentance;
iv. identify why God forgave David.`
    },
    {
      name: 'Section A: Decision - Making',
      content: `TOPICS/CONTENTS/NOTES:
8. Decision - Making
(a) Reliance on a medium (I Sam. 28:3-25)
(b) The wisdom of Solomon (I Kings 3:3-28; 4:29-34; 5:1-12; 8:1-53)
(c) Unwise policies of Solomon and Rehoboam (I Kings 9:15-23; 11:1-40; 12:1-20) 

OBJECTIVES:
Candidates should be able to:
i. identify the source of Solomon’s wisdom;
ii. compare the different ways used by Saul and Solomon in making decisions;
iii. analyse the decisions made by Saul, Solomon and Rehoboam.
iv. assess the consequences of Solomon and Rehoboam’s unwise decisions.`
    },
    {
      name: 'Section B: Greed and its effects',
      content: `TOPICS/CONTENTS/NOTES:
1. Greed and its effects
Examples of
(a) Ahab (I Kings 21:1-29; 22:1-40; II Kings 9:30-37)
(b) Gehazi (II Kings 5:1-27 cf Josh 7)

OBJECTIVES:
Candidates should be able to:
i. deduce the meaning of greed;
ii. distinguish between Ahab and Gehazi’s greed;
iii. analyse the consequences of Ahab and Gehazi’s greed.`
    },
    {
      name: 'Section B: The Supremacy of God',
      content: `TOPICS/CONTENTS/NOTES:
2. The Supremacy of God
Religious tension and the power of God on Mount Carmel (I Kings 16:29-34; 17:1-7; 18; 19:1-18)

OBJECTIVES:
Candidates should be able to:
i. assess the religious situation in Israel at the time of Elijah and Ahab;
ii. identify the characters involved in the contest on Mount Carmel;
iii. differentiate between God’s power and that of Baal.`
    },
    {
      name: 'Section B: Religious reforms in Judah',
      content: `TOPICS/CONTENTS/NOTES:
3. Religious reforms in Judah
(a) Cleansing of the Temple (II Kings 22)
(b) Renewal of the Covenant (II Kings 23:1-30)

OBJECTIVES:
Candidates should be able to:
i. analyse Josiah’s religious reforms;
ii. determine the reasons for the renewal of the covenant;
iii. assess the significance of the reforms.`
    },
    {
      name: 'Section B: Concern for Judah',
      content: `TOPICS/CONTENTS/NOTES:
4. Concern for Judah
(a) The fall of Jerusalem (II kings 24; 25:1-17)
(b) Condition of Judah (Neh. 1:1-11; Ezra 1:1-11)
(c) Response to the state of Judah (Neh. 2; 4:1-23 Ezra 3:4; 5; 6; 7)

OBJECTIVES:
Candidates should be able to:
i. identify the reasons for the fall of Jerusalem;
ii. examine the condition of Judah during the exile;
iii. analyse the people’s response to the call of Nehemiah and Ezra to rebuild Jerusalem;
iv. distinguish between Nehemiah and Ezra’s responses to the opposition of their enemies.`
    },
    {
      name: 'Section B: Faith, Courage and Protection',
      content: `TOPICS/CONTENTS/NOTES:
5. Faith, Courage and Protection
Examples of Daniel, Shadrach, Meshach and Abednego (Dan. 3:1-30: 6:1-28)

OBJECTIVES:
Candidates should be able to:
i. analyse the stories of Shadrach, Meshach, Abednego and Daniel;
ii. determine the occasions in which the four men demonstrated faith;
iii. analyse the effects of the faith of the four men on the Babylonians.`
    },
    {
      name: 'Section B: God’s message to Nineveh',
      content: `TOPICS/CONTENTS/NOTES:
6. God’s message to Nineveh
Jonah and his message (Jonah 1; 2; 3 and 4)

OBJECTIVES:
Candidates should be able to:
i. analyse the story of Jonah’s call;
ii. describe the consequences of Jonah’s disobedience;
iii. assess the effect of Jonah’s message on the Ninevites;
iv. emulate the example of the Ninevites.`
    },
    {
      name: 'Section B: Social justice, True religion and Divine love',
      content: `TOPICS/CONTENTS/NOTES:
7. Social justice, True religion and Divine love
(a) Social justice and true religion (Amos 2:6-8; 4; 5:1-25; 6:1-14; 7:10-17; 8:4-14) cf James 1:19-27
(b) Divine love and human response (Hosea 1; 2; 3; 4; 6:1-11; 14)

OBJECTIVES:
Candidates should be able to:
i. determine what true religion is;
ii. identify the ills that led to the call for social justice in Amos’ time;
iii. examine the condition in Israel during Hosea’s time;
iv. analyse Hosea’s portrayal of divine love and human response.`
    },
    {
      name: 'Section B: Holiness and Divine call',
      content: `TOPICS/CONTENTS/NOTES:
8. Holiness and Divine call
(Isaiah 6:1-13; Ezek. 2; 3:1-11; Jer. 1:4-10)

OBJECTIVES:
Candidates should be able to:
i. distinguish the calls of Isaiah, Ezekiel and Jeremiah;
ii. compare the assignments given to these prophets;
iii. determine the need for God’s people to be holy.`
    },
    {
      name: 'Section B: Punishment and Hope',
      content: `TOPICS/CONTENTS/NOTES:
9. Punishment and Hope
(Jer. 3:11-18; 32:26-35; Ezek. 18; 37:1-14; Isaiah 61, Jer 4: 5-8)

OBJECTIVES:
Candidates should be able to:
i. describe the situations that led to the punishment of Israel;
ii. identify the conditions for hope;
iii. determine the benefits of restoration.`
    },
    {
      name: 'Section C: Birth and Early Life of Jesus',
      content: `TOPICS/CONTENTS/NOTES:
1. The birth and early life of Jesus
(a) John, the forerunner of Jesus (Lk. 1:5-25; 57-66; 3:1-20; 7:18-35; Mk. 1:1-8; 6:14-29; Mt. 3:1-12: Matt.11:2-19; Jn. 1:6-8; 19-37; 3:22-36)
(b) The birth and boyhood of Jesus (Mt. 1:18-25; 2; Lk. 1:26-45;2 ) 

[Image of map of Palestine in the time of Jesus]


OBJECTIVES:
Candidates should be able to:
i. compare the stories of the births of John and Jesus;
ii. assess the importance of John as the forerunner of Jesus;
iii. describe the boyhood of Jesus.`
    },
    {
      name: 'Section C: Baptism and Temptation of Jesus',
      content: `TOPICS/CONTENTS/NOTES:
2. The baptism and temptation of Jesus
(Mt. 3:13-17; 4:1-11; Mk. 1:9-13; Lk. 3:21-22; 4:1-13)

OBJECTIVES:
Candidates should be able to:
i. determine the meaning and purpose of the baptism of Jesus
ii. enumerate the temptations of Jesus;
iii. examine the significance of the temptations of Jesus.`
    },
    {
      name: 'Section C: Discipleship',
      content: `TOPICS/CONTENTS/NOTES:
3. Discipleship
(a) The call of the first disciples (Mt. 4:18-22; 9:9-13; Mk. 1:16-20; 2:13-17; Lk. 5:1-11; 27-32)
(b) The demands of discipleship (Mt. 8:19-22; Lk. 9:57-63; 14:25-33)

OBJECTIVES:
Candidates should be able to:
i. identify the first disciples to be called by Jesus;
ii. determine the demands of discipleship;`
    },
    {
      name: 'Section C: Miracles',
      content: `TOPICS/CONTENTS/NOTES:
4. Miracles
(a) Nature miracles
(i) Stilling the storm (Mt. 8:23-27; Mk. 4:35-41; Lk.8:22-25)
(ii) Feeding of the five thousand (Mt. 14:13-24; Mk. 6:30-44; Lk. 9:10-17; Jn. 6:1-13)
(iii) Walking on the sea (Mt. 14:22-26; Mk. 6:45-52; Jn. 6:16-21)
(iv) Changing water to wine (Jn. 2:1-11)
(b) Miracles of resuscitation
(i) The raising of Lazarus (Jn. 11:1-45)
(ii) The raising of Jairus’ daughter (Lk. 8:41-42, 49-56; Mk. 5:21-43)
(iii) The raising of the widow’s son at Nain (Lk. 7:11-17)
(c) Healing miracles
(i) The lepers (Mt. 8:1-4; Mk. 1:40-45; Lk. 5:12-16; 17:11-19)
(ii) The paralytic at the pool (Jn. 5:1-17)
(iii) The centurion’s servant (Mt. 8:5-13; Lk. 7:1-10)
(iv) The blind (Jn. 9:1-12; Mk. 10:46-52; Lk. 18:35-43)
(d) Exorcism
(i) The Gerasene (Gadarene) demoniac (Mt. 8:28-34; Mk. 5:1-20; Lk. 8:26-39)
(ii) The epileptic boy (Mk. 9:14-29; Lk. 9:37-43a; Mt. 17:14-21)

OBJECTIVES:
Candidates should be able to:
i. classify the different miracles of Jesus;
ii. indicate the occasion of each of the miracles;
iii. examine the significance of each of the miracles;`
    },
    {
      name: 'Section C: The Parables',
      content: `TOPICS/CONTENTS/NOTES:
5. The Parables
(a) Parables of the kingdom
(i) The sower (Mt. 13:1-23; Mk. 4:1-20)
(ii) The weeds (Mt. 13:24-30; 36-43)
(iii) The drag-net (Mt. 13:47-50)
(iv) The wedding garment (Matt. 22:1-14)
(b) Parables about love of God (Mt. 18:12-14; Lk. 15:1-32)
(c) Parables about love for one another (Lk.10:25-37; 16:19-31)
(d) Parable about wealth: The rich fool (Lk. 12:13-21)
(e) Parables on prayer (Lk. 18:2-14)

OBJECTIVES:
Candidates should be able to:
i. classify the different parables of Jesus;
ii. identify the occasion of each parable;
iii. interpret the meaning of each parable;
iv. give reasons why Jesus taught in parables.`
    },
    {
      name: 'Section C: Sermon on the Mount',
      content: `TOPICS/CONTENTS/NOTES:
6. Sermon on the Mount
(Mt. 5; 6; Lk. 6:17-26)

OBJECTIVES:
Candidates should be able to:
i. analyse the teachings on the Mount;
ii. identify the demands of the Kingdom;
iii. determine the consequences of placing worldly possessions above heavenly treasures;
iv. associate the rewards for obedience with the sermon on the Mount.`
    },
    {
      name: 'Section C: Mission of the disciples',
      content: `TOPICS/CONTENTS/NOTES:
7. Mission of the disciples
(a) The mission of the twelve (Mt. 10:5-15; Mk. 6:7-13; Lk. 9:1-16) 
(b) The mission of the seventy (Lk. 10:1-24)

OBJECTIVES:
Candidates should be able to:
i. distinguish between the mission of the twelve and the seventy;
ii. specify the instructions to the disciples;
iii. assess the outcomes of the missions.`
    },
    {
      name: 'Section C: The Great Confession and Transfiguration',
      content: `TOPICS/CONTENTS/NOTES:
8. The Great Confession (Mt. 16:13-20; Mk. 8:27-30; Lk. 9:18-22)
9. The Transfiguration (Mt. 17:1-13; Mk. 9:2-13; Lk. 9:28-36)

OBJECTIVES:
Candidates should be able to:
i. analyse the confession by Peter;
ii. identify the occasion of the Great Confession;
iii. examine the significance of the Great Confession.
iv. trace the events leading to the Transfiguration;
v. determine the significance of the Transfiguration to the disciples;
vi. identify the personalities involved in the Transfiguration account.`
    },
    {
      name: 'Section C: Triumphal Entry, Last Supper, Trials and Death',
      content: `TOPICS/CONTENTS/NOTES:
10. The Triumphal Entry and the cleansing of the Temple (Mt. 21:1-17; Mk. 11:1-19; Lk. 19:29-48)
11. The Last Supper (Mt. 26:17-30; Mk. 14:10-26; Lk. 22:7-23; Jn. 13:2-38)
12. The trials and the death of Jesus
(a) The trials of Jesus before (i) the High Priest (Mt. 26:36-75; Mk. 14:53-72; Lk. 22:66-71) (ii) Pilate (Mt. 27:11-26; Mk. 15:1-15; Lk. 23:1-5; 13-25; Jn. 18:28-40; 19:1-16) (iii) Herod (Lk. 23:6-12)
(b) Crucifixion and burial of Jesus (Mt. 27:32-66; Lk. 23:26-56; Mk. 15:16-47; Jn. 19:17-42)

OBJECTIVES:
Candidates should be able to:
i. recount the Triumphal Entry and the cleansing of the Temple;
ii. determine the significance of the Triumphal Entry and the cleansing of the Temple;
iii. examine how the cleansing of the Temple caused hostility towards Jesus.
iv. trace the story of the Last Supper;
v. evaluate the significance of the Last Supper.
vi. analyse the different trials of Jesus;
vii. describe the crucifixion and burial of Jesus;
viii. deduce the lessons of the death of Jesus.`
    },
    {
      name: 'Section C: Resurrection, Appearances and Teachings',
      content: `TOPICS/CONTENTS/NOTES:
13. Resurrection, appearances and ascension of Jesus (Mt. 28:1-20; Mk. 16:1-20; Lk. 24:1-53; Jn. 20:1-31; Acts 1:1-11)
14. Jesus’ teachings about Himself
(a) The Bread of Life and the Living Water (Jn. 4:7-15; 6:25-58)
(b) The Light of the World (Jn. 1:4-8; 3:19-21; 8:12; 9:1-5; 12:35-36; 1 Jn. 1:5-7)
(c) The Door, the Lamb and the Good Shepherd (Jn. 1:29-34; 10:1-18)
(d) The True Vine (Jn. 15:1-11)
(e) The Resurrection (Jn.11:25)
15. Love
(a) God’s love for man (Jn. 3:16-18)
(b) Love for one another (Jn. 13:34-35; 15:12-13 cf. I Jn. 4:7-21, 1Cor 13)

OBJECTIVES:
Candidates should be able to:
(i) trace the stories of the resurrection, appearances and ascension of Jesus;
(ii) compare the personalities involved in the stories;
(iii) analyse the relevance of the resurrection and ascension of Jesus.
(iv) analyse the different teachings of Jesus about Himself;
(v) deduce the reasons for Jesus’ teachings about Himself;
(vi) interpret the meanings of the symbols used by Jesus about Himself.
(vii) describe God’s love for man;
(viii) specify the ways they can love one another;
(ix) evaluate the significance of love.`
    },
    {
      name: 'Section C: The Early Church',
      content: `TOPICS/CONTENTS/NOTES:
16. Fellowship in the Early Church
(a) Communal living (Acts 1:15-26; 2:41-47; 4:32-37)
(b) Problems of communal living and solutions (Acts 5:1-11, 6:1-6)
17. The Holy Spirit and the mission of the Church
(a) The Pentecost (Acts 1:8; 2:1-41)
(b) The mission of the Church (Acts 8:4-40)
18. Opposition to the Gospel message
(a) The arrest and imprisonment of Peter and John (Acts 3; 4:1-22; 5:17-42 12:1-24)
(b) The martyrdom of Stephen (Acts 6:8-15; 7)
(c) Persecution by Saul (Acts 8:1-3; 9:1-2 cf. Gal. 1:11-17)
(d) Persecution of Paul (Acts 16:11-40; 19:23- 41;21:27-36 cf 2 Cor:11:23-33)

OBJECTIVES:
Candidates should be able to:
(i) identify the reasons for communal living in the Early Church;
(ii) identify the problems of communal living and their solutions;
(iii) examine how communal living helped the growth of the Early Church.
(iv) trace the story of the Pentecost;
(v) examine the significance of the Pentecost experience;
(vi) analyse the mission of the Church.
(vii) trace the story of the arrest and imprisonment of Peter and John;
(viii) trace the events that led to the martyrdom of Stephen;
(ix) describe the role of Saul in the persecution of the Church;
(x) evaluate the importance of persecution to the growth of the Church.
(xi) account for the persecution of Paul.`
    },
    {
      name: 'Section C: Mission to the Gentiles',
      content: `TOPICS/CONTENTS/NOTES:
19. Mission to the Gentiles
(a) Conversion of Saul (Acts 9:1-30; 22:4-21; 26:9-18)
(b) Conversion of Cornelius (Acts 10:1-48)
(c) The commissioning and mission of Paul (Acts 13; 14:1-20) 
(d) The Council of Jerusalem (Acts 15:1-35; Gal. 2:1-21)

OBJECTIVES:
Candidates should be able to:
(i) compare the conversions of Saul and Cornelius;
(ii) analyse the commissioning and mission of Paul;
(iii) examine the main decisions at the Council of Jerusalem;
(iv) identify the personalities involved at the Council of Jerusalem;
(v) examine the relevance of the main decisions at the Council of Jerusalem;
(vi) assess Paul’s role in the mission to the Gentiles.`
    },
    {
      name: 'Section D: Justification, Law and Grace',
      content: `TOPICS/CONTENTS/NOTES:
1. Justification by Faith (Rom. 3:21-24; 5:1-11; 10:1-13; Gal 2:16-21)
2. The Law and Grace (Rom. 4:13-25; 5:18-21; Gal. 3:10-14; 19-29; Rom 3:24)
3. New life in Christ (Rom. 6:1-4; 12-14; Col. 3:1-17; Gals. 5:16-26; II Cor. 5:16-19; I Thess. 4:1-8; Rom. 12)
4. Christians as joint heirs with Christ (Gal. 3:23-29; 4:1-7)

OBJECTIVES:
Candidates should be able to:
(i) interpret the phrase ‘justification by faith’;
(ii) identify the basic conditions for justification;
(iii) determine the fruits of justification.
(iv) examine the purpose and significance of the law and grace;
(v) identify the place of the Law among the Jews.
(vi) describe the characteristics of the old life;
(vii) analyse the new life in Christ;
(viii) identify the conditions of the new life;
(ix) examine the benefits of the new life.
(x) describe how Christians are joint heirs with Christ;
(xi) indicate the benefits of being joint heirs with Christ.`
    },
    {
      name: 'Section D: Christian Virtues and Responsibilities',
      content: `TOPICS/CONTENTS/NOTES:
5. Humility (Phil. 2:1-11; I Pet. 5:5-11; James 4:10; Matt 23:12)
6. Forgiveness (Philemon; II Cor. 2:5-11; Matt 7:14-15)
7. Spiritual gifts (I Cor. 12; Rom. 12:3-18; I Cor. 14)
8. Christian Giving (Phil. 4:14-20; II Cor. 8:1-5; 9 Cf. Matt 6:2-4)
9. Civic responsibility (Rom. 13; I Tim. 2:1-4: 1Peter 2:13-17)
10. Dignity of labour (II Thess. 3:6-15; Col. 3:23-25; Matt 20:1-16)

OBJECTIVES:
Candidates should be able to:
(i) determine the meaning of humility;
(ii) identify the requirements of humility;
(iii) identify the rewards of humility.
(iv) analyse Paul’s teaching on forgiveness;
(v) assess the benefits of forgiveness.
(vi) identify the different spiritual gifts;
(vii) analyse the benefits of spiritual gifts to the individual and the church.
(viii) interpret the concept of Christian giving;
(ix) relate the teachings of Paul on Christian giving.
(x) identify the importance of Christian giving.
(xi) identify the need for obedience to authority;
(xii) specify the requirements of good citizenship.
(xiii) interpret the concept of dignity of labour;
(xiv) analyse the benefits of labour.`
    },
    {
      name: 'Section D: Christian Living and Social Issues',
      content: `TOPICS/CONTENTS/NOTES:
11. The second coming of Christ
a) The signs of the Coming of Christ (1 Thess. 4:13-18; II Thess. 2:1-12)
b) Preparation for His coming (I Thess. 5:1-11; II Pet. 3:1-13; Matt 25:31-46)
12. Impartiality (James 2:1-13; Luke 6:3; Acts 10:34-35; Matt 7:1-5)
13. Effective prayer (James 1:2-8; 4:1-3; 5:13-18 cf. Matt 6:5-13)
14. Christian living in the community 
(a) Interpersonal relationships among Christians (I Pet. 5:1-4; Rom. 12:3-21; 2 Pet. 1:3-11; Heb.13:1-21)
(b) Christians living among non- Christians (I Pet. 2:3-25; Rom. 15:1-2)
(c) Christian attitude to persecution (I Pet. 1:5-9; 4:1-19; 1 Pet. 3:13-22)
(d) Relationship in the Christian family (Eph. 6: 1-9; Col. 3:18-21; I Pet. 3:1-7)
15. Corruption (1 Tim 6:6-11; 2 Tim 3:8; 2 Pet. 1:4-11; James 5:1-6)
16. Sexual Immorality
(a) Prostitution (1Cor.6:16-20 cf. Prov.7:10-27;23:27-28)
(b) Adultery and Fornication (Heb. 13:4, Eph. 5:3-10 cf. Matt 5:28-32; Deut. 22:22; Lev. 20:10)
(c) Homosexuality (Rom. 1:24-32 cf. Lev.18:21-30; 20:13)

OBJECTIVES:
Candidates should be able to:
(i) identify the signs of the Second Coming of Christ;
(ii) specify the preparations for His coming;
(iii) indicate what will happen during His Second Coming;
(iv) examine the importance of His coming.
(v) interpret the concept of impartiality;
(vi) identify causes of partiality
(vii) examine the consequences of partiality.
(viii) identify the requirements of effective prayer;
(ix) distinguish between effective and ineffective prayer;
(x) identify the importance of prayer.
(xi) determine interpersonal relationships among Christians;
(xii) analyse Christian living among non-Christians;
(xiii) relate Christian attitude to persecution;
(xiv) determine the relationship in the Christian family;
(xv) examine the importance of maintaining good relationships.
(xvi) define the term corruption;
(xvii) identify the causes of corruption;
(xviii) determine the effects and consequences of corruption;
(xix) identify ways of curbing corruption.
(xx) identify what constitute sexual immorality;
(xxi) determine the causes of sexual immorality;
(xxii) examine the effects and consequences of sexual immorality;
(xxiii) identify ways of curbing sexual immorality.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Adetunji, P.G. et al (2000) Exam Focus Christian Religious Knowledge for WASSCE and SSCE Ibadan: University Press Plc.
2. Adeyemo, I. O. et al (1998) Christian Religious Knowledge for Secondary Schools Books1 – 3, Ibadan: Onibonoje
3. Adeyinka, A. A. et al (1991) Christian Religious Knowledge for Senior Secondary Schools, Book 1 – 3, Lagos: Longman.
4. Adigwe, H.A et al (2004) Christian Religious Knowledge for Senior Secondary Schools. Onitsha. Africana Publishers.
5. Aghaeghuna, E. O. N. (1988) Senior Secondary School Christian Religious Knowledge: Themes from Selected Epistles, Vol 1 – III, Awka, Jet Publishers.
6. Dopamu, A. et al (1990) Christian Religious Knowledge for Senior Secondary Schools Books 1 – 3, Lagos: Nelson.
7. Ilori, J. A. et al (1980) Christian Religious Knowledge for Senior Secondary Schools Books 1 – 3, Ibadan: Evans.
8. Izuchukwu, A.E. et al (1997) Round-Up for Senior Secondary Certificate Examination Christian Religious Knowledge: A Complete Guide. Lagos: Longman.
9. Throckmorton, B.H, Jr. (ed) (1966) Gospel Parallels: A Synopsis of the First Three Gospels. New York; Thomas Nelson.
10. THE BIBLE: Revised Standard Version, Stonechill Green: Bible Society Publishing House (1971).`
    }
  ]
};

async function importCRS() {
  console.log('✝️ Starting Full JAMB CRS syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of CRS_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: CRS_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Maps'
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
  
  console.log(`\n📊 CRS Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${CRS_SYLLABUS.topics.length}`);
}

importCRS().catch(console.error);