// import { Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react';

// const PrivacyPolicy = () => {
//   return (
//     <div className="min-h-screen bg-black text-white">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center space-x-2 mb-4">
//             <Shield className="w-8 h-8 text-blue-500" />
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
//               Privacy Policy
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
//               <h2 className="text-2xl font-semibold">Introduction</h2>
//             </div>
//             <p className="text-gray-300 leading-relaxed">
//               Welcome to Sahyadriott . We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our OTT streaming platform and services.
//             </p>
//           </div>

//           {/* Information We Collect */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <Database className="w-6 h-6 text-green-500" />
//               <h2 className="text-2xl font-semibold">Information We Collect</h2>
//             </div>

//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-xl font-medium text-white mb-3">Personal Information</h3>
//                 <ul className="text-gray-300 space-y-2 ml-4">
//                   <li>• Name, email address, and contact information</li>
//                   <li>• Payment information and billing details</li>
//                   <li>• Account credentials and profile information</li>
//                   <li>• Subscription preferences and history</li>
//                 </ul>
//               </div>

//               <div>
//                 <h3 className="text-xl font-medium text-white mb-3">Usage Information</h3>
//                 <ul className="text-gray-300 space-y-2 ml-4">
//                   <li>• Content viewing history and preferences</li>
//                   <li>• Device information and app usage statistics</li>
//                   <li>• Search queries and browsing behavior</li>
//                   <li>• Location data and time zone information</li>
//                 </ul>
//               </div>

//               <div>
//                 <h3 className="text-xl font-medium text-white mb-3">Technical Information</h3>
//                 <ul className="text-gray-300 space-y-2 ml-4">
//                   <li>• IP address and device identifiers</li>
//                   <li>• Browser type and version</li>
//                   <li>• Operating system and app version</li>
//                   <li>• Network and connection information</li>
//                 </ul>
//               </div>
//             </div>
//           </div>

//           {/* How We Use Your Information */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <Eye className="w-6 h-6 text-purple-500" />
//               <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
//             </div>

//             <div className="text-gray-300 space-y-3">
//               <p>We use the collected information for various purposes, including:</p>
//               <ul className="space-y-2 ml-4">
//                 <li>• Providing and maintaining our streaming services</li>
//                 <li>• Processing payments and managing subscriptions</li>
//                 <li>• Personalizing your viewing experience and recommendations</li>
//                 <li>• Improving our platform and developing new features</li>
//                 <li>• Communicating with you about updates and promotions</li>
//                 <li>• Ensuring security and preventing fraud</li>
//                 <li>• Complying with legal obligations and protecting our rights</li>
//               </ul>
//             </div>
//           </div>

//           {/* Information Sharing */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <Users className="w-6 h-6 text-yellow-500" />
//               <h2 className="text-2xl font-semibold">Information Sharing and Disclosure</h2>
//             </div>

//             <div className="text-gray-300 space-y-4">
//               <p>We may share your information in the following circumstances:</p>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Service Providers</h3>
//                 <p>We share information with trusted third-party service providers who assist us in operating our platform, processing payments, and delivering content.</p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Legal Requirements</h3>
//                 <p>We may disclose your information if required by law or if we believe such action is necessary to comply with legal processes or protect our rights.</p>
//               </div>

//               <div>
//                 <h3 className="text-lg font-medium text-white mb-2">Business Transfers</h3>
//                 <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction.</p>
//               </div>
//             </div>
//           </div>

//           {/* Data Security */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <Lock className="w-6 h-6 text-red-500" />
//               <h2 className="text-2xl font-semibold">Data Security</h2>
//             </div>

//             <p className="text-gray-300 leading-relaxed">
//               We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure servers, and regular security assessments. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
//             </p>
//           </div>

//           {/* Your Rights and Choices */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <div className="flex items-center space-x-3 mb-4">
//               <Shield className="w-6 h-6 text-blue-500" />
//               <h2 className="text-2xl font-semibold">Your Rights and Choices</h2>
//             </div>

//             <div className="text-gray-300 space-y-4">
//               <p>You have the following rights regarding your personal information:</p>

//               <div className="space-y-3">
//                 <div>
//                   <h3 className="text-lg font-medium text-white">Access and Update</h3>
//                   <p>You can access and update your account information through your profile settings.</p>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-medium text-white">Data Deletion</h3>
//                   <p>You may request deletion of your personal information, subject to legal and legitimate business requirements.</p>
//                 </div>

//                 <div>
//                   <h3 className="text-lg font-medium text-white">Marketing Communications</h3>
//                   <p>You can opt out of marketing communications by adjusting your notification preferences.</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Children's Privacy */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
//             <p className="text-gray-300 leading-relaxed">
//               Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
//             </p>
//           </div>

//           {/* International Data Transfers */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
//             <p className="text-gray-300 leading-relaxed">
//               Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable data protection laws and implement appropriate safeguards.
//             </p>
//           </div>

