const https = require('https');
const supabase = require('../supabaseClient');

const paymentService = {
  // Create Paystack payment link for subscription
  async createSubscriptionPayment(tutorId, planId, callbackUrl) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment variables.');
    }

    const { data: plan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single();

    // Get actual tutor email from auth
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(tutorId);
    const tutorEmail = authUser?.email || `tutor_${tutorId}@example.com`;

    const params = JSON.stringify({
      email: tutorEmail,
      amount: Math.round(plan.price * 100), // Paystack expects amount in kobo
      currency: plan.currency,
      callback_url: callbackUrl,
      metadata: {
        tutorId,
        planId,
        type: 'subscription'
      }
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(params)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const response = JSON.parse(data);
          if (response.status) {
            resolve({ success: true, reference: response.data.reference, url: response.data.authorization_url });
          } else {
            reject(new Error(response.message));
          }
        });
      });

      req.on('error', reject);
      req.write(params);
      req.end();
    });
  },

  // Create Paystack payment for test purchase
  async createTestPurchasePayment(studentId, testId, callbackUrl) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment variables.');
    }

    const { data: paidTest } = await supabase
      .from('paid_tests')
      .select('*, tc_question_sets(title)')
      .eq('test_id', testId)
      .single();

    // Get actual student email from auth
    const { data: { user: studentUser } } = await supabase.auth.admin.getUserById(studentId);
    const studentEmail = studentUser?.email || `student_${studentId}@example.com`;

    const params = JSON.stringify({
      email: studentEmail,
      amount: Math.round(paidTest.price * 100), // Paystack expects amount in kobo
      currency: paidTest.currency,
      callback_url: callbackUrl,
      metadata: {
        studentId,
        testId,
        paidTestId: paidTest.id,
        type: 'test_purchase'
      }
    });

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: '/transaction/initialize',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(params)
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const response = JSON.parse(data);
          if (response.status) {
            resolve({ success: true, reference: response.data.reference, url: response.data.authorization_url });
          } else {
            reject(new Error(response.message));
          }
        });
      });

      req.on('error', reject);
      req.write(params);
      req.end();
    });
  },

  // Verify Paystack payment
  async verifyPayment(reference) {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error('Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment variables.');
    }

    const options = {
      hostname: 'api.paystack.co',
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          const response = JSON.parse(data);
          if (response.status && response.data.status === 'success') {
            resolve(this.handlePaymentSuccess(response.data));
          } else {
            reject(new Error(response.message || 'Payment verification failed'));
          }
        });
      });

      req.on('error', reject);
      req.end();
    });
  },

  async handlePaymentSuccess(paymentData) {
    const { tutorId, planId, studentId, testId, paidTestId, type } = paymentData.metadata;

    if (type === 'subscription' && tutorId && planId) {
      // Subscription payment
      await supabase.from('tutor_subscriptions').insert({
        tutor_id: tutorId,
        plan_id: planId,
        status: 'active',
        payment_method: 'paystack',
        paystack_reference: paymentData.reference,
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    } else if (type === 'test_purchase' && studentId && testId) {
      // Test purchase
      await supabase.from('test_purchases').insert({
        student_id: studentId,
        test_id: testId,
        paid_test_id: paidTestId,
        amount_paid: paymentData.amount / 100,
        payment_status: 'completed',
        payment_method: 'paystack',
        paystack_reference: paymentData.reference
      });

      // Update sales count
      await supabase.rpc('increment', {
        table_name: 'paid_tests',
        row_id: paidTestId,
        column_name: 'sales_count'
      });
    }

    return { success: true };
  },

  // Get tutor earnings
  async getTutorEarnings(tutorId) {
    const { data, error } = await supabase
      .from('tutor_earnings')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const total = data.reduce((sum, e) => sum + parseFloat(e.net_amount), 0);
    const pending = data.filter(e => e.status === 'pending').reduce((sum, e) => sum + parseFloat(e.net_amount), 0);
    const paid = data.filter(e => e.status === 'paid').reduce((sum, e) => sum + parseFloat(e.net_amount), 0);

    return { success: true, earnings: data, summary: { total, pending, paid } };
  }
};

module.exports = paymentService;