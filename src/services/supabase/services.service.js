import { supabase } from '../../lib/supabase'
import cleanWalletService from '../cleanWallet.service'

export class ServicesService {
  // Get all available services
  static async getServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get service by ID
  static async getService(serviceId) {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', serviceId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Purchase service
  static async purchaseService(userId, serviceId, quantity = 1) {
    try {
      // Get service details
      const serviceResult = await this.getService(serviceId)
      if (!serviceResult.success) throw new Error(serviceResult.error)
      
      const service = serviceResult.data
      const totalAmount = service.price * quantity
      const reference = `${service.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Debit wallet
      const debitResult = await cleanWalletService.deductFromWallet(
        totalAmount,
        `Purchase of ${quantity}x ${service.name}`
      )

      if (!debitResult.success) throw new Error(debitResult.error)

      // Create purchased service records
      const purchasedServices = []
      for (let i = 0; i < quantity; i++) {
        const serialNumber = this.generateSerialNumber(service.type)
        const pinNumber = this.generatePinNumber()
        
        purchasedServices.push({
          user_id: userId,
          service_id: serviceId,
          transaction_id: debitResult.data.id,
          serial_number: serialNumber,
          pin_number: pinNumber,
          expires_at: this.calculateExpiryDate(service.type)
        })
      }

      const { data, error } = await supabase
        .from('purchased_services')
        .insert(purchasedServices)
        .select()

      if (error) throw error
      return { success: true, data, transaction: debitResult.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Get user's purchased services
  static async getUserPurchasedServices(userId) {
    try {
      const { data, error } = await supabase
        .from('purchased_services')
        .select(`
          *,
          services (name, type, description),
          transactions (amount, created_at)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Mark service as used
  static async markServiceAsUsed(purchasedServiceId) {
    try {
      const { data, error } = await supabase
        .from('purchased_services')
        .update({
          is_used: true,
          used_at: new Date().toISOString()
        })
        .eq('id', purchasedServiceId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Helper methods
  static generateSerialNumber(serviceType) {
    const prefix = {
      'result_checker': 'RC',
      'jamb_service': 'JS',
      'course_advisor': 'CA',
      'ai_examiner': 'AI'
    }[serviceType] || 'SV'

    const timestamp = Date.now().toString().slice(-6)
    const random = Math.random().toString(36).substr(2, 4).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }

  static generatePinNumber() {
    return Math.floor(100000000 + Math.random() * 900000000).toString()
  }

  static calculateExpiryDate(serviceType) {
    const now = new Date()
    const expiryDays = {
      'result_checker': 365, // 1 year
      'jamb_service': 180,   // 6 months
      'course_advisor': null, // No expiry
      'ai_examiner': 90      // 3 months
    }[serviceType] || 365

    if (!expiryDays) return null
    
    now.setDate(now.getDate() + expiryDays)
    return now.toISOString()
  }
}

export default ServicesService