//           {/* Changes to This Policy */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
//             <p className="text-gray-300 leading-relaxed">
//               We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our platform and updating the "Last updated" date. Your continued use of our services after such changes constitutes acceptance of the updated policy.
//             </p>
//           </div>

//           {/* Contact Information */}
//           <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
//             <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
//             <p className="text-gray-300 leading-relaxed mb-4">
//               If you have any questions about this Privacy Policy or our data practices, please contact us:
//             </p>
//             <div className="text-gray-300 space-y-2">
//               <p><strong>Email:</strong> privacy@Sahyadriottott.com</p>
             
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

// export default PrivacyPolicy;




















import { Shield, Eye, Lock, Database, Users, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-8 h-8 text-blue-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Privacy Policy
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
              Welcome to Sahyadriott  ("Sahyadriott", "we", "our", or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard your information when you use our OTT streaming platform, mobile application, or related services (collectively, the "Services").
            </p>
          </div>

          {/* Information We Collect */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Database className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-semibold">Information We Collect</h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-medium text-white mb-3">Personal Information</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Name, email address, and contact details</li>
                  <li>• Account credentials and profile information</li>
                  <li>• Payment information and billing details (via Razorpay, Google Play, or other payment partners)</li>
                  <li>• Subscription preferences, plan history, and renewal data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-white mb-3">Usage Information</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• Content viewing history and preferences</li>
                  <li>• Search queries and browsing behavior</li>
                  <li>• App usage statistics and engagement metrics</li>
                  <li>• Device information (model, OS version, unique identifiers)</li>
                  <li>• Location data (approximate city or time zone for regional content)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium text-white mb-3">Technical Information</h3>
                <ul className="text-gray-300 space-y-2 ml-4">
                  <li>• IP address and device identifiers</li>
                  <li>• Browser type and app version</li>
                  <li>• Network and connection information</li>
                  <li>• Crash logs and analytics data (Google Play Console, Firebase, etc.)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* How We Use Your Information */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Eye className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-semibold">How We Use Your Information</h2>
            </div>

            <div className="text-gray-300 space-y-3">
              <p>We use the collected information for various purposes, including:</p>
              <ul className="space-y-2 ml-4">
                <li>• Provide and personalize streaming services</li>
                <li>• Process payments and manage subscriptions</li>
                <li>• Recommend content and improve your experience</li>
                <li>• Communicate updates and offers</li>
                <li>• Prevent fraud and ensure security</li>
                <li>• Comply with legal requirements</li>
              </ul>
            </div>
          </div>

          {/* Information Sharing and Disclosure */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-semibold">Information Sharing and Disclosure</h2>
            </div>

            <div className="text-gray-300 space-y-4">
              <p>We do not sell, rent, or trade your personal information. We may share your data in the following circumstances:</p>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Service Providers</h3>
                <p>We share information with trusted third-party service providers who assist us in operating our platform, processing payments, and delivering content.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Legal Requirements</h3>
                <p>We may disclose your information if required by law or if we believe such action is necessary to comply with legal processes or protect our rights.</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-white mb-2">Business Transfers</h3>
                <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred as part of the transaction with appropriate safeguards.</p>
              </div>
            </div>
          </div>

          {/* Data Security */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="w-6 h-6 text-red-500" />
              <h2 className="text-2xl font-semibold">Data Security</h2>
            </div>

            <p className="text-gray-300 leading-relaxed">
              We use encryption (SSL/TLS), secure servers, limited access controls, and periodic security audits to protect your data. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </div>

          {/* Your Rights and Choices */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-semibold">Your Rights and Choices</h2>
            </div>

            <div className="text-gray-300 space-y-4">
              <p>You have the following rights regarding your personal information:</p>

              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-medium text-white">Access and Update</h3>
                  <p>You can access and correct your information through your profile settings.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Data Deletion</h3>
                  <p>You may request deletion of your personal data, subject to legal and legitimate business requirements.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-white">Marketing Communications</h3>
                  <p>You can manage marketing communication preferences by adjusting your notification settings or contacting us at privacy@sahyadriott.com.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our services are not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </div>

          {/* International Data Transfers */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be processed outside your country under lawful safeguards (standard contractual clauses).
            </p>
          </div>

          {/* Retention of Information */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Retention of Information</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain personal data only as long as necessary for services, legal compliance, or dispute resolution.
            </p>
          </div>

          {/* Changes to This Policy */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Privacy Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy periodically. Continued use after updates implies acceptance. We will notify you of any material changes by posting the new policy on our platform and updating the "Last updated" date.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="text-gray-300 space-y-2">
              <p><strong>Website:</strong> <a href="https://sahyadriott.com" className="text-blue-500 hover:underline">https://sahyadriott.com</a></p>
              <p><strong>Email:</strong> privacy@sahyadriott.com</p>
              <p><strong>Phone:</strong> +91 9999999999</p>
           
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} Sahyadriott . All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;