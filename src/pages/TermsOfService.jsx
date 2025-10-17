// import { Scale, AlertTriangle, CreditCard, Users, Shield, FileText } from 'lucide-react';

// const TermsOfService = () => {
//   return (
//     <div className="min-h-screen bg-black text-white">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center space-x-2 mb-4">
//             <Scale className="w-8 h-8 text-green-500" />
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
//               Terms of Service
//             </h1>
//           </div>
//           <p className="text-gray-400 text-lg">
//             Last updated: {new Date().toLocaleDateString()}
//           </p>
//         </div>

//         {/* Content */}
//         <div className="space-y-8">
//           {/* Introduction */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <FileText className="w-6 h-6 text-blue-500" />
//               <h2 className="text-2xl font-semibold">Agreement to Terms</h2>
//             </div>
//             <p className="text-gray-300 leading-relaxed">
//               Welcome to Sahyadriott. These Terms of Service ("Terms") govern your use of our OTT streaming platform and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.
//             </p>
//           </div>

//           {/* Description of Service */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
//             <p className="text-gray-300 leading-relaxed">
//               Sahyadriott is a streaming platform that provides access to  video content. Our services include streaming, downloading (where available), and related features. Content availability may vary by region and is subject to licensing agreements.
//             </p>
//           </div>

//           {/* User Accounts */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <Users className="w-6 h-6 text-purple-500" />
//               <h2 className="text-2xl font-semibold">User Accounts</h2>
//             </div>

//             <div className="space-y-4 text-gray-300">
//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Account Creation</h3>
//                 <p>To use our services, you must create an account and provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials.</p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Account Security</h3>
//                 <p>You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use or security breaches.</p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Age Requirements</h3>
//                 <p>You must be at least 13 years old to use our services. Users under 18 require parental consent.</p>
//               </div>
//             </div>
//           </div>

//           {/* Subscription and Payment */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <CreditCard className="w-6 h-6 text-yellow-500" />
//               <h2 className="text-2xl font-semibold">Subscription and Payment</h2>
//             </div>

//             <div className="space-y-4 text-gray-300">
//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Subscription Plans</h3>
//                 <p>We offer various subscription plans with different features and pricing. All prices are subject to change with notice.</p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Billing and Renewal</h3>
//                 <p>Subscriptions are billed in advance on a recurring basis. You will be notified of any price changes.</p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Refunds</h3>
//                 <p>Refund policies vary by subscription type and local laws. Generally, we offer refunds within 7 days of purchase for annual subscriptions if minimal usage has occurred.</p>
//               </div>
//             </div>
//           </div>

//           {/* Content Usage */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Content Usage Rights</h2>

//             <div className="space-y-4 text-gray-300">
//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">License Grant</h3>
//                 <p>We grant you a limited, non-exclusive, non-transferable license to access and view content for personal, non-commercial use only.</p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Restrictions</h3>
//                 <p>You may not:
//                   <ul className="list-disc ml-6 mt-2 space-y-1">
//                     <li>Download, copy, or redistribute content (except as explicitly permitted)</li>
//                     <li>Use content for commercial purposes</li>
//                     <li>Share your account credentials with others</li>
//                     <li>Bypass or disable any content protection measures</li>
//                     <li>Use automated tools to access our services</li>
//                   </ul>
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* User Conduct */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <AlertTriangle className="w-6 h-6 text-red-500" />
//               <h2 className="text-2xl font-semibold">User Conduct</h2>
//             </div>

//             <div className="text-gray-300 space-y-4">
//               <p>You agree not to:</p>
//               <ul className="list-disc ml-6 space-y-2">
//                 <li>Use our services for any illegal or unauthorized purpose</li>
//                 <li>Violate laws in your jurisdiction</li>
//                 <li>Infringe on intellectual property rights</li>
//                 <li>Transmit viruses or malicious code</li>
//                 <li>Attempt to gain unauthorized access to our systems</li>
//                 <li>Harass, abuse, or harm other users</li>
//                 <li>Use our services to distribute inappropriate content</li>
//               </ul>
//             </div>
//           </div>

//           {/* Intellectual Property */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
//             <p className="text-gray-300 leading-relaxed">
//               All content, features, and functionality of Sahyadriott are owned by us or our licensors and are protected by copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without explicit permission.
//             </p>
//           </div>

//           {/* Disclaimer of Warranties */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Disclaimer of Warranties</h2>
//             <p className="text-gray-300 leading-relaxed">
//               Our services are provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including but not limited to merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee uninterrupted or error-free service.
//             </p>
//           </div>

//           {/* Limitation of Liability */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
//             <p className="text-gray-300 leading-relaxed">
//               To the maximum extent permitted by law, Sahyadriott shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the amount paid by you in the twelve months preceding the claim.
//             </p>
//           </div>

//           {/* Indemnification */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Indemnification</h2>
//             <p className="text-gray-300 leading-relaxed">
//               You agree to indemnify and hold Sahyadriott harmless from any claims, damages, losses, costs, and expenses arising from your use of our services, violation of these Terms, or infringement of any rights of another party.
//             </p>
//           </div>

//           {/* Termination */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Termination</h2>
//             <div className="text-gray-300 space-y-3">
//               <p>We may terminate or suspend your account and access to our services:</p>
//               <ul className="list-disc ml-6 space-y-1">
//                 <li>For violation of these Terms</li>
//                 <li>For fraudulent or illegal activity</li>
//                 <li>For non-payment of fees</li>
//                 <li>At our discretion for business reasons</li>
//               </ul>
//               <p>You may terminate your account at any time by contacting support or through your account settings.</p>
//             </div>
//           </div>

