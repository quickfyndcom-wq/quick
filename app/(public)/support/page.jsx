'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orderNumber: '',
    subject: '',
    message: '',
    issue: 'general'
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const response = await axios.post('/api/support/ticket', formData)
      setSuccess(true)
      setFormData({ name: '', email: '', orderNumber: '', subject: '', message: '', issue: 'general' })
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit support ticket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const supportOptions = [
    { icon: '❓', title: 'Quick Answers', desc: 'Find answers to common questions', link: '/faq' },
    { icon: '✓', title: 'Track Order', desc: 'Check your order status', link: '/track-order' },
    { icon: '↩️', title: 'Return Items', desc: 'Start a return or replacement', link: '/return-request' },
    { icon: '💬', title: 'FAQ & Help', desc: 'Browse our help center', link: '/help' },
  ]

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">How Can We Help?</h1>
          <p className="text-blue-100 text-lg">We're here to assist you 24/7</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Quick Support Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {supportOptions.map((option, idx) => (
            <Link key={idx} href={option.link} className="group">
              <div className="bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition text-center">
                <div className="text-3xl mb-3 group-hover:scale-110 transition">{option.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-1">{option.title}</h3>
                <p className="text-slate-600 text-sm">{option.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Submit a Ticket</h2>
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                ✓ Thank you! We've received your message and will respond soon.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                ✗ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Issue Type *</label>
                <select
                  name="issue"
                  value={formData.issue}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                >
                  <option value="general">General Inquiry</option>
                  <option value="order">Order Issue</option>
                  <option value="payment">Payment Problem</option>
                  <option value="return">Return/Refund</option>
                  <option value="shipping">Shipping Delay</option>
                  <option value="product">Product Quality</option>
                  <option value="account">Account Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Order Number (Optional)</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  placeholder="If related to an order"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Brief subject"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your issue in detail..."
                  rows="5"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition"
              >
                {loading ? 'Submitting...' : 'Submit Support Ticket'}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Other Ways to Reach Us</h2>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl">📧</span>
                    <div>
                      <p className="font-medium text-slate-800">Email</p>
                      <a href="mailto:support@QuickFynd.com" className="text-blue-600 hover:underline">support@QuickFynd.com</a>
                      <p className="text-sm text-slate-600 mt-1">We reply within 24 hours</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💬</span>
                    <div>
                      <p className="font-medium text-slate-800">Live Chat</p>
                      <p className="text-slate-600 text-sm mt-1">Chat with our team in real-time during business hours</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-3">Response Time</h3>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li>✓ <strong>24 hours</strong> - Most queries</li>
                <li>✓ <strong>48 hours</strong> - Complex issues</li>
                <li>✓ <strong>1 hour</strong> - Urgent matters</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="text-center py-8 border-t border-slate-200">
          <p className="text-slate-600 mb-4">Still have questions?</p>
          <Link href="/faq" className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-6 py-3 rounded-lg transition">
            Browse our FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
