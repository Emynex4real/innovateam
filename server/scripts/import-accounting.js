require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY
);

// FULLY DETAILED PRINCIPLES OF ACCOUNTS SYLLABUS CONTENT
// Sourced verbatim from JAMB Principles of Accounts Syllabus
const ACCOUNTS_SYLLABUS = {
  subject: 'Principles of Accounts',
  topics: [
    {
      name: 'General Objectives',
      content: `GENERAL OBJECTIVES:
The aim of the Unified Tertiary Matriculation Examination (UTME) syllabus in Principles of Accounts is to prepare the candidates for the Board’s examination. It is designed to test their achievement of the course objectives, which are to:
1. Stimulate and sustain their interest in Principles of Accounts;
2. Use the basic knowledge of and practical skills in Accounting;
3. Apply the knowledge and interpretation of accounting information to decision making;
4. Determine the relevance of accounting information to business and governments;
5. Use information and communication technology for present and future challenges.
6. Use current accounting principles in financial reporting.`
    },
    {
      name: 'Nature and Significance of Book keeping and Accounting',
      content: `TOPICS/CONTENTS/NOTES:
1. Nature and Significance of Book keeping and Accounting
a. Development of Accounting (including branches of accounting)
b. Objectives of Book Keeping and accounting
c. Users and characteristics of Accounting information
d. Principles, concepts and conventions of Accounting (nature, significance and application)
e. Role of Accounting records and information

OBJECTIVES:
Candidates should be able to:
i. differentiate between Book Keeping and Accounting;
ii. understand the historical background of Book Keeping and Accounting;
iii. apply the right principles, concepts and conventions to solving Accounting problems;
iv. understand the role of Accounting information in decision making;
v. identify the types/branches of Accounting such as Cost Accounting, Management Accounting, Auditing, Financial Accounting, Forensic Accounting, Social and Environmental Accounting, Government Accounting and Taxation.`
    },
    {
      name: 'Principles of Double Entry',
      content: `TOPICS/CONTENTS/NOTES:
2. Principles of Double Entry
a. Source documents 
b. Books of original entry
c. Accounting equation
d. Ledger and its classifications 

[Image of T-account ledger format]

e. Trial balance
f. Types and correction of errors
g. Suspense Account

OBJECTIVES:
Candidates should be able to:
i. identify various source documents and their uses;
ii. relate source documents to the various books of original entry;
iii. determine the effect of changes in elements of Accounting equation;
iv. understand the role of double entry principles in treating financial transactions;
v. extract a trial balance from ledger accounts;
vi. identify various types of errors and their corrections; and
vii. correct errors using suspense account.`
    },
    {
      name: 'Ethics in Accounting',
      content: `TOPICS/CONTENTS/NOTES:
3. Ethics in Accounting
a. Objectives
b. Qualities of an Accountant

OBJECTIVES:
Candidates should be able to:
i. understand the ethics required in preparing and presenting Accounting information;
ii. understand qualities of an Accountant such as honesty, integrity, transparency, accountability and fairness.`
    },
    {
      name: 'Cash Book',
      content: `TOPICS/CONTENTS/NOTES:
4. Cash Book
a. Columnar Cash Books:
i. single column
ii. double column
iii. three column 
b. Discounts
c. Petty Cash Book and imprest system

OBJECTIVES:
Candidates should be able to:
i. determine the cash float;
ii. differentiate between two and three columnar cash books and how transactions are recorded in them;
iii. differentiate between trade and cash discounts;
iv. examine the effects of trade and cash discounts in the books of accounts; and
v. identify various petty cash expenses.`
    },
    {
      name: 'Bank Transactions and Reconciliation Statements',
      content: `TOPICS/CONTENTS/NOTES:
5. Bank Transactions and Reconciliation Statements
a. Instrument of bank transactions
b. e-banking system
c. Causes of discrepancies between cash book and bank statement
d. Bank reconciliation statement 

OBJECTIVES:
Candidates should be able to:
i. identify various instruments of bank transactions such as cheques, pay-in-slips, credit cards, debit cards, internet banking and their uses;
ii. assess the impact of automated credit system, credit transfers, interbank transfers and direct debit on cash balances;
iii. identify factors that cause discrepancies between cash book balance and bank statement; and
iv. determine adjusted cash book balance.`
    },
    {
      name: 'Final Accounts of a Sole Trader',
      content: `TOPICS/CONTENTS/NOTES:
6. Final Accounts of a Sole Trader
a. Income statement (Trading and profit and loss account) 

[Image of income statement format]

b. Statement of financial position (Balance sheet)
c. Adjustments:
i. provision for bad and doubtful debt
ii. provision for discounts
iii. provision for depreciation using straightline and reducing balance methods
iv. accruals and prepayment

OBJECTIVES:
Candidates should be able to:
i. determine the cost of sales, gross profit and net profit of a sole trader;
ii. identify non-current assets, current assets, long- term liabilities, current liabilities and proprietor’s capital;
iii. compute adjustable items on the related expenditure and income in the statement of profit or loss; and
iv. differentiate between bad debts and provision for bad and doubtful debts.`
    },
    {
      name: 'Stock Valuation',
      content: `TOPICS/CONTENTS/NOTES:
7. Stock Valuation
a. Methods of stock valuation e.g FIFO, LIFO and simple average
b. Advantages and disadvantages of the methods
c. The importance of stock valuation

OBJECTIVES:
Candidates should be able to:
i. determine the value of materials issued to production department using FIFO, LIFO and simple average;
ii. calculate the closing stock of materials or finished goods using FIFO, LIFO and simple average;
iii. compare the advantages and disadvantages of each method of stock valuation; and
iv. determine the effects of stock valuation on elements of income statement.`
    },
    {
      name: 'Control Accounts and Self balancing ledger',
      content: `TOPICS/CONTENTS/NOTES:
8. Control Accounts and Self balancing ledger
a. Meaning and uses of control accounts
b. Purchases ledger control account
c. Sales ledger control account 

OBJECTIVES:
Candidates should be able to:
i. understand the meaning of control accounts;
ii. identify the uses of control accounts in a business enterprise;
iii. differentiate between sales ledger control account and purchases ledger control account; and
iv. identify the entries in control accounts.`
    },
    {
      name: 'Incomplete Records and Single Entry',
      content: `TOPICS/CONTENTS/NOTES:
9. Incomplete Records and Single Entry
a. Determination of missing figures
b. Preparation of final accounts from incomplete records
c. Conversion of single entry to double entry

OBJECTIVES:
Candidates should be able to:
i. determine proprietor’s capital using statement of affairs;
ii. determine the amount of sales, purchases, cash balances, debtors, creditors and expenses by converting single entry to double entry; and
iii. use accounting equations, gross and net profit percentages to determine cost of sales, gross and net profits.`
    },
    {
      name: 'Manufacturing Accounts',
      content: `TOPICS/CONTENTS/NOTES:
10. Manufacturing Accounts
a. Cost classification
b. Cost apportionment
c. Preparation of manufacturing account 

OBJECTIVES:
Candidates should be able to:
i. identify the reason for preparing manufacturing account;
ii. calculate prime cost, overhead cost, production cost and total cost; and
iii. determine the basis of cost apportionment among production, administration, selling and distribution.`
    },
    {
      name: 'Accounts of Not-For-Profit-Making Organizations',
      content: `TOPICS/CONTENTS/NOTES:
11. Accounts of Not-For-Profit-Making Organizations
a. Objectives
b. Receipts and payments account
c. Income and expenditure account
d. Statement of financial position

OBJECTIVES:
Candidates should be able to:
i. distinguish between profit oriented and Not-For-Profit-Making Organizations;
ii. determine annual subscription, subscription in arrears and in advance; and
iii. compute the cash balances, accumulated funds, surplus or deficit for the period.`
    },
    {
      name: 'Departmental Accounts',
      content: `TOPICS/CONTENTS/NOTES:
12. Departmental Accounts
a. Objectives
b. Apportionment of expenses
c. Departmental trading and profit and loss account

OBJECTIVES:
Candidates should be able to:
i. identify the reasons for preparing departmental accounts;
ii. determine the expenses and incomes attributable to departments;
iii. compute departmental profit or loss`
    },
    {
      name: 'Branch Accounts',
      content: `TOPICS/CONTENTS/NOTES:
13. Branch Accounts
a. Objectives
b. Branch account in the head office books
c. Head office account
d. Reconciliation of branch and head office books

OBJECTIVES:
Candidates should be able to:
i. understand the reasons for preparing branch accounts;
ii. calculate profit or loss from branches; and
iii. reconcile the difference between branch and head office accounts.`
    },
    {
      name: 'Joint Venture Accounts',
      content: `TOPICS/CONTENTS/NOTES:
14. Joint Venture Accounts
a. Objectives and features
b. Personnel account of venturers
c. Memorandum joint venture accounts

OBJECTIVES:
Candidates should be able to:
i. identify the objectives and features of joint venture;
ii. determine the profit or loss of joint venture.
iii. determine the profit or loss of each venture`
    },
    {
      name: 'Partnership Accounts',
      content: `TOPICS/CONTENTS/NOTES:
15. Partnership Accounts
a. Formation of partnership
b. Profit or loss account
c. Appropriation account 
d. Partners current and capital accounts
e. Treatment of goodwill
f. Admission/retirement of a partner
g. Dissolution of partnership
h. Conversion of a partnership to a company

OBJECTIVES:
Candidates should be able to:
i. understand the procedures for the formation of partnership;
ii. identify the accounts maintained for partnership business;
iii. determine the effects of admission and retirement of a partner;
iv. determine profit or loss on revaluation of assets; and
v. determine the partners’ share of profit or loss on dissolution.`
    },
    {
      name: 'Introduction to Company Accounts',
      content: `TOPICS/CONTENTS/NOTES:
16. Introduction to Company Accounts
a. Formation and classification of companies
b. Issue of shares and debentures
c. Final accounts of companies:
d. Accounting ratios
e. Distinction between capital and revenue reserves

OBJECTIVES:
Candidates should be able to:
i. differentiate between types of companies;
ii. identify the procedures of treating the issue of shares and debentures;
iii. compute the elements of final accounts of companies; and
iv. compute and interpret Accounting ratios such as current, acid test and stock turnover.`
    },
    {
      name: 'Public Sector Accounting',
      content: `TOPICS/CONTENTS/NOTES:
17. Public Sector Accounting
a. Comparison of cash and accrual basis of Accounting
b. Sources of government revenue
c. Capital and recurrent expenditure
d. Consolidated Revenue Fund
e. Statement of assets and liabilities
f. Responsibilities and powers of:
i. The Accountant General
ii. The Auditor General
iii. The Minister of Finance
iv. The Treasurer of Local Government
g. Instruments of financial regulation

OBJECTIVES:
Candidates should be able to:
i. differentiate between public and private sector accounting;
ii. identify the sources of government revenue;
iii. differentiate between capital and recurrent expenditure;
iv. calculate consolidated revenue fund and determine the values of assets and liabilities;
v. identify the duties of the Accountant General, Auditor General, Minister of Finance and Treasurer of Local Government;
vi. distinguish between elements of control in government accounting procedures e.g. warrant, votes, budget and due process certificate`
    },
    {
      name: 'Information Technology in Accounting',
      content: `TOPICS/CONTENTS/NOTES:
18. Information Technology in Accounting
a. Manual and computerized Accounting processing system
b. Procedures involved in data processing
c. Computer hardware and software
d. Advantages and disadvantages of manual and computerize Accounting processing system.

OBJECTIVES:
Candidates should be able to:
i. differentiate between manual and computerized Accounting processing system;
ii. identify the procedures involved in data processing;
iii. relate the different component of computer.
iv. identify the advantages and disadvantages of manual and computerized Accounting processing system.`
    },
    {
      name: 'Recommended Texts',
      content: `RECOMMENDED TEXTS:
1. Adekunle, K.O. (2014). Bounty Financial Accounting for Schools and College, Ibadan: Bounty Press Ltd.
2. Agbasiere, E.A., Ufot C.I and Olugbenga T.E. (2015). New age Financial Accounting SSS Text Books, Anambra: New Age Press Ltd.
3. Ayodele A. (2015). Financial Accounting for Schools and Colleges, Ibadan: Spectrum Books Ltd.
4. Ekwue K. C. (2010). Principles of Accounts, Book 1 & 2, Onitsha: Adson Publishing Company.
5. Femi L. (2013). Simplified and Amplified Financial Accounting.
6. Frankwood and Alan S. (2002). Frankwood’s Business Accounting, Prentice Hall International Edition.
7. Hassan M. M. (2001). Government Accounting, Lagos: Malthouse Press Limited.
8. Ibrahim, R.A and Kazeem R. A (2018). Essential Financial Accounting for Senior Secondary Schools (sixth edition), Ogun State: Tonad Publishers Limited.
9. Igben, R. O. (2004). Financial Accounting Made Simple (Vol. I) Lagos: Roi Publishers.
10. ICAN (2021). Foundation Level Financial Accounting Study Text, Lagos: Institute of Chartered Accountants of Nigeria.
11. Ono, D.I., Oshunnira, M. and Ozurigbo, P.M. (2015). Financial Accounting for Senior Secondary Schools, Ibadan: Hebn Publishers Plc.`
    }
  ]
};

async function importAccounts() {
  console.log('🧾 Starting Full JAMB Principles of Accounts syllabus import...\n');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const topic of ACCOUNTS_SYLLABUS.topics) {
    try {
      const { data, error } = await supabase
        .from('question_sources')
        .insert({
          subject: ACCOUNTS_SYLLABUS.subject,
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
  
  console.log(`\n📊 Accounts Import Summary:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${ACCOUNTS_SYLLABUS.topics.length}`);
}

importAccounts().catch(console.error);