//           {/* Changes to Terms */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
//             <p className="text-gray-300 leading-relaxed">
//               We reserve the right to modify these Terms at any time. We will notify users of material changes via email or platform notifications. Continued use of our services after changes constitutes acceptance of the modified Terms.
//             </p>
//           </div>

//           {/* Governing Law */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Governing Law</h2>
//             <p className="text-gray-300 leading-relaxed">
//               These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our services shall be subject to the exclusive jurisdiction of the courts in [Your Jurisdiction].
//             </p>
//           </div>

//           {/* Contact Information */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
//             <p className="text-gray-300 leading-relaxed mb-4">
//               If you have questions about these Terms of Service, please contact us:
//             </p>
//             <div className="text-gray-300 space-y-2">
//               <p><strong>Email:</strong> legal@Sahyadriottott.com</p>
             
//               <p><strong>Phone:</strong> +91 9999999999</p>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="mt-12 pt-8 border-t border-gray-800 text-center">
//           <p className="text-gray-400">
//             © {new Date().getFullYear()} Sahyadriott. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TermsOfService;















import { Shield, FileText, Trash2, Mail, Phone } from 'lucide-react';

const DataDeletionPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-8 h-8 text-green-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-600 bg-clip-text text-transparent">
              Data Deletion Policy
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Last updated: October 17, 2025
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Introduction */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-semibold">Introduction</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              At Sahyadriott ("Sahyadriott", "we", "our", or "us"), we respect your right to privacy and data protection. This Data Deletion Policy explains how users can request deletion of their personal data and what information may be retained as required by law or for legitimate business purposes.
            </p>
          </div>

          {/* Right to Request Deletion */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-semibold">Your Right to Request Deletion</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              You have the right to request deletion of your personal information collected through our:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Mobile application</li>
                <li>Website[](https://sahyadriott.com)</li>
                <li>Subscription or account registration forms</li>
              </ul>
              We ensure that once a valid deletion request is received, your data will be permanently and securely removed from our systems within a reasonable timeframe.
            </p>
          </div>

          {/* How to Request Deletion */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-semibold">How to Request Deletion</h2>
            </div>
            <div className="space-y-4 text-gray-300">
              <div>
                <h3 className="text-lg font-medium text-white mb-2">In-App Option</h3>
                <p>
                  If available, navigate to: Profile &gt; Settings &gt; Delete Account. Confirm your choice. Your account and associated data will be scheduled for deletion.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white mb-2">Email Request</h3>
                <p>
                  Send an email to <a href="mailto:privacy@sahyadriott.com" className="text-blue-400 hover:underline">privacy@sahyadriott.com</a> with the subject: "Request for Account Deletion". Include the following:
                  <ul className="list-disc ml-6 mt-2 space-y-1">
                    <li>Registered email address or phone number</li>
                    <li>Any relevant user ID (if applicable)</li>
                  </ul>
                  We will verify your identity and begin the deletion process.
                </p>
              </div>
            </div>
          </div>

          {/* What Happens After Deletion */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">What Happens After Deletion</h2>
            <p className="text-gray-300 leading-relaxed">
              Upon successful deletion:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Your account will be permanently deactivated.</li>
                <li>All personal details (name, email, phone, payment history, watch history) will be deleted.</li>
                <li>Payment details stored by Razorpay or Google Play Billing will be removed according to their privacy policies.</li>
                <li>Analytics and technical data will be anonymized and retained only for app performance statistics (non-identifiable).</li>
              </ul>
            </p>
          </div>

          {/* Retention Exceptions */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Retention Exceptions</h2>
            <p className="text-gray-300 leading-relaxed">
              We may retain limited information only where required by law or for legitimate reasons, including:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Payment and tax records for compliance with financial regulations.</li>
                <li>Fraud prevention data or records necessary to protect Sahyadriott's legal interests.</li>
                <li>Backup and archival systems, which are periodically purged and overwritten.</li>
              </ul>
            </p>
          </div>

          {/* Timeline for Data Deletion */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Timeline for Data Deletion</h2>
            <p className="text-gray-300 leading-relaxed">
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Deletion requests are acknowledged within 72 hours.</li>
                <li>Complete removal (including backups) is processed within 30 days.</li>
                <li>Confirmation will be emailed once the deletion is finalized.</li>
              </ul>
            </p>
          </div>

          {/* Third-Party Services */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <p className="text-gray-300 leading-relaxed">
              If you used a third-party service (such as Razorpay or Google Play) to make purchases or log in, you must also contact those providers to delete data stored with them. We cannot access or erase data held by third-party providers directly.
            </p>
          </div>

          {/* Compliance */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Compliance</h2>
            <p className="text-gray-300 leading-relaxed">
              This Data Deletion Policy complies with:
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Google Play User Data Policy</li>
                <li>Digital Personal Data Protection Act, 2023 (India)</li>
                <li>General Data Protection Regulation (GDPR)</li>
              </ul>
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Phone className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-semibold">Contact Information</h2>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              For all data deletion or privacy-related requests, contact:
            </p>
            <div className="text-gray-300 space-y-2">
              <p><strong>Website:</strong> <a href="https://sahyadriott.com" className="text-blue-400 hover:underline">https://sahyadriott.com</a></p>
              <p><strong>Email:</strong> <a href="mailto:privacy@sahyadriott.com" className="text-blue-400 hover:underline">privacy@sahyadriott.com</a></p>
              <p><strong>Phone:</strong> +91 9999999999</p>
         
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Sahyadriott. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DataDeletionPolicy;