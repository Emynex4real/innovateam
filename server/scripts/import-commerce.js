require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED COMMERCE SYLLABUS CONTENT
// Sourced verbatim from JAMB Commerce Syllabus
const COMMERCE_SYLLABUS = {
  subject: 'Commerce',
  topics: [
    {
      name: 'Commerce: Meaning and Scope',
      content: `TOPICS/CONTENTS/NOTES:
1. Commerce
(i) Meaning and scope 
(ii) Characteristics
(iii) Functions

OBJECTIVES:
Candidates should be able to:
(i) differentiate between Commerce and other related subjects;
(ii) describe the characteristics of Commerce;
(iii) Identify the functions of Commerce.`
    },
    {
      name: 'Occupation',
      content: `TOPICS/CONTENTS/NOTES:
2. Occupation
(i) Meaning and importance
(ii) Types (industrial, commercial and services) 
(iii) Factors that determine choice of occupation

OBJECTIVES:
Candidates should be able to:
(i) State the importance of occupation;
(ii) Compare the different types of occupation;
(iii) Identify the factors determining the choice of occupation.`
    },
    {
      name: 'Production',
      content: `TOPICS/CONTENTS/NOTES:
3. Production
(i) Factors, characteristics and rewards (land, labour, capital and entrepreneur)
(ii) Division of Labour and specialization
(iii) Types (primary, secondary and tertiary) 

[Image of stages of production]


OBJECTIVES:
Candidates should be able to:
(i) identify the Factors of Production and their rewards;
(ii) distinguish between Division of Labour and Specialization;
(iii) classify the types of production.`
    },
    {
      name: 'Trade: Home and Foreign',
      content: `TOPICS/CONTENTS/NOTES:
4. Trade
a. Home Trade
(i) Retail trade:
- Types of retailers
- Functions of retailers
- Factors to be considered in setting up retail trade
- Trends in retailing (branding, self-service, vending machines, the use of luncheon, fuel vouchers, etc)
- Advantages and disadvantages of retailers
(ii) Wholesale trade:
- Types of wholesalers (merchant, agent, general, etc)
- Functions of wholesalers
- Advantages and disadvantages of wholesalers 

[Image of channels of distribution]


b. Foreign trade
(i) Basic issues in foreign trade (balance of trade, balance of payments and counter trade)
(ii) Procedures and documents used in export, import and entrepôt trade 
(iii) Barriers to international trade
(iv) Role of Customs and Excise Authority, Ports Authority, etc in foreign trade

OBJECTIVES:
Candidates should be able to:
(i) compare the various types of retailers;
(ii) identify the functions of retailers;
(iii) highlight the factors in setting up retail trade;
(iv) classify modern retailing practices;
(v) identify the advantages and disadvantages of retail business;
(vi) classify the types of wholesalers;
(vii) discuss the functions of wholesalers;
(viii) outline the merits and demerits of the middleman;
(ix) analyse the basic issues in foreign trade;
(x) explain the procedures and documents used in foreign trade;
(xi) identify the barriers to international trade;
(xii) appraise the role of government agencies in foreign trade.`
    },
    {
      name: 'Purchase and Sale of Goods',
      content: `TOPICS/CONTENTS/NOTES:
5. Purchase and Sale of Goods
(i) Procedure and documentation (enquiry, quotation, order, invoice, proforma invoice, statement of accounts, indent, consular invoice, bill of lading, certificate of origin, consignment note, etc) 
(ii) Terms of trade (trade discount, quantity discount, cash discount, warranties, C.O.D., C.I.F., F.O.B., and E.O.E.etc)
(iii) Terms of payments
a. Cash - Legal tender
b. Credit
- Types and functions
- Merits and demerits

OBJECTIVES:
Candidates should be able to:
(i) examine the procedures and documents used in the purchase and sale of goods;
(ii) determine the terms of trade;
(iii) distinguish between cash and credit forms of payment;
(iv) identify the types of credit;
(v) analyse the merits and demerits of credit transactions.`
    },
    {
      name: 'Aids-to-trade',
      content: `TOPICS/CONTENTS/NOTES:
6. Aids-to-trade
a. Advertising:
(i) Types and media
(ii) Advantages and disadvantages
b. Banking:
(i) Types of bank
(ii) Services
(iii) Challenges
c. Communication:
(i) Process and procedure 

[Image of communication process diagram]

(ii) Types
(iii) Trends
(iv) Merits and demerits
(v) Barriers
d. Insurance:
(i) Types
(ii) Principles
(iii) Terms
(iv) Importance
e. Tourism:
(i) Importance
(ii) Agencies that promote tourism in Nigeria
(iii) Challenges
f. Transportation:
(i) Mode 
(ii) Importance
(iii) Advantages and disadvantages
g. Warehousing:
(i) Importance
(ii) Types and functions
(iii) Factors to be considered in siting a warehouse

OBJECTIVES:
Candidates should be able to:
(i) identify the different types of advertising and its media;
(ii) analyse the advantages and disadvantages of advertising;
(iii) categorize the different types of bank;
(iv) assess the services rendered by banks;
(v) identify the challenges facing banks;
(vi) assess the different stages in the communication process;
(vii) analyse the types of communication;
(viii) appraise the contributions of courier services, GSM, etc., to businesses;
(ix) state the merits and demerits of communication;
(x) outline the barriers to communication
(xi) describe the types of insurance;
(xii) apply the principles of insurance to life situations;
(xiii) explain the terms in insurance;
(xiv) state the importance of insurance;
(xv) examine the importance of tourism;
(xvi) identify the agencies that promote tourism in Nigeria;
(xvii) analyse the challenges facing tourism in Nigeria;
(xviii) appraise the relevance of the various modes of transportation;
(xix) list the importance of transportation;
(xx) discuss the advantages and disadvantages of transportation;
(xxi) highlight the importance of warehousing;
(xxii) appraise the contributions of warehouses to businesses.
(xxiii) evaluate the factors that determine the siting of warehouses.`
    },
    {
      name: 'Business Units',
      content: `TOPICS/CONTENTS/NOTES:
7. Business Units
(i) Forms and features (Sole Proprietorship, Partnership, Limited Liability Companies, Public Corporations, Cooperative Societies, etc.)
(ii) Registration of businesses
(iii) Business Mergers
(iv) Determination of choice of business units
(v) Dissolution and liquidation
(vi) Merits and demerits

OBJECTIVES:
Candidates should be able to:
(i) identify the forms and features of business units;
(ii) analyse the procedures for registering businesses;
(iii) appraise the different forms of business mergers and the reasons for merging;
(iv) examine the factors which determine the choice of business units;
(v) differentiate between dissolution and liquidation of business;
(vi) state the merits and demerits of business units.`
    },
    {
      name: 'Financing Business',
      content: `TOPICS/CONTENTS/NOTES:
8. Financing Business
(i) Sources of finance (personal savings, sale of shares and bonds, loans, debentures, mortgage, bank overdraft, ploughing back of profit, credit purchase, leasing, etc.)
(ii) Types of capital (share capital, capital owned, authorized capital, issued capital, called-up capital, paid-up capital, liquid capital, working capital and owners’ equity)
(iii) Calculation of forms of capital, profits (gross and net) and turnover
(iv) Problems of sourcing finance
(v) The role of Bureau de change in an economy

OBJECTIVES:
Candidates should be able to:
(i) identify the various ways of financing a business;
(ii) discuss the different types of capital
(iii) compute the different forms of capital, profits and turnover;
(iv) appraise the problems associated with sourcing finances for business;
(v) assess the role of Bureau de change in an economy.`
    },
    {
      name: 'Trade Associations',
      content: `TOPICS/CONTENTS/NOTES:
9. Trade Associations
(i) Objectives and functions of trade and manufacturer’s associations (Cocoa Farmers’ Association, Garri Sellers’ Association, Poultry Farmers’ Association, etc.)
(ii) Objectives and functions of Chambers of Commerce.

OBJECTIVES:
Candidates should be able to:
(i) discuss the objectives and functions of trade and manufacturer’s associations;
(ii) list the objectives and functions of Chambers of Commerce.`
    },
    {
      name: 'Money',
      content: `TOPICS/CONTENTS/NOTES:
10. Money
(i) Evolution
(ii) Forms and qualities
(iii) Functions

OBJECTIVES:
Candidates should be able to:
(i) discuss the origin of money;
(ii) analyse the forms and qualities of money;
(iii) appraise the functions of money.`
    },
    {
      name: 'Stock Exchange',
      content: `TOPICS/CONTENTS/NOTES:
11. Stock Exchange
(i) Importance and functions
(ii) Types of securities (stocks, shares, bonds, debentures, etc)
(iii) Procedure of transactions and speculations
(iv) Second-Tier Securities Market, (listing requirements, types of companies for the market, advantages and operating regulations of the market.)

OBJECTIVES:
Candidates should be able to:
(i) state the importance and functions of the Stock Exchange;
(ii) identify the different securities traded on the Stock Exchange;
(iii) analyse the procedure of transactions and speculations on the Stock Exchange;
(iv) appraise the advantages and operating regulations of the market.`
    },
    {
      name: 'Elements of Business Management',
      content: `TOPICS/CONTENTS/NOTES:
12. Elements of Business Management
(i) Functions (planning, organizing, staffing, coordinating, motivating, communicating, controlling etc.)
(ii) Principles (span of control, unity of command, delegation of authority, etc.)
(iii) Organizational structure (line, line and staff, functional, matrix and committee) 

[Image of organizational chart types]

(iv) Functional areas of business (production, marketing, finance and personnel)
(v) Business resources (man, money, materials, machines and opportunities/goodwill)

OBJECTIVES:
Candidates should be able to:
(i) appraise the functions of management;
(ii) analyse the principles of management;
(iii) identify organizational structures;
(iv) assess the functional areas of business;
(v) examine the business resources.`
    },
    {
      name: 'Elements of Marketing',
      content: `TOPICS/CONTENTS/NOTES:
13. Elements of Marketing
(i) Importance and Functions
(ii) The marketing concept (consumer orientation, customer satisfaction, integrated marketing, etc)
(iii) Marketing mix (product, price, place and promotion) 

[Image of marketing mix 4Ps diagram]

(iv) Market Segmentation
(v) Public relations and Customer Service.

OBJECTIVES:
Candidates should be able to:
(i) highlight the importance and functions of marketing;
(ii) discuss the marketing concept;
(iii) assess the elements of marketing mix;
(iv) explain market segmentation;
(v) examine public relations and customer service.`
    },
    {
      name: 'Legal Aspects of Business',
      content: `TOPICS/CONTENTS/NOTES:
14. Legal Aspects of Business
(i) Meaning and validity of a simple contract
(ii) Agency, Sale of Goods Act and Hire Purchase Act
(iii) Contract of employment
(iv) Government regulations of business (registration of business, patents, trademarks, copyrights, etc)
(v) Consumer protection (Government legislation, Standards Organization Trade Descriptions Act, Consumer Protection Council, NAFDAC, NDLEA, Customs and Excise, etc.)
(vi) Regulatory agencies.

OBJECTIVES:
Candidates should be able to:
(i) analyse the elements and validity of a simple contract;
(ii) examine Agency, Sale of Goods Act and Hire Purchase Act;
(iii) assess the rights and obligations of employers and employees;
(iv) distinguish between patents, trademarks and copyrights;
(v) identify the functions of consumerism;
(vi) assess the relevance of regulatory agencies and acts in the provision of safe goods and drugs.`
    },
    {
      name: 'Information and Communication Technology (ICT)',
      content: `TOPICS/CONTENTS/NOTES:
15. Information and Communication Technology (ICT)
a. Computer:
(i) Appreciation and application
(ii) Types and functions 

[Image of basic computer system block diagram]

(iii) Merits and demerits
(iv) Challenges
b. Terms (Internet, Intranet, browsing, password, e-mail, google, yahoo, search, Local Area Network, etc.)
c. Activities:
(i) e-commerce
(ii) e-banking
(iii) e-business

OBJECTIVES:
Candidates should be able to:
(i) discuss computer appreciation and application;
(ii) enumerate the types and functions of computer;
(iii) analyse the merits and demerits of ICT;
(iv) appraise the challenges of using the computer;
(v) identify the different terms used in ICT;
(vi) evaluate the trends in ICT.`
    },
    {
      name: 'Business Environment and Social Responsibility',
      content: `TOPICS/CONTENTS/NOTES:
16. Business Environment and Social Responsibility
(i) Legal, political, economic, social, cultural, technological environments, etc
(ii) Safe products, philanthropic and societal consideration
(iii) Types and implication of pollution (water, air, land, etc.)

OBJECTIVES:
Candidates should be able to:
(i) discuss the types of business environment;
(ii) assess the role of social environment in the provision of safe products;
(iii) identify the different types of pollution and their implications on businesses.`
    }
  ]
};

async function importCommerce() {
  console.log('💰 Starting Full JAMB Commerce syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of COMMERCE_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: COMMERCE_SYLLABUS.subject,
          topic: topic.name,
          content: topic.content,
          source_type: 'jamb_syllabus',
          is_active: true,
          metadata: {
            imported_at: new Date().toISOString(),
            source: 'JAMB Official Syllabus',
            exam_type: 'UTME',
            version: 'Full Verbatim Syllabus with Image Tags'
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
  
  console.log(`\n📊 Commerce Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${COMMERCE_SYLLABUS.topics.length}`);
}

importCommerce().catch(console.